<template>
  <a-row align="center" :gutter="[0, 16]">
    <a-col :span="24">
      <a-card title="MQTT Publish Settings">
        <a-alert type="info" style="margin-bottom: 16px">
          The system can publish scanned transaction information to an MQTT server. Other systems can subscribe to get data in real time.
          <a-link href="https://github.com/v03413/BEpusdt/blob/main/docs/api/mqtt.md" target="_blank" :hoverable="false">
            View Docs
          </a-link>
        </a-alert>
        <a-alert type="warning" style="margin-bottom: 16px">
          <template #icon><icon-exclamation-circle-fill /></template>
          The current MQTT protocol is <strong>MQTT over TCP</strong>. This feature is enabled only when <strong>Host</strong> and
          <strong>Port</strong> are both configured.
        </a-alert>
        <a-form :model="form" :rules="rules" :layout="layoutMode" class="base-setting-form" @submit="onSubmit">
          <a-form-item field="mqtt_host" label="MQTT Host" extra="MQTT server address">
            <a-input v-model="form.mqtt_host" placeholder="Example：127.0.0.1" allow-clear />
          </a-form-item>

          <a-form-item field="mqtt_port" label="MQTT Port" extra="MQTT server port">
            <a-input v-model="form.mqtt_port" placeholder="Example：1883" allow-clear />
          </a-form-item>

          <a-form-item field="mqtt_user" label="Username" extra="MQTT connection username. Leave empty if none.">
            <a-input v-model="form.mqtt_user" placeholder="EnterUsername" allow-clear />
          </a-form-item>

          <a-form-item field="mqtt_pass" label="Password" extra="MQTT connection password. Leave empty if none.">
            <a-input-password v-model="form.mqtt_pass" placeholder="Enter password" allow-clear />
          </a-form-item>

          <a-form-item
            field="mqtt_topic_prefix"
            label="Message Topic Prefix"
            extra="Topic path prefix for message publishing. Only letters, numbers, underscores, and slashes are allowed. Default: bepusdt."
          >
            <a-input v-model="form.mqtt_topic_prefix" placeholder="Example：bepusdt" allow-clear />
          </a-form-item>

          <a-form-item field="mqtt_publish_qos" label="Publish QoS" extra="Message publish quality of service level">
            <a-radio-group v-model="form.mqtt_publish_qos">
              <a-radio value="0">0 - At most once</a-radio>
              <a-radio value="1">1 - At least once</a-radio>
              <a-radio value="2">2 - Exactly once</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item field="mqtt_networks" label="Blockchain Networks" extra="Select blockchain networks to monitor continuously. Multiple selections allowed.">
            <a-checkbox-group v-model="networksSelected" class="mqtt-network-group">
              <a-checkbox value="tron">Tron</a-checkbox>
              <a-checkbox value="bsc">Bsc</a-checkbox>
              <a-checkbox value="polygon">Polygon</a-checkbox>
              <a-checkbox value="ethereum">Ethereum</a-checkbox>
              <a-checkbox value="aptos">Aptos</a-checkbox>
              <a-checkbox value="solana">Solana</a-checkbox>
              <a-checkbox value="xlayer">XLayer</a-checkbox>
              <a-checkbox value="plasma">Plasma</a-checkbox>
              <a-checkbox value="arbitrum">Arbitrum</a-checkbox>
              <a-checkbox value="base">Base</a-checkbox>
            </a-checkbox-group>
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
import { setsConfAPI } from "@/api/modules/conf/index";

const emit = defineEmits(["refresh"]);
const data = defineModel() as any;
const { isMobile } = useDevicesSize();
const layoutMode = computed(() => (isMobile.value ? "vertical" : "horizontal"));

const rules = {
  mqtt_topic_prefix: [
    {
      validator: (value: string, callback: (error?: string) => void) => {
        if (!value) return callback();
        if (!/^[a-zA-Z0-9_/]+$/.test(value)) {
          return callback("Topic prefix may only contain letters, numbers, underscores, and slashes");
        }
        if (value.startsWith("/") || value.endsWith("/")) {
          return callback("Topic prefix cannot start or end with a slash");
        }
        if (value.includes("//")) {
          return callback("Topic prefix cannot contain consecutive slashes");
        }
        callback();
      }
    }
  ]
};

const form = ref({
  mqtt_host: "",
  mqtt_port: "",
  mqtt_user: "",
  mqtt_pass: "",
  mqtt_publish_qos: "0",
  mqtt_networks: "",
  mqtt_topic_prefix: "bepusdt"
});

const networksSelected = computed({
  get() {
    return form.value.mqtt_networks ? form.value.mqtt_networks.split(",").filter(Boolean) : [];
  },
  set(val: string[]) {
    form.value.mqtt_networks = val.join(",");
  }
});

const onSubmit = async ({ errors }: ArcoDesign.ArcoSubmit) => {
  if (errors) return;

  await setsConfAPI([
    { key: "mqtt_host", value: form.value.mqtt_host },
    { key: "mqtt_port", value: form.value.mqtt_port },
    { key: "mqtt_user", value: form.value.mqtt_user },
    { key: "mqtt_pass", value: form.value.mqtt_pass },
    { key: "mqtt_publish_qos", value: form.value.mqtt_publish_qos },
    { key: "mqtt_networks", value: form.value.mqtt_networks },
    { key: "mqtt_topic_prefix", value: form.value.mqtt_topic_prefix || "bepusdt" }
  ]);

  Message.success("Saved successfully");
  emit("refresh");
};

watch(
  () => data.value,
  () => {
    form.value.mqtt_host = data.value.mqtt_host ?? "";
    form.value.mqtt_port = data.value.mqtt_port ?? "";
    form.value.mqtt_user = data.value.mqtt_user ?? "";
    form.value.mqtt_pass = data.value.mqtt_pass ?? "";
    form.value.mqtt_publish_qos = data.value.mqtt_publish_qos ?? "0";
    form.value.mqtt_networks = data.value.mqtt_networks ?? "";
    form.value.mqtt_topic_prefix = data.value.mqtt_topic_prefix ?? "bepusdt";
  }
);
</script>

<style lang="scss" scoped>
.mqtt-network-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px 12px;
  width: 100%;

  :deep(.arco-checkbox) {
    min-height: 40px;
    margin-right: 0;
    padding: 8px 10px;
    border: 1px solid $color-border-2;
    border-radius: 4px;
    background: $color-fill-1;
    touch-action: manipulation;
  }

  :deep(.arco-checkbox-checked) {
    border-color: $color-primary;
    background: rgba(var(--primary-6), 0.08);
  }

  :deep(.arco-checkbox-label) {
    line-height: 22px;
  }
}
</style>
