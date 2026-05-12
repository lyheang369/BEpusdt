<template>
  <div class="snow-page">
    <a-spin :loading="loading" tip="Loading..." class="full-height">
      <!-- warning banner -->
      <a-alert type="warning" show-icon class="warning-banner">
        <template #icon>
          <icon-exclamation-circle />
        </template>
        <div>
          <strong>Important Reminder:</strong>
          Changing RPC nodes is generally not recommended unless you understand the blockchain network and can ensure node availability and stability.
        </div>
      </a-alert>

      <!-- main content -->
      <a-card :bordered="false" class="main-card">
        <template #title>
          <div class="card-title">
            <div class="title-icon">
              <icon-settings />
            </div>
            <span>Blockchain Network Configuration</span>
          </div>
        </template>

        <template #extra>
          <a-space size="small" wrap>
            <a-button @click="handleReset" :loading="loading" size="small" class="action-btn">
              <template #icon>
                <icon-refresh />
              </template>
              Reset
            </a-button>
            <a-button type="primary" @click="handleSave" :loading="saveLoading" size="small" class="action-btn save-btn">
              <template #icon>
                <icon-save />
              </template>
              Save Configuration
            </a-button>
          </a-space>
        </template>

        <div class="form-container">
          <a-form :model="formData" layout="vertical" ref="formRef">
            <!-- Tron Networkconfiguration section -->
            <div class="tron-section">
              <div class="section-header">
                <div class="header-icon">
                  <icon-fire />
                </div>
                <span class="header-title">Tron Network</span>
              </div>

              <a-row :gutter="16">
                <a-col :xs="24" :sm="24" :md="12">
                  <a-form-item
                    field="rpc_endpoint_tron"
                    label="Tron RPC"
                    :rules="[{ required: true, message: 'Enter Tron RPC' }]"
                    class="network-form-item"
                  >
                    <a-input
                      v-model="formData.rpc_endpoint_tron"
                      placeholder="Enter Tron RPC"
                      allow-clear
                      size="small"
                      class="network-input tron-input"
                    >
                      <template #prefix>
                        <div class="input-icon">
                          <icon-link />
                        </div>
                      </template>
                    </a-input>
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item field="rpc_endpoint_tron_grid_api_key" class="network-form-item">
                    <template #label>
                      <div class="tron-grid-label">
                        <span class="label-with-tip">
                          <span>Tron Grid Api Key</span>
                          <a-tooltip content="Configuring dedicated API keys can improve block scanning stability. Separate multiple keys with commas." position="top">
                            <icon-question-circle class="tip-icon" />
                          </a-tooltip>
                          <span class="optional-tag">(optional)</span>
                        </span>
                        <a
                          href="https://github.com/v03413/BEpusdt/blob/main/docs/tron-grid/readme.md"
                          target="_blank"
                          class="help-link"
                        >
                          <icon-question-circle />
                          How to get it
                        </a>
                      </div>
                    </template>

                    <a-textarea
                      v-model="formData.rpc_endpoint_tron_grid_api_key"
                      placeholder="Enter Tron Grid API Key (optional). Separate multiple keys with commas."
                      allow-clear
                      size="small"
                      class="network-input tron-input tron-grid-api-key-input"
                      :auto-size="{ minRows: 1, maxRows: 6 }"
                    >
                      <template>
                        <div class="input-icon">
                          <icon-safe />
                        </div>
                      </template>
                    </a-textarea>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>

            <!-- Other Networks configuration -->
            <div class="other-section">
              <div class="section-header">
                <div class="header-icon">
                  <icon-link />
                </div>
                <span class="header-title">Other Networks</span>
              </div>

              <a-row :gutter="[16, 6]">
                <a-col
                  v-for="network in networks.filter(n => n.key !== 'rpc_endpoint_tron')"
                  :key="network.key"
                  :xs="24"
                  :sm="24"
                  :md="12"
                  :lg="8"
                >
                  <a-form-item
                    :field="network.key"
                    :label="network.label"
                    :rules="[{ required: true, message: `Enter${network.label}` }]"
                    class="network-form-item"
                  >
                    <a-input
                      v-model="formData[network.key]"
                      :placeholder="`Enter ${network.label}`"
                      allow-clear
                      size="small"
                      class="network-input"
                    >
                      <template #prefix>
                        <div class="input-icon">
                          <component :is="network.icon" />
                        </div>
                      </template>
                    </a-input>
                  </a-form-item>
                </a-col>
              </a-row>
            </div>
          </a-form>
        </div>

        <!-- Configuration Notes -->
        <a-divider orientation="left" class="info-divider">
          <div class="divider-content">
            <icon-info-circle />
            <span>Configuration Notes</span>
          </div>
        </a-divider>

        <div class="info-section">
          <div class="info-grid">
            <div v-for="(info, index) in infoList" :key="index" class="info-item">
              <div class="info-icon">
                <component :is="info.icon" />
              </div>
              <span>{{ info.text }}</span>
            </div>
          </div>
        </div>
      </a-card>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Message } from "@arco-design/web-vue";
