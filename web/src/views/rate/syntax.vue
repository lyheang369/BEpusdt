<template>
  <div class="snow-page">
    <div class="snow-inner">
      <a-row :gutter="16" style="margin: 16px 0">
        <a-col :xs="24" :sm="24" :md="12">
          <a-space size="medium" wrap>
            <a-button type="primary" @click="showSyncModal">
              <template #icon>
                <icon-settings />
              </template>
              Sync Configuration
            </a-button>
            <a-button type="primary" @click="showAtomModal" :status="'danger'">
              <template #icon>
                <icon-robot-add />
              </template>
              Payment Granularity
            </a-button>
          </a-space>
        </a-col>
      </a-row>
      <a-table
        row-key="key"
        :size="'medium'"
        :bordered="{ cell: true }"
        :scroll="{ x: 590, y: 600 }"
        :loading="loading"
        :columns="columns"
        :data="data"
        v-model:selectedKeys="selectedKeys"
        :pagination="false"
      >
        <template #fiat="{ record }">
          <span class="fiat-display">
            {{ getFiatFlag(record.fiat) }} <strong>{{ record.fiat }}</strong>
          </span>
        </template>
        <template #crypto="{ record }">
          <a-tag :color="getCryptoColor(record.crypto)" :bordered="true">
            {{ record.crypto }}
          </a-tag>
        </template>
        <template #syntax="{ record }">
          <div class="syntax-display">
            <span class="syntax-value">{{ record.syntax || "None" }}</span>
            <span class="syntax-description">{{ getTableSyntaxDescription(record.syntax) }}</span>
          </div>
        </template>
        <template #optional="{ record }">
          <a-space wrap>
            <a-button size="mini" type="primary" @click="onEdit(record)">Edit</a-button>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>

  <!-- Edit Rate Syntax modal -->
  <a-modal
    v-model:visible="editModalVisible"
    title="Edit Rate Syntax"
    @ok="handleEditSubmit"
    @cancel="handleEditCancel"
    :ok-loading="editLoading"
    :width="editDialogWidth"
    class="edit-modal"
  >
    <a-form ref="editFormRef" :model="editForm" layout="vertical">
      <a-row :gutter="12">
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item label="Transaction Fiat">
            <a-input v-model="editForm.fiat" readonly size="small">
              <template #prefix>{{ getFiatFlag(editForm.fiat) }}</template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col :xs="24" :sm="24" :md="12">
          <a-form-item label="Cryptocurrency">
            <a-tag :color="getCryptoColor(editForm.crypto)" :bordered="true">
              {{ editForm.crypto }}
            </a-tag>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="Syntax Type">
        <a-radio-group v-model="syntaxType" @change="handleSyntaxTypeChange">
          <a-radio value="">Fixed Value</a-radio>
          <a-radio value="+">Fixed Increase</a-radio>
          <a-radio value="-">Fixed Decrease</a-radio>
          <a-radio value="~">Percentage Float</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="Value">
        <a-input-number
          v-model="syntaxValue"
          :placeholder="getSyntaxPlaceholder()"
          :min="syntaxType === '~' ? 0.000001 : 0"
          :max="syntaxType === '~' ? 10 : 999999"
          :step="syntaxType === '~' ? 0.000001 : 0.01"
          style="width: 100%"
        >
          <template #prefix v-if="syntaxType">
            <span class="syntax-prefix">{{ syntaxType }}</span>
          </template>
        </a-input-number>
      </a-form-item>

      <div v-if="getFormSyntaxDescription()" class="syntax-tip">
        <a-typography-text type="secondary">
          <icon-info-circle style="margin-right: 4px" />
          {{ getFormSyntaxDescription() }}
        </a-typography-text>
      </div>
    </a-form>
  </a-modal>

  <!-- sync interval settings modal -->
  <a-modal
    v-model:visible="syncModalVisible"
    title="Rate Sync Configuration"
    @ok="handleSyncSubmit"
    @cancel="handleSyncCancel"
    :ok-loading="syncLoading"
    :width="syncDialogWidth"
    class="sync-modal"
  >
    <a-form ref="syncFormRef" :model="syncForm" layout="vertical">
      <a-form-item label="Sync Interval (minutes)">
        <a-input-number
          v-model="syncForm.minutes"
          :min="10"
          :max="1440"
          :precision="0"
          placeholder="Enter sync interval"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="API Endpoint">
        <a-select v-model="syncForm.apiUrl" placeholder="Select API endpoint" style="width: 100%">
          <a-option v-for="option in apiUrlOptions" :key="option.value" :value="option.value" :label="option.label">
            {{ option.label }}
          </a-option>
        </a-select>
      </a-form-item>

      <a-form-item label="API Key">
        <a-input v-model="syncForm.apiKey" placeholder="Enter API Key (optional)" allow-clear style="width: 100%" />
      </a-form-item>

      <a-form-item label="Rate Retention Days">
        <a-input-number
          v-model="syncForm.historyDays"
          :min="1"
          :max="365"
          :precision="0"
          placeholder="Enter rate retention days"
          style="width: 100%"
        />
      </a-form-item>

      <div class="sync-tip">
        <a-typography-text type="secondary">
          <icon-info-circle style="margin-right: 4px" />
          Sync interval: 10-1440 minutes. Recommended: 60 minutes<br />
          Official API: free but rate-limited. Configure an
          <a-link href="https://www.coingecko.com/" target="_blank" :hoverable="false">API Key</a-link>
          to remove the limit<br />
          Open-source API: a free cached API provided by the author, about 3 minutes behind the official API, with no rate limit<br />
          <hr />
          <b class="sync-warning">Official API refers to CoinGecko, one of the world's largest independent cryptocurrency data aggregators</b>
        </a-typography-text>
      </div>
    </a-form>
  </a-modal>

  <!-- payment granularity settings modal -->
  <a-modal
    v-model:visible="atomModalVisible"
    title="Set Payment Granularity"
    @ok="handleAtomSubmit"
    @cancel="handleAtomCancel"
    :ok-loading="atomLoading"
    :width="atomDialogWidth"
    class="atom-modal"
  >
    <a-form ref="atomFormRef" :model="atomForm" layout="vertical">
      <a-form-item label="USDT Granularity">
        <a-input-number
          v-model="atomForm.usdt"
          :min="0.000001"
          :max="100"
          :precision="undefined"
          :step="0.000001"
          placeholder="Recommended 0.01"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="USDC Granularity">
        <a-input-number
          v-model="atomForm.usdc"
          :min="0.000001"
          :max="100"
          :precision="undefined"
          :step="0.000001"
          placeholder="Recommended 0.01"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="TRX Granularity">
        <a-input-number
          v-model="atomForm.trx"
          :min="0.000001"
          :max="100"
          :precision="undefined"
          :step="0.000001"
          placeholder="Recommended 0.01"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="BNB Granularity">
        <a-input-number
          v-model="atomForm.bnb"
          :min="0.00000001"
          :max="100"
          :precision="undefined"
          :step="0.000001"
          placeholder="Recommended 0.00001"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="ETH Granularity">
        <a-input-number
          v-model="atomForm.eth"
          :min="0.00000001"
          :max="100"
          :precision="undefined"
          :step="0.000001"
          placeholder="Recommended 0.000001"
          style="width: 100%"
        />
      </a-form-item>

      <div class="atom-tip">
        <a-typography-text type="secondary">
          <icon-info-circle style="margin-right: 4px" />
          Minimum increment unit for payment amounts and the final retained precision. Do not change this unless you clearly understand its purpose.
        </a-typography-text>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from "vue";
