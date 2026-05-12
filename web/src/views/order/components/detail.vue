<template>
  <a-modal :width="detailDialogWidth" :visible="visible" @close="onClose" @cancel="onClose" @update:visible="onClose" unmount-on-close>
    <template #title>
      <div class="detail-modal-title">
        <icon-star />
        <span>Order Details</span>
      </div>
    </template>

    <!-- action buttons -->
    <template #footer>
      <a-space wrap>
        <a-button
          v-if="detailData.status === 2 && detailData.notify_state === 0"
          type="primary"
          status="warning"
          @click="handleManualNotify"
        >
          <template #icon><icon-notification /></template>
          Callback
        </a-button>
        <a-popconfirm content="Delete this order? This cannot be undone!" type="error" @ok="handleDelete">
          <a-button type="primary" status="danger">
            <template #icon><icon-delete /></template>
            Delete
          </a-button>
        </a-popconfirm>
        <a-button @click="onClose">Close Window</a-button>
      </a-space>
    </template>

    <div class="detail-content">
      <!-- Basic Informationcard -->
      <a-card class="detail-card" title="Basic Information" :bordered="false">
        <template #extra>
          <a-tag size="medium" :color="getStatusColor(detailData.status)" class="status-tag">
            <icon-check-circle v-if="detailData.status === 2" />
            <icon-clock-circle v-else-if="detailData.status === 1 || detailData.status === 5" />
            <icon-close-circle v-else />
            {{ getStatusText(detailData.status) }}
          </a-tag>
        </template>
        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-user />
                <span>Product Name</span>
              </div>
              <div class="detail-value">{{ detailData.name }}</div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-swap />
                <span>Trade Type</span>
              </div>
              <div class="detail-value">
                <a-tag color="blue" class="trade-type-tag">{{ detailData.trade_type }}</a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-file />
                <span>Merchant Order</span>
              </div>
              <div class="detail-value">
                <a-typography-text copyable>{{ detailData.order_id }}</a-typography-text>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-tag />
                <span>Transaction ID</span>
              </div>
              <div class="detail-value">
                <a-typography-text copyable>{{ detailData.trade_id }}</a-typography-text>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-archive />
                <span>Transaction Amount (Rate)</span>
              </div>
              <div class="detail-value">
                <span class="currency-symbol">{{ getCurrencySymbol(detailData.fiat) }}</span
                >{{ detailData.money }}
                <span class="rate-text">({{ detailData.rate }})</span>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-pushpin />
                <span>Trade Amount</span>
              </div>
              <div class="detail-value">
                {{ detailData.amount }}
                <a-tag size="mini" :color="getCryptoColor(detailData.crypto)" bordered style="margin-left: 4px">
                  {{ detailData.crypto }}
                </a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- Addressinformationcard -->
      <a-card class="detail-card" title="Transaction Address" :bordered="false">
        <a-row :gutter="24">
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">
                <icon-location />
                <span>Receiving Address</span>
              </div>
              <div class="detail-value address-value">
                <a-typography-text copyable>{{ detailData.address }}</a-typography-text>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="24" v-if="detailData.from_address">
          <a-col :span="24">
            <div class="detail-item">
              <div class="detail-label">
                <icon-send />
                <span>Payment Address</span>
              </div>
              <div class="detail-value address-value">
                <a-typography-text copyable>{{ detailData.from_address }}</a-typography-text>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- Callback Informationcard -->
      <a-card class="detail-card" title="Callback Information" :bordered="false" v-if="detailData.status === 2 || detailData.status === 5">
        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-check />
                <span>Callback Status</span>
              </div>
              <div class="detail-value">
                <a-tag v-if="detailData.notify_state === 1" color="green"> Success </a-tag>
                <a-tag v-else color="red"> Failed, waiting for callback attempt {{ detailData.notify_num + 1 }} </a-tag>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" v-if="detailData.return_url">
            <div class="detail-item">
              <div class="detail-label">
                <icon-link />
                <span>Merchant Website</span>
              </div>
              <div class="detail-value">
                <a-link @click="openMerchantWebsite" :hoverable="false">
                  {{ getMerchantWebsite(detailData.return_url) }}
                </a-link>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- blockchain informationcard -->
      <a-card class="detail-card" title="Blockchain Data" :bordered="false" v-if="detailData.status === 2 || detailData.status === 5">
        <a-row :gutter="24" v-if="detailData.ref_hash">
          <a-col :xs="24" :sm="24" :md="12" v-if="detailData.ref_block_num">
            <div class="detail-item">
              <div class="detail-label">
                <icon-layers />
                <span>Block Index</span>
              </div>
              <div class="detail-value">{{ detailData.ref_block_num }}</div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-safe />
                <span>On-chain Details</span>
              </div>
              <div class="detail-value hash-value">
                <a-link
                  v-if="detailData.status === 2 && detailData.tx_url"
                  @click="openTxUrl"
                  :hoverable="false"
                  class="tx-url-link"
                >
                  {{ detailData.tx_url }}
                </a-link>
                <a-tag v-else color="blue" size="small">
                  <template #icon><icon-clock-circle /></template>
                  Waiting for transaction confirmation
                </a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- Time Informationcard -->
      <a-card class="detail-card" title="Order Time" :bordered="false">
        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12" v-if="detailData.created_at">
            <div class="detail-item">
              <div class="detail-label">
                <icon-plus-circle />
                <span>Create Order</span>
              </div>
              <div class="detail-value">{{ formatDateTime(detailData.created_at) }}</div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-check-circle v-if="detailData.confirmed_at && (detailData.status === 2 || detailData.status === 5)" />
                <icon-schedule v-else-if="detailData.status === 3" />
                <icon-sync v-else />
                <span v-if="detailData.confirmed_at && (detailData.status === 2 || detailData.status === 5)">Transaction Confirmed</span>
                <span v-else-if="detailData.status === 3">Transaction Expired</span>
                <span v-else>Last Updated</span>
              </div>
              <div class="detail-value">
                <span v-if="detailData.confirmed_at && (detailData.status === 2 || detailData.status === 5)">
                  {{ formatDateTime(detailData.confirmed_at) }}
                </span>
                <span v-else-if="detailData.status === 3">
                  {{ formatDateTime(detailData.expired_at) }}
                </span>
                <span v-else>
                  {{ formatDateTime(detailData.updated_at) }}
                </span>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { getCryptoColor } from "@/views/rate/common";