import { getsConfAPI, setsConfAPI } from "@/api/modules/conf/index";
import {
  IconSettings,
  IconSave,
  IconRefresh,
  IconExclamationCircle,
  IconLink,
  IconInfoCircle,
  IconCheckCircle,
  IconStar,
  IconThunderbolt,
  IconFire,
  IconQuestionCircle,
  IconSafe
} from "@arco-design/web-vue/es/icon";

// Network configuration
const networks = [
  { key: "rpc_endpoint_ethereum", label: "Ethereum RPC", icon: IconLink },
  { key: "rpc_endpoint_bsc", label: "BSC RPC", icon: IconLink },
  { key: "rpc_endpoint_polygon", label: "Polygon RPC", icon: IconLink },
  { key: "rpc_endpoint_arbitrum", label: "Arbitrum RPC", icon: IconLink },
  { key: "rpc_endpoint_base", label: "Base RPC", icon: IconLink },
  { key: "rpc_endpoint_xlayer", label: "X Layer RPC", icon: IconLink },
  { key: "rpc_endpoint_tron", label: "Tron RPC", icon: IconLink },
  { key: "rpc_endpoint_solana", label: "Solana RPC", icon: IconLink },
  { key: "rpc_endpoint_aptos", label: "Aptos RPC", icon: IconLink },
  { key: "rpc_endpoint_plasma", label: "Plasma RPC", icon: IconLink }
];

const infoList = [
  { icon: IconCheckCircle, text: "RPC nodes are critical interfaces for blockchain communication. Ensure configured nodes are stable and reliable." },
  { icon: IconStar, text: "Use officially recommended RPC nodes or reputable third-party providers." },
  { icon: IconThunderbolt, text: "Test node connectivity and response speed before saving." },
  { icon: IconFire, text: "Changes take effect immediately. Use caution." }
];

const loading = ref<boolean>(false);
const saveLoading = ref<boolean>(false);
const formRef = ref();
const formData = reactive<Record<string, string>>({});
const originalData = ref<Record<string, string>>({});

const getConf = async () => {
  try {
    loading.value = true;
    const keys = [...networks.map(network => network.key), "rpc_endpoint_tron_grid_api_key"];

    const response = await getsConfAPI({ keys });
    const data = response.data || {};

    networks.forEach(network => {
      formData[network.key] = data[network.key] || "";
    });
    formData.rpc_endpoint_tron_grid_api_key = data.rpc_endpoint_tron_grid_api_key || "";

    originalData.value = { ...formData };
  } catch (error) {
    Message.error("Failed to get configuration");
    console.error("Failed to get configuration:", error);
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  try {
    const errors = await formRef.value?.validate();
    if (errors) {
      Message.error("Form validation failed. Check all fields.");
      return;
    }
  } catch (validationError) {
    console.error("Form validation failed:", validationError);
    Message.error("Fill in all required fields");
    return;
  }

  try {
    saveLoading.value = true;

    // build save data array
    const saveData: Array<{ key: string; value: string }> = [];

    // add RPC configuration for all networks
    networks.forEach(network => {
      const value = formData[network.key]?.trim();
      if (value) {
        saveData.push({
          key: network.key,
          value: value
        });
      }
    });

    // validate that all required RPC nodes are filled
    if (saveData.length < networks.length) {
      Message.error("All RPC nodes are required");
      return;
    }

    // Add Tron Grid API Key (optional, saved even if empty)
    const tronApiKey = formData.rpc_endpoint_tron_grid_api_key?.trim() || "";
    saveData.push({
      key: "rpc_endpoint_tron_grid_api_key",
      value: tronApiKey
    });

    await setsConfAPI(saveData);

    Message.success("Configuration saved successfully");

    await getConf();
  } catch (error) {
    Message.error("Failed to save configuration");
    console.error("Failed to save configuration:", error);
  } finally {
    saveLoading.value = false;
  }
};

// reset configuration
const handleReset = () => {
  Object.assign(formData, originalData.value);
  Message.info("Reset to original configuration");
};

onMounted(() => {
  getConf();
});
</script>

<style lang="scss" scoped>
.full-height {
  min-height: 100%;
}

.warning-banner {
  margin-bottom: 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgb(var(--warning-6) / 8%);
  background: rgb(var(--warning-1));
  border: 1px solid rgb(var(--warning-3));

  :deep(.arco-alert-content) {
    font-size: 13px;
    line-height: 1.4;
  }

  :deep(.arco-alert) {
    padding: 10px 14px;
  }
}

.main-card {
  margin-top: 0;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  background: $color-bg-2;

  :deep(.arco-card-header) {
    border-bottom: 1px solid $color-border-2;
    padding: 14px 18px;
    background: $color-bg-3;
    border-radius: 8px 8px 0 0;
  }

  :deep(.arco-card-body) {
    padding: 16px;
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: $color-text-1;

  .title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: $color-primary;
    border-radius: 6px;
    color: #fff;
    font-size: 13px;
  }
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 5px 14px;
  height: 30px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }
}

