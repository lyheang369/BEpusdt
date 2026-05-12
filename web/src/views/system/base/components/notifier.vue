<template>
  <a-row align="center" :gutter="[0, 16]">
    <a-col :span="24">
      <a-card title="Notification Settings">
        <a-form :model="form" :rules="rules" :layout="layoutMode" class="base-setting-form" @submit="onSubmit">
          <a-form-item field="notifier_channel" label="Notification Channel">
            <a-select v-model="form.notifier_channel" placeholder="Select notification channel" @change="onChannelChange">
              <a-option
                v-for="channel in channelConfigs"
                :key="channel.value"
                :value="channel.value"
                :disabled="channel.disabled"
              >
                {{ channel.label }}
              </a-option>
            </a-select>
          </a-form-item>

          <template v-for="field in currentChannelFields" :key="field.key">
            <a-form-item :field="field.key" :label="field.label">
              <a-input
                v-model="form.notifier_params[field.key]"
                :placeholder="field.placeholder"
                :type="field.type || 'text'"
                allow-clear
              />
            </a-form-item>
          </template>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">Save Configuration</a-button>
              <a-button v-if="form.notifier_channel !== 'none'" type="outline" @click="onTest" :loading="testLoading">
                Push Test
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { useDevicesSize } from "@/hooks/useDevicesSize";

import { Message } from "@arco-design/web-vue";
import { notifierAPI, notifierTestAPI } from "@/api/modules/conf/index";

const emit = defineEmits(["refresh"]);
const data = defineModel() as any;
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => (isMobile.value ? "vertical" : "horizontal"));

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  required: boolean;
  message?: string;
  validator?: string;
}

interface ChannelConfig {
  value: string;
  label: string;
  disabled: boolean;
  fields: FieldConfig[];
}

interface FormData {
  notifier_channel: string;
  notifier_params: Record<string, string>;
}

const channelConfigs: ChannelConfig[] = [
  {
    value: "none",
    label: "Disable Notifications",
    disabled: false,
    fields: []
  },
  {
    value: "telegram",
    label: "Telegram",
    disabled: false,
    fields: [
      {
        key: "bot_token",
        label: "Bot Token",
        placeholder: "Enter Telegram Bot Token",
        required: true,
        message: "Bot Token  is required"
      },
      { key: "chat_id", label: "Chat ID", placeholder: "Enter Telegram Chat ID", required: true, message: "Chat ID  is required" },
      { key: "topic_id", label: "Topic ID", placeholder: "Enter Telegram Topic ID", required: false }
    ]
  },
  {
    value: "wechat",
    label: "WeCom (in development)",
    disabled: true,
    fields: [
      {
        key: "webhook_url",
        label: "Webhook URL",
        placeholder: "Enter WeCom Webhook URL",
        type: "url",
        required: true,
        message: "Webhook URL is required",
        validator: "url"
      }
    ]
  },
  {
    value: "email",
    label: "Email (in development)",
    disabled: true,
    fields: [
      {
        key: "email",
        label: "Email Address",
        placeholder: "Enter email address",
        type: "email",
        required: true,
        message: "Email Address is required",
        validator: "email"
      },
      {
        key: "smtp_server",
        label: "SMTP Server",
        placeholder: "Enter SMTP server address",
        required: true,
        message: "SMTP Server is required"
      }
    ]
  }
];

const form = ref<FormData>({
  notifier_channel: "telegram",
  notifier_params: {}
});

const testLoading = ref<boolean>(false);

const currentChannelFields = computed<FieldConfig[]>(
  () => channelConfigs.find(config => config.value === form.value.notifier_channel)?.fields || []
);

const currentChannelParamKeys = computed<string[]>(() => currentChannelFields.value.map(field => field.key));

const rules = computed(() => {
  const baseRules: Record<string, any[]> = {
    notifier_channel: [{ required: true, message: "Select notification channel" }]
  };

  currentChannelFields.value.forEach(field => {
    if (field.required) {
      const fieldPath = `notifier_params.${field.key}`;
      const fieldRules: any[] = [{ required: true, message: field.message }];

      if (field.validator === "email") {
        fieldRules.push({ type: "email", message: "Enter a valid email format" });
      } else if (field.validator === "url") {
        fieldRules.push({ type: "url", message: "Enter a valid URL format" });
      }

      baseRules[fieldPath] = fieldRules;
    }
  });

  return baseRules;
});

const initParams = (): Record<string, string> => {
  const params: Record<string, string> = {};
  channelConfigs.forEach(config => {
    config.fields.forEach(field => {
      params[field.key] = "";
    });
  });
  return params;
};

const onChannelChange = (): void => {
  form.value.notifier_params = initParams();
};

const onSubmit = async ({ errors }: ArcoDesign.ArcoSubmit): Promise<void> => {
  if (errors) return;

  try {
    const filteredParams: Record<string, string> = {};
    currentChannelParamKeys.value.forEach(key => {
      const value = form.value.notifier_params[key];
      if (value !== undefined && value !== null) {
        filteredParams[key] = String(value);
      }
    });

    const response = await notifierAPI({
      channel: form.value.notifier_channel,
      params: filteredParams
    });

    if (response?.code === 200) {
      Message.success("Configuration saved！");
      emit("refresh");
    } else {
      Message.error(response?.msg || "Failed to save configuration");
    }
  } catch (error: any) {
    console.error("Failed to save configuration:", error);
    Message.error("Failed to save configuration. Please try again later.");
  }
};

const onTest = async (): Promise<void> => {
  try {
    testLoading.value = true;

    const filteredParams: Record<string, string> = {};
    currentChannelParamKeys.value.forEach(key => {
      const value = form.value.notifier_params[key];
      if (value !== undefined && value !== null) {
        filteredParams[key] = String(value);
      }
    });

    const response = await notifierTestAPI({
      channel: form.value.notifier_channel,
      params: filteredParams
    });

    if (response?.code === 200) {
      Message.success("Push test successful！");
    } else {
      Message.error(response?.msg || "Push test failed");
    }
  } catch (error: any) {
    console.error("Push test failed:", error);
    Message.error("Push test failed. Please try again later.");
  } finally {
    testLoading.value = false;
  }
};

watch(
  () => data.value,
  () => {
    if (data.value) {
      form.value.notifier_channel = String(data.value.notifier_channel || "telegram");

      if (data.value.notifier_params) {
        try {
          const params =
            typeof data.value.notifier_params === "string" ? JSON.parse(data.value.notifier_params) : data.value.notifier_params;

          const parsedParams: Record<string, string> = {};
          Object.keys(params).forEach(key => {
            parsedParams[key] = String(params[key] || "");
          });

          form.value.notifier_params = { ...initParams(), ...parsedParams };
        } catch (e) {
          console.error("Failed to parse notifier_params:", e);
          form.value.notifier_params = initParams();
        }
      } else {
        form.value.notifier_params = initParams();
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  form.value.notifier_params = initParams();
});
</script>

<style lang="scss" scoped>
.row-title {
  font-size: $font-size-title-1;
}
</style>