import { delOrderApi } from "@/api/modules/order/index";
import { Notification, Modal } from "@arco-design/web-vue";
import { manualNotifyAPI } from "@/api/modules/order/index";
import { useLayoutModel } from "@/hooks/useLayoutModel";

const props = defineProps({
  visible: Boolean,
  detailData: {
    type: Object,
    required: true
  }
});

const { dialogWidth } = useLayoutModel();
const detailDialogWidth = computed(() => dialogWidth("820px"));

const emits = defineEmits(["close", "refresh"]);

const onClose = () => emits("close");

const openTxUrl = () => {
  if (props.detailData.tx_url) {
    window.open(props.detailData.tx_url, "_blank");
  }
};

const getMerchantWebsite = (returnUrl: string) => {
  if (!returnUrl) return "";
  try {
    const url = new URL(returnUrl);
    return `${url.protocol}//${url.host}/`;
  } catch {
    return returnUrl;
  }
};

const openMerchantWebsite = () => {
  if (props.detailData.return_url) {
    const merchantUrl = getMerchantWebsite(props.detailData.return_url);
    window.open(merchantUrl, "_blank");
  }
};

const handleDelete = async () => {
  try {
    await delOrderApi({ ids: [props.detailData.id] });
    Notification.success("Deleted successfully");
    emits("refresh");
    onClose();
  } catch (error) {
    Notification.error(error);
  }
};