.save-btn {
  background: $color-primary;
  border: none;

  &:hover {
    background: rgb(var(--primary-5));
  }
}

.form-container {
  margin: 12px 0;
}

// Tron configuration section styles - use official Tron red palette
.tron-section {
  background: rgba(var(--danger-6), 0.06);
  border: 1px solid rgba(var(--danger-6), 0.18);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(var(--danger-6), 0.72);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid $color-border-2;

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: $color-danger;
      border-radius: 4px;
      color: #fff;
      font-size: 11px;
      box-shadow: 0 2px 4px rgba(var(--danger-6), 0.3);
    }

    .header-title {
      font-weight: 600;
      font-size: 13px;
      color: $color-text-1;
    }
  }
}

// Other Networks configuration section styles - use soft light-green palette
.other-section {
  background: rgba(var(--success-6), 0.06);
  border: 1px solid rgba(var(--success-6), 0.18);
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: rgba(var(--success-6), 0.72);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid $color-border-2;

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: $color-success;
      border-radius: 4px;
      color: #fff;
      font-size: 11px;
      box-shadow: 0 2px 4px rgba(var(--success-6), 0.3);
    }

    .header-title {
      font-weight: 600;
      font-size: 13px;
      color: $color-text-1;
    }
  }

  .network-input {
    :deep(.arco-input-wrapper) {
      border-color: $color-border-2;
      background: $color-bg-2;

      &:hover {
        border-color: $color-success;
        box-shadow: 0 0 0 2px rgba(var(--success-6), 0.08);
      }

      &.arco-input-focus {
        border-color: $color-success;
        box-shadow: 0 0 0 2px rgba(var(--success-6), 0.1);
      }
    }
  }
}

.network-form-item {
  :deep(.arco-form-item-label-col) {
    margin-bottom: 4px;

    .arco-form-item-label {
      font-weight: 500;
      color: $color-text-1;
      font-size: 12px;
    }
  }
}

.network-input {
  border-radius: 6px;
  transition: all 0.2s ease;

  :deep(.arco-input-wrapper) {
    border: 1px solid $color-border-2;
    background: $color-bg-2;
    height: 32px;

    &:hover {
      border-color: $color-primary;
      box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.08);
    }

    &.arco-input-focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 2px rgba(var(--primary-6), 0.1);
    }
  }

  :deep(.arco-input) {
    font-size: 12px;
  }
}

// Tron input special style
.tron-input {
  :deep(.arco-input-wrapper) {
    border-color: $color-border-2;

    &:hover {
      border-color: $color-danger;
      box-shadow: 0 0 0 2px rgba(var(--danger-6), 0.08);
    }

    &.arco-input-focus {
      border-color: $color-danger;
      box-shadow: 0 0 0 2px rgba(var(--danger-6), 0.1);
    }
  }
}

.tron-grid-api-key-input {
  max-width: 100%;

  :deep(textarea) {
    max-height: 120px;
    overflow-y: auto;
    line-height: 20px;
  }
}

.input-icon {
  display: flex;
  align-items: center;
  color: $color-text-3;
  font-size: 13px;
}

.tron-grid-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  min-width: 0;
  flex-wrap: wrap;
}

.label-with-tip {
  display: flex;
  align-items: center;
  gap: 5px;

  .tip-icon {
    color: $color-text-3;
    cursor: help;
    font-size: 13px;

    &:hover {
      color: $color-primary;
    }
  }

  .optional-tag {
    color: $color-text-3;
    font-size: 11px;
    font-weight: normal;
  }
}

.help-link {
  display: flex;
  align-items: center;
  gap: 3px;
  color: $color-danger;
  font-size: 11px;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    color: rgb(var(--danger-5));
  }
}

.info-divider {
  margin: 16px 0 12px 0;

  .divider-content {
    display: flex;
    align-items: center;
    gap: 5px;
    color: $color-text-1;
    font-weight: 500;
    font-size: 13px;
  }

  :deep(.arco-divider-text) {
    background: $color-bg-2;
    border: 1px solid $color-border-2;
    border-radius: 12px;
    padding: 4px 10px;
    font-size: 12px;
  }
}

.info-section {
  background: $color-bg-3;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid $color-border-2;
}

.info-grid {
  display: grid;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px;
  background: $color-bg-2;
  border-radius: 5px;
  border: 1px solid $color-border-2;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    border-color: $color-primary;
  }

  .info-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary;
    font-size: 13px;
    margin-top: 1px;
  }

  span {
    color: $color-text-2;
    line-height: 1.4;
    font-size: 12px;
  }
}

// responsive design
@media (max-width: 768px) {
  .card-title {
    font-size: 14px;

    .title-icon {
      width: 26px;
      height: 26px;
      font-size: 12px;
    }
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .main-card {
    :deep(.arco-card-header) {
      padding: 12px 14px;
    }

    :deep(.arco-card-body) {
      padding: 14px;
    }
  }

  .tron-section,
  .other-section {
    padding: 8px 10px;
  }
}

// dark theme adaptation
:deep(.arco-card.arco-card-bordered) {
  border: 1px solid $color-border-2;
}
</style>