import { Message } from "@arco-design/web-vue";
import { IconInfoCircle } from "@arco-design/web-vue/es/icon";
import { getSyntaxListAPI, setSyntaxAPI } from "@/api/modules/rate/index";
import { getsConfAPI, setsConfAPI } from "@/api/modules/conf/index";
import { List, EditForm } from "./syntax";
import { getFiatFlag, getCryptoColor } from "@/views/rate/common";
import { useLayoutModel } from "@/hooks/useLayoutModel";

const { dialogWidth } = useLayoutModel();
const editDialogWidth = computed(() => dialogWidth("480px"));
const syncDialogWidth = computed(() => dialogWidth("480px"));
const atomDialogWidth = computed(() => dialogWidth("400px"));
const selectedKeys = ref<string[]>([]);
const loading = ref<boolean>(false);
const data = reactive<List[]>([]);
const editModalVisible = ref<boolean>(false);
const editLoading = ref<boolean>(false);
const editFormRef = ref();
const syntaxType = ref<string>("");
const syntaxValue = ref<number | undefined>(undefined);

const editForm = reactive<EditForm>({
  fiat: "",
  crypto: "",
  syntax: ""
});

const columns = [
  {
    title: "Transaction Fiat",
    dataIndex: "fiat",
    align: "center",
    width: 100,
    slotName: "fiat",
    filterable: {
      filters: [
        { text: "🇨🇳 CNY", value: "CNY" },
        { text: "🇺🇸 USD", value: "USD" },
        { text: "🇯🇵 JPY", value: "JPY" },
        { text: "🇪🇺 EUR", value: "EUR" },
        { text: "🇬🇧 GBP", value: "GBP" }
      ],
      filter: (fiat: any, record: any) => fiat.includes(record.fiat),
      multiple: true
    }
  },
  {
    title: "Cryptocurrency",
    dataIndex: "crypto",
    align: "center",
    width: 100,
    slotName: "crypto",
    filterable: {
      filters: [
        { text: "USDT", value: "USDT" },
        { text: "USDC", value: "USDC" },
        { text: "TRX", value: "TRX" },
        { text: "ETH", value: "ETH" },
        { text: "BNB", value: "BNB" }
      ],
      filter: (crypto: any, record: any) => crypto.includes(record.crypto),
      multiple: true
    }
  },
  {
    title: "Rate Adjustment",
    dataIndex: "syntax",
    slotName: "syntax",
    width: 300
  },
  {
    title: "Actions",
    slotName: "optional",
    align: "center",
    fixed: "right",
    width: 90
  }
];