const handleManualNotify = () => {
  Modal.confirm({
    title: "Confirm Manual Callback",
    content: `Are you sure you want to manually trigger callback for order ${props.detailData.order_id}? The system will immediately send a callback notification to the merchant.`,
    okText: "Confirm Callback",
    cancelText: "Cancel",
    onOk: () => {
      return manualNotifyAPI({ id: props.detailData.id })
        .then(result => {
          Notification.success(result.msg || "Callback successful");
          emits("refresh");
          onClose();
        })
        .catch(error => {
          console.error("Callback failed:", error);
          emits("refresh");
        });
    }
  });
};

const statusMap: Record<number, { color: string; text: string }> = {
  1: { color: "blue", text: "Waiting for Payment" },
  2: { color: "green", text: "Transaction Successful" },
  3: { color: "gray", text: "Transaction Expired" },
  4: { color: "gold", text: "Transaction Canceled" },
  5: { color: "pinkpurple", text: "Waiting for Confirmation" },
  6: { color: "red", text: "Confirmation Failed" }
};

const getStatusColor = (status: number) => statusMap[status]?.color || "gray";
const getStatusText = (status: number) => statusMap[status]?.text || "Unknown Status";

const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
};

const currencySymbolMap: Record<string, string> = {
  CNY: "¥",
  USD: "$",
  JPY: "¥",
  GBP: "£",
  EUR: "€"
};

const getCurrencySymbol = (fiat: string) => currencySymbolMap[fiat] || "";
</script>

<style lang="scss" scoped>
:deep(.arco-modal-body) {
  max-height: calc(100vh - 172px);
  overflow-y: auto;
  padding: 16px 20px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.detail-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-content {
  padding: 0;
  overflow-y: visible;
}

.detail-card {
  margin-bottom: 14px;
}

.detail-card :deep(.arco-card-header) {
  padding: 14px 20px 10px;
}

.detail-card :deep(.arco-card-body) {
  padding: 16px 20px 12px;
}

.detail-card:last-child {
  margin-bottom: 0;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.detail-item {
  margin-bottom: 16px;
  min-width: 0;
}

.detail-item:last-child {
  margin-bottom: 8px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--color-text-2);
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-value {
  font-size: 14px;
  color: var(--color-text-1);
  line-height: 1.5;
  min-width: 0;
  word-break: break-word;
}

.detail-value :deep(.arco-typography) {
  font-size: 14px;
  color: var(--color-text-1);
}

.detail-value :deep(.arco-typography-operation-copy) {
  color: $color-link;
  margin-left: 4px;
}

.detail-value :deep(.arco-typography-operation-copy:hover) {
  color: rgb(var(--link-5));
}

.address-value {
  font-family: "Monaco", "Menlo", "Consolas", monospace;
  font-size: 13px;
  word-break: break-all;
}

.address-value :deep(.arco-typography-operation-copy) {
  color: $color-link;
  margin-left: 4px;
}

.address-value :deep(.arco-typography-operation-copy:hover) {
  color: rgb(var(--link-5));
}

.hash-value {
  font-family: "Monaco", "Menlo", "Consolas", monospace;
  font-size: 12px;
  color: var(--color-text-3);
  overflow: hidden;
}

.tx-url-link {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  vertical-align: bottom;
}

.hash-value :deep(.arco-link) {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  vertical-align: bottom;
}

.currency-symbol {
  font-weight: 700;
  font-size: 15px;
}

.rate-text {
  color: var(--color-text-3);
  font-size: 13px;
  margin-left: 4px;
}

.trade-type-tag {
  font-weight: 700;
  font-size: 14px;
}

@media (max-width: 768px) {
  :deep(.arco-modal) {
    width: 95vw !important;
    margin: 10px;
  }

  .detail-content {
    max-height: none;
  }
}
</style>
