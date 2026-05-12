<template>
  <a-row align="center" :gutter="[0, 16]">
    <a-col :span="24">
      <a-card title="API Settings">
        <a-alert type="info" style="margin-bottom: 16px">
          The system is compatible with the Caihong EasyPay <strong>submit.php</strong> payment collection API. During integration, PID is fixed to <strong>1000</strong>, and KEY
          and KEY must match the integration token.
        </a-alert>
        <a-form :model="form" :rules="rules" :layout="layoutMode" class="base-setting-form" @submit="onSubmit">
          <a-form-item field="api_auth_token" label="Integration Token" extra="Authentication token for API integration. Keep it safe.">
            <a-input-group class="token-input-group">
              <a-input-password v-model="form.api_auth_token" placeholder="Enter Auth Token" readonly />
              <a-button type="primary" @click="handleResetToken">Reset</a-button>
            </a-input-group>
          </a-form-item>

          <a-form-item field="api_app_uri" label="Application URI" extra="Application URI for API integration, the frontend cashier address">
            <a-input v-model="form.api_app_uri" placeholder="http(s)://your-host-uri" allow-clear />
          </a-form-item>

          <a-form-item
            field="payment_static_path"
            label="Cashier Static Assets"
            extra="Cashier static asset path. You can customize the frontend cashier style with this option. Do not change it unless you understand it, otherwise the cashier may fail. Restart required."
          >
            <a-input v-model="form.payment_static_path" placeholder="/var/lib/bepusdt/payment/" allow-clear />
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="primary" html-type="submit">Submit</a-button>
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
import { setsConfAPI, resetApiAuthToken } from "@/api/modules/conf/index";

const emit = defineEmits(["refresh"]);
const data = defineModel() as any;
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => (isMobile.value ? "vertical" : "horizontal"));

const form = ref({ api_auth_token: "", api_app_uri: "", payment_static_path: "" });
const rules = {};

const handleResetToken = async () => {
  try {
    await resetApiAuthToken({});
    Message.success("Token reset successfully");
    emit("refresh");
  } catch {
    Message.error("Failed to reset token");
  }
};

const onSubmit = async ({ errors }: ArcoDesign.ArcoSubmit) => {
  if (errors) return;

  await setsConfAPI([
    {
      key: "api_app_uri",
      value: form.value.api_app_uri
    },
    {
      key: "payment_static_path",
      value: form.value.payment_static_path
    }
  ]);

  Message.success("Saved successfully");

  emit("refresh");
};

watch(
  () => data.value,
  () => {
    form.value.api_auth_token = data.value.api_auth_token;
    form.value.api_app_uri = data.value.api_app_uri;
    form.value.payment_static_path = data.value.payment_static_path;
  }
);
</script>

<style lang="scss" scoped>
.row-title {
  font-size: $font-size-title-1;
}

.token-input-group {
  width: 100%;
  min-width: 0;

  :deep(.arco-input-wrapper) {
    flex: 1;
    min-width: 0;
  }

  :deep(.arco-btn) {
    flex-shrink: 0;
  }
}
</style>