const parseSyntax = (syntax: string) => {
  if (!syntax) return { type: "", value: undefined };

  if (syntax.startsWith("~")) return { type: "~", value: parseFloat(syntax.substring(1)) };
  if (syntax.startsWith("+")) return { type: "+", value: parseFloat(syntax.substring(1)) };
  if (syntax.startsWith("-")) return { type: "-", value: parseFloat(syntax.substring(1)) };
  return { type: "", value: parseFloat(syntax) };
};

const generateSyntax = () => {
  if (syntaxValue.value === undefined || syntaxValue.value === null) return "";

  // format value,remove trailing zeroes
  const formatValue = (val: number) => {
    return parseFloat(val.toFixed(6)).toString();
  };

  // Percentage Float
  if (syntaxType.value === "~") {
    return syntaxType.value + formatValue(syntaxValue.value);
  }

  // other types
  return syntaxType.value + formatValue(syntaxValue.value);
};

const getSyntaxPlaceholder = () => {
  const placeholders = {
    "+": "Example: 0.3",
    "-": "Example: 0.2",
    "~": "Example: 1.020000 or 0.970000",
    "": "Example: 7.4"
  };
  return placeholders[syntaxType.value as keyof typeof placeholders];
};

const getTableSyntaxDescription = (syntax: string) => {
  if (!syntax) return "";

  const parsed = parseSyntax(syntax);
  if (parsed.value === undefined || parsed.value === null) return "";

  // format value,remove trailing zeroes
  const formatValue = (val: number) => {
    return parseFloat(val.toFixed(6)).toString();
  };

  switch (parsed.type) {
    case "+":
      return `Order rate = base rate + ${formatValue(parsed.value)}`;
    case "-":
      return `Order rate = base rate - ${formatValue(parsed.value)}`;
    case "~":
      return parsed.value != 1 ? `Order rate = base rate * ${formatValue(parsed.value)}` : `Order rate = base rate`;
    default:
      return `Order rate fixed at ${formatValue(parsed.value)}`;
  }
};

const getFormSyntaxDescription = () => {
  if (!syntaxType.value || syntaxValue.value === undefined || syntaxValue.value === null) return "";

  // format value,remove trailing zeroes
  const formatValue = (val: number) => {
    return parseFloat(val.toFixed(6)).toString();
  };

  switch (syntaxType.value) {
    case "+":
      return `Order rate = base rate + ${formatValue(syntaxValue.value)}`;
    case "-":
      return `Order rate = base rate - ${formatValue(syntaxValue.value)}`;
    case "~":
      return syntaxValue.value != 1 ? `Order rate = base rate * ${formatValue(syntaxValue.value)}` : `Order rate = base rate`;
    default:
      return `Order rate fixed at ${formatValue(syntaxValue.value)}`;
  }
};

const handleSyntaxTypeChange = () => {
  if (syntaxType.value === "~" && (syntaxValue.value === undefined || syntaxValue.value === null || syntaxValue.value === 0)) {
    syntaxValue.value = 1.0;
  } else if (syntaxType.value !== "~" && syntaxValue.value === 1) {
    syntaxValue.value = 0;
  }
};

const getCommonTableList = async () => {
  try {
    loading.value = true;
    const res = await getSyntaxListAPI();
    data.length = 0;
    data.push(...res.data);
  } finally {
    loading.value = false;
  }
};

