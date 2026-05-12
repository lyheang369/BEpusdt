<template>
  <div class="snow-page">
    <div class="snow-inner">
      <a-form ref="formRef" auto-label-width :model="formData.form">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="order_id" label="Merchant Order">
              <a-input v-model="formData.form.order_id" placeholder="EnterMerchant Order" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="trade_type" label="Trade Type">
              <a-select v-model="formData.form.trade_type" placeholder="SelectTrade Type" allow-clear allow-search>
                <a-option v-for="item in tradeTypeOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="status" label="Order Status">
              <a-select v-model="formData.form.status" placeholder="SelectOrder Status" allow-clear>
                <a-option v-for="item in statusOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-space class="search-btn" wrap>
              <a-button type="primary" @click="getOrderList">
                <template #icon><icon-search /></template>
                Search
              </a-button>
              <a-button @click="onReset">
                <template #icon><icon-refresh /></template>
                Reset
              </a-button>
              <a-popconfirm :content="batchDelConfirm" type="warning" @ok="onBatchDelete">
                <a-button v-show="selectedKeys.length > 0" type="primary" status="danger">
                  <template #icon><icon-delete /></template>
                  Delete
                </a-button>
              </a-popconfirm>
              <a-button type="text" @click="formData.search = !formData.search">
                {{ formData.search ? "Collapse" : "Expand" }}
                <icon-down :class="{ 'rotate-icon': formData.search }" />
              </a-button>
            </a-space>
          </a-col>
        </a-row>
        <a-row :gutter="16" v-if="formData.search">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="trade_id" label="TransactionID">
              <a-input v-model="formData.form.trade_id" placeholder="EnterTransactionID" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="address" label="Wallet Address">
              <a-input v-model="formData.form.address" placeholder="Enter wallet address" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="createTime" label="Created At">
              <a-range-picker v-model="formData.form.createTime" show-time format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <a-table
        row-key="id"
        size="small"
        :bordered="{ cell: true }"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        :loading="loading"
        :columns="columns"
        :data="data"
        v-model:selectedKeys="selectedKeys"
        :row-selection="orderSelection"
        :pagination="pagination"
        @page-change="pageChange"
        @page-size-change="pageSizeChange"
      >
        <template #wallet="{ record }">
          <a-tooltip :content="record.address" position="top">
            <span class="wallet-name">
              {{ record.wallet?.name || record.channel?.name || (record.address ? `${record.address.slice(-8)}` : "--") }}
            </span>
          </a-tooltip>
        </template>

        <template #amount="{ record }">
          <span>
            {{ record.amount }}
            <a-tag size="mini" :color="getCryptoColor(record.crypto)" bordered style="margin-left: 4px">{{
              record.crypto
            }}</a-tag>
          </span>
        </template>

        <template #money="{ record }">
          <span>
            {{ record.money }}
            <a-tag size="mini" color="arcoblue" style="margin-left: 4px">{{ record.fiat }}</a-tag>
          </span>
        </template>

        <template #status="{ record }">
          <a-tag size="small" :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>

        <template #notify_state="{ record }">
          <a-tag size="small" :color="record.status === 2 ? (record.notify_state === 1 ? 'blue' : 'red') : 'gray'">
            {{ record.status === 2 ? (record.notify_state === 1 ? "Success" : "Failed") : "-" }}
          </a-tag>
        </template>

        <!-- less common actions are placed on the Details page to keep the primary view clean -->
        <template #optional="{ record }">
          <a-space wrap>
            <a-button size="mini" type="primary" @click="showDetail(record)">Details</a-button>
            <a-button size="mini" type="primary" status="warning" :disabled="record.status === 2" @click="showPaidModal(record)">
              Manual Pay
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>

  <DetailModal :visible="detailVisible" :detailData="detailData" @close="closeDetail" />

  <!-- Manual Pay modal -->
  <a-modal
    v-model:visible="paidModalVisible"
    title="Confirm Manual Payment"
    @ok="confirmPaid"
    @cancel="closePaidModal"
    ok-text="Confirm Manual Payment"
    cancel-text="Cancel"
    :width="paidDialogWidth"
    :mask-closable="false"
  >
    <div class="paid-modal-content">
      <a-alert type="warning" style="margin-bottom: 20px">
        <template #icon>
          <icon-exclamation-circle-fill />
        </template>
        <div style="font-weight: 500">Warning</div>
        <div style="font-size: 13px; margin-top: 4px; color: #666">
          Manual payment will forcibly mark the order as paid even if the user has not actually paid. Use with caution!
        </div>
      </a-alert>

      <a-form :model="paidForm" layout="vertical">
        <a-form-item field="ref_hash" label="Transaction Hash" :rules="[{ maxLength: 200, message: 'Hash cannot exceed 200 characters' }]">
          <a-input v-model="paidForm.ref_hash" placeholder="Enter blockchain transaction hash (optional)" allow-clear>
            <template #prefix>
              <icon-link />
            </template>
          </a-input>
          <template #extra>
            <div style="font-size: 12px; color: #86909c; margin-top: 4px">If there is an actual transaction, enter the corresponding blockchain transaction hash.</div>
          </template>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { listAPI, paidAPI, delOrderApi } from "@/api/modules/order/index";