const onEdit = (record: List) => {
  editForm.fiat = record.fiat;
  editForm.crypto = record.crypto;
  editForm.syntax = record.syntax;

  const parsed = parseSyntax(record.syntax);
  syntaxType.value = parsed.type;
  syntaxValue.value = parsed.value;
  editModalVisible.value = true;
};

const handleEditSubmit = async () => {
  try {
    if (!editForm.fiat || !editForm.crypto) {
      Message.error("Trading pair information is incomplete");
      return;
    }

    if (syntaxValue.value === undefined || syntaxValue.value === null) {
      Message.error("Enter a valid value");
      return;
    }

    if (syntaxType.value === "~") {
      if (syntaxValue.value <= 0) {
        Message.error("Percentage float value must be greater than 0");
        return;
      }
    } else if (syntaxValue.value < 0) {
      Message.error("Value cannot be negative");
      return;
    }

    editLoading.value = true;
    const syntax = generateSyntax();

    await setSyntaxAPI({
      fiat: editForm.fiat,
      crypto: editForm.crypto,
      syntax: syntax
    });

    Message.success("Edited successfully");
    editModalVisible.value = false;
    await getCommonTableList();
  } catch (error) {
    console.error("Edit failed:", error);
    Message.error("Edit failed");
  } finally {
    editLoading.value = false;
  }
};

const handleEditCancel = () => {
  editModalVisible.value = false;
  editFormRef.value?.resetFields();
  syntaxType.value = "";
  syntaxValue.value = undefined;
};

// sync interval related state
const syncModalVisible = ref<boolean>(false);
const syncLoading = ref<boolean>(false);
const syncFormRef = ref();

const syncForm = reactive({
  minutes: 60,
  apiUrl: "https://api.coingecko.com",
  apiKey: "",
  historyDays: 30
});

// API Endpointoptions
const apiUrlOptions = [
  {
    label: "Official API, free quota is rate-limited",
    value: "https://api.coingecko.com"
  },
  {
    label: "Open-source free author-hosted API without rate limit",
    value: "https://api-coingecko-com.bepusdt.online"
  }
];

// show sync interval modal
const showSyncModal = async () => {
  try {
    const res = await getsConfAPI({
      keys: ["rate_sync_interval", "rate_sync_coingecko_api_url", "rate_sync_coingecko_api_key", "rate_sync_history_days"]
    });

    if (res.data) {
      if (res.data.rate_sync_interval) {
        const seconds = parseInt(res.data.rate_sync_interval);
        const minutes = Math.round(seconds / 60);
        syncForm.minutes = minutes;
      } else {
        syncForm.minutes = 60;
      }

      syncForm.apiUrl = res.data.rate_sync_coingecko_api_url || "https://api.coingecko.com";
      syncForm.apiKey = res.data.rate_sync_coingecko_api_key || "";
      syncForm.historyDays = res.data.rate_sync_history_days ? parseInt(res.data.rate_sync_history_days) : 30;
    } else {
      syncForm.minutes = 60;
      syncForm.apiUrl = "https://api.coingecko.com";
      syncForm.apiKey = "";
      syncForm.historyDays = 30;
    }
  } catch (error) {
    console.error("Failed to get sync interval configuration:", error);
    syncForm.minutes = 60;
    syncForm.apiUrl = "https://api.coingecko.com";
    syncForm.apiKey = "";
    syncForm.historyDays = 30;
    Message.warning("Failed to get current configuration. Using defaults.");
  }

  syncModalVisible.value = true;
};

const handleSyncSubmit = async () => {
  try {
    if (!syncForm.minutes || syncForm.minutes < 10 || syncForm.minutes > 1440) {
      Message.error("Enter a valid sync interval (10-1440 minutes)");
      return;
    }

    if (!syncForm.apiUrl) {
      Message.error("Select API endpoint");
      return;
    }

    if (!syncForm.historyDays || syncForm.historyDays < 1 || syncForm.historyDays > 365) {
      Message.error("Enter valid rate retention days (1-365 days)");
      return;
    }

    syncLoading.value = true;
    const seconds = syncForm.minutes * 60;

    await setsConfAPI([
      { key: "rate_sync_interval", value: seconds.toString() },
      { key: "rate_sync_coingecko_api_url", value: syncForm.apiUrl },
      { key: "rate_sync_coingecko_api_key", value: syncForm.apiKey },
      { key: "rate_sync_history_days", value: syncForm.historyDays.toString() }
    ]);

    Message.success("Rate sync configuration saved");
    syncModalVisible.value = false;
  } catch (error) {
    console.error("Failed to set sync configuration:", error);
    Message.error("Setting failed");
  } finally {
    syncLoading.value = false;
  }
};

const handleSyncCancel = () => {
  syncModalVisible.value = false;
  syncFormRef.value?.resetFields();
  syncForm.minutes = 60;
  syncForm.apiUrl = "https://api.coingecko.com";
  syncForm.apiKey = "";
  syncForm.historyDays = 30;
};

// Payment Granularityrelated state
const atomModalVisible = ref<boolean>(false);
const atomLoading = ref<boolean>(false);
const atomFormRef = ref();

const atomForm = reactive({
  usdt: 0.01,
  usdc: 0.01,
  trx: 0.01,
  eth: 0.000001,
  bnb: 0.00001
});

const showAtomModal = async () => {
  try {
    const res = await getsConfAPI({
      keys: ["atom_usdt", "atom_usdc", "atom_trx", "atom_eth", "atom_bnb"]
    });

    if (res.data) {
      console.log(res.data);
      atomForm.usdt = res.data.atom_usdt ? parseFloat(res.data.atom_usdt) : 0.01;
      atomForm.usdc = res.data.atom_usdc ? parseFloat(res.data.atom_usdc) : 0.01;
      atomForm.trx = res.data.atom_trx ? parseFloat(res.data.atom_trx) : 0.01;
      atomForm.eth = res.data.atom_eth ? parseFloat(res.data.atom_eth) : 0.000001;
      atomForm.bnb = res.data.atom_bnb ? parseFloat(res.data.atom_bnb) : 0.00001;
    }
  } catch (error) {
    console.error("Failed to get payment granularity configuration:", error);
    Message.warning("Failed to get current configuration. Using defaults.");
  }

  atomModalVisible.value = true;
};

const handleAtomSubmit = async () => {
  try {
    if (!atomForm.usdt || !atomForm.usdc || !atomForm.trx || !atomForm.eth || !atomForm.bnb) {
      Message.error("Fill in all granularity settings");
      return;
    }

    atomLoading.value = true;

    await setsConfAPI([
      { key: "atom_usdt", value: atomForm.usdt.toString() },
      { key: "atom_usdc", value: atomForm.usdc.toString() },
      { key: "atom_trx", value: atomForm.trx.toString() },
      { key: "atom_eth", value: atomForm.eth.toString() },
      { key: "atom_bnb", value: atomForm.bnb.toString() }
    ]);

    Message.success("Payment GranularitySettings saved");
    atomModalVisible.value = false;
  } catch (error) {
    console.error("Set Payment GranularityFailed:", error);
    Message.error("Setting failed");
  } finally {
    atomLoading.value = false;
  }
};

const handleAtomCancel = () => {
  atomModalVisible.value = false;
  atomFormRef.value?.resetFields();
  atomForm.usdt = 0.01;
  atomForm.usdc = 0.01;
  atomForm.trx = 0.01;
  atomForm.eth = 0.000001;
  atomForm.bnb = 0.00001;
};

getCommonTableList();
</script>

<style lang="scss" scoped>
.fiat-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.syntax-display {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .syntax-value {
    font-weight: 500;
    color: $color-text-1;
    min-width: 56px;
    text-align: left;
    flex-shrink: 0;
  }

  .syntax-description {
    font-size: 12px;
    color: $color-text-3;
    font-style: italic;
    min-width: 0;
    overflow-wrap: anywhere;
  }
}

.syntax-prefix {
  color: $color-primary;
  font-weight: bold;
}

.edit-modal {
  :deep(.arco-modal-body) {
    padding: 16px 24px;
  }

  .syntax-tip {
    padding: 8px 12px;
    background: $color-fill-1;
    border: 1px solid $color-border-2;
    border-radius: 4px;
    font-size: 12px;
    margin-top: 8px;
  }
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start; // change to left alignment
}

.sync-modal {
  :deep(.arco-modal-body) {
    padding: 16px 24px;
  }

  .sync-tip {
    padding: 6px 10px;
    background: $color-fill-1;
    border: 1px solid $color-border-2;
    border-radius: 4px;
    font-size: 11px;
    line-height: 1.4;
    margin-top: 8px;

    .sync-warning {
      color: $color-danger;
    }

    hr {
      margin: 6px 0 0 0;
      border: none;
      border-top: 1px solid $color-border-2;
    }
  }
}

.atom-modal {
  :deep(.arco-modal-body) {
    padding: 16px 24px;
  }

  .atom-tip {
    padding: 8px 12px;
    background: $color-fill-1;
    border: 1px solid $color-border-2;
    border-radius: 4px;
    font-size: 12px;
    margin-top: 8px;
  }
}
</style>