import { List, FormData, Pagination } from "./config";
import { Notification } from "@arco-design/web-vue";
import { useUserInfoStore } from "@/store/modules/user-info";
import DetailModal from "./components/detail.vue";
import { useOrderDetail } from "./detail";
import { getCryptoColor } from "@/views/rate/common";
import { useLayoutModel } from "@/hooks/useLayoutModel";

const userStores = useUserInfoStore();
const { detailVisible, detailData, showDetail, closeDetail } = useOrderDetail();
const { dialogWidth } = useLayoutModel();
const paidDialogWidth = computed(() => dialogWidth("500px"));
const tradeTypeOptions = computed(() => Object.entries(userStores.trade_type).map(([value, label]) => ({ value, label })));

const statusOptions = [
  { value: 1, label: "Waiting for Payment" },
  { value: 2, label: "Payment Successful" },
  { value: 3, label: "Transaction Expired" },
  { value: 4, label: "Transaction Canceled" },
  { value: 5, label: "Waiting for Confirmation" },
  { value: 6, label: "Confirmation Failed" }
];

const formData = reactive<FormData>({
  form: {
    order_id: "",
    trade_id: "",
    trade_type: "",
    address: "",
    status: undefined,
    createTime: []
  },
  search: false
});
const selectedKeys = ref<string[]>([]);
const orderSelection = reactive({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false
});
const batchDelConfirm = computed(() => `Delete these ${selectedKeys.value.length} records?`);
const loading = ref(false);
const data = reactive<List[]>([]);
const pagination = ref<Pagination>({
  showPageSize: true,
  showTotal: true,
  current: 1,
  pageSize: 10,
  total: 10
});

const columns = [
  { title: "ID", align: "center", dataIndex: "id", width: 80 },
  { title: "Merchant Order", align: "center", dataIndex: "order_id", width: 220, ellipsis: true, tooltip: true },
  { title: "Trade Type", align: "center", dataIndex: "trade_type", width: 120 },
  { title: "Trade Amount", align: "center", dataIndex: "amount", slotName: "amount", width: 150 },
  { title: "Transaction Amount", align: "center", dataIndex: "money", slotName: "money", width: 150 },
  { title: "Receiving Wallet", align: "center", dataIndex: "wallet.name", slotName: "wallet", width: 150, ellipsis: true },
  { title: "Transaction Status", dataIndex: "status", align: "center", slotName: "status", width: 100 },
  { title: "Callback", dataIndex: "notify_state", align: "center", slotName: "notify_state", width: 80 },
  { title: "Created At", dataIndex: "created_at", align: "center", width: 160 },
  { title: "Actions", slotName: "optional", align: "center", fixed: "right", width: 150 }
];

const statusMap: Record<number, { color: string; text: string }> = {
  1: { color: "blue", text: "Waiting for Payment" },
  2: { color: "green", text: "Transaction Successful" },
  3: { color: "gray", text: "Transaction Expired" },
  4: { color: "gold", text: "Transaction Canceled" },
  5: { color: "pinkpurple", text: "Waiting for Confirmation" },
  6: { color: "red", text: "Confirmation Failed" }
};

const getStatusColor = (status: number): string => statusMap[status]?.color || "gray";
const getStatusText = (status: number): string => statusMap[status]?.text || "Unknown";

const pageChange = (page: number) => {
  pagination.value.current = page;
  getOrderList();
};

const pageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  getOrderList();
};

const onReset = () => {
  formData.form = {
    order_id: "",
    trade_id: "",
    trade_type: "",
    address: "",
    status: undefined,
    createTime: []
  };
  getOrderList();
};

const getOrderList = async () => {
  try {
    loading.value = true;

    const params: any = {
      page: pagination.value.current,
      size: pagination.value.pageSize,
      sort: "desc",
      keyword: "",
      order_id: formData.form.order_id,
      trade_id: formData.form.trade_id,
      address: formData.form.address,
      trade_type: formData.form.trade_type
    };

    // add status filter
    if (formData.form.status !== undefined) {
      params.status = formData.form.status;
    }

    // add time range filter
    if (formData.form.createTime && formData.form.createTime.length === 2) {
      params.start_at = formData.form.createTime[0];
      params.end_at = formData.form.createTime[1];
    }

    const res = await listAPI(params);

    data.length = 0;
    data.push(...res.data);
    pagination.value.total = res.total;
  } finally {
    loading.value = false;
  }
};

const paidModalVisible = ref(false);
const paidForm = reactive({
  ref_hash: "",
  recordId: 0
});

const showPaidModal = (record: List) => {
  paidForm.recordId = record.id;
  paidForm.ref_hash = "";
  paidModalVisible.value = true;
};

const closePaidModal = () => {
  paidModalVisible.value = false;
  paidForm.ref_hash = "";
  paidForm.recordId = 0;
};

const confirmPaid = async () => {
  try {
    await paidAPI({
      id: paidForm.recordId,
      ref_hash: paidForm.ref_hash || "" // ensure empty string is passed when blank
    });
    closePaidModal();
    getOrderList();
    Notification.success("Manual payment successful");
  } catch (error) {
    Notification.error(error);
  }
};
const onBatchDelete = async () => {
  try {
    await delOrderApi({ ids: selectedKeys.value });
    pagination.value.current = 1;
    getOrderList();
    Notification.success("Deleted successfully");
    selectedKeys.value = [];
  } catch (error) {
    Notification.error(error);
  }
};

getOrderList();
</script>

<style lang="scss" scoped>
.rotate-icon {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.search-btn {
  margin-bottom: 20px;
}

.wallet-name {
  cursor: help;
  color: $color-link;

  &:hover {
    text-decoration: underline;
  }
}

// add in style tag
.paid-modal-content {
  padding: 4px 0;

  :deep(.arco-alert) {
    border-radius: 6px;
  }

  :deep(.arco-form-item-label-col) {
    font-weight: 500;
    color: $color-text-1;
  }

  :deep(.arco-input-wrapper) {
    &:hover {
      border-color: $color-primary;
    }
  }
}

:deep(.arco-modal) {
  .arco-modal-header {
    border-bottom: 1px solid var(--color-neutral-3);
    padding: 16px 20px;
  }

  .arco-modal-body {
    padding: 20px;
  }

  .arco-modal-footer {
    border-top: 1px solid var(--color-neutral-3);
    padding: 12px 20px;
  }
}

// responsive handling
@media (max-width: 1200px) {
  :deep(.arco-table-th),
  :deep(.arco-table-td) {
    padding: 8px 6px !important;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  :deep(.arco-modal) {
    width: 95vw !important;
    margin: 10px;
  }

  :deep(.arco-table-th),
  :deep(.arco-table-td) {
    padding: 6px 4px !important;
    font-size: 11px;
  }
}
</style>
