<template>
  <div class="snow-page">
    <div class="snow-inner">
      <a-form ref="formRef" auto-label-width :model="formData.form">
        <a-row :gutter="16">
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="name" label="Wallet Name">
              <a-input v-model="formData.form.name" placeholder="Enter name" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6" :xxl="6">
            <a-form-item field="qrcode" label="Wallet Address">
              <a-input v-model="formData.form.address" placeholder="Enter wallet address" allow-clear />
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
            <a-space class="search-btn" wrap>
              <a-button type="primary" @click="getCommonTableList">
                <template #icon><icon-search /></template>
                Search
              </a-button>
              <a-button @click="onReset">
                <template #icon><icon-refresh /></template>
                Reset
              </a-button>
              <a-button type="primary" status="success" @click="onAdd">
                <template #icon><icon-plus /></template>
                Add Wallet
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>

      <a-table
        row-key="key"
        size="small"
        :bordered="{ cell: true }"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
        :loading="loading"
        :columns="columns"
        :data="data"
        v-model:selectedKeys="selectedKeys"
        :pagination="pagination"
        @page-change="pageChange"
        @page-size-change="pageSizeChange"
      >
        <template #address="{ record }">
          <div class="address-cell">
            <a-typography-text copyable class="address-text">
              {{ record.address }}
            </a-typography-text>
          </div>
        </template>

        <template #status="{ record }">
          <a-tag size="small" :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? "Enabled" : "Disabled" }}
          </a-tag>
        </template>

        <template #other_notify="{ record }">
          <a-tag size="small" :color="record.other_notify === 1 ? 'arcoblue' : 'gray'">
            {{ record.other_notify === 1 ? "On" : "Off" }}
          </a-tag>
        </template>

        <template #optional="{ record }">
          <a-space wrap>
            <a-button size="mini" type="primary" @click="showDetail(record)">Details</a-button>
            <a-button size="mini" @click="onMod(record)">Edit</a-button>
            <a-popconfirm content="Delete this record?" type="warning" @ok="onDelete(record)">
              <a-button size="mini" type="primary" status="danger">Delete</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>

  <!-- Add Wallet dialog -->
  <a-modal :width="formDialogWidth" v-model:visible="open" @close="afterClose" @ok="addWallet" @cancel="afterClose">
    <template #title>{{ title }}</template>
    <a-form ref="formRef" auto-label-width :layout="formLayout" :rules="rules" :model="addFrom">
      <a-form-item field="name" label="Wallet Name" validate-trigger="blur">
        <a-input v-model="addFrom.name" placeholder="Enter wallet name" allow-clear />
      </a-form-item>
      <a-form-item field="address" label="Wallet Address" validate-trigger="blur">
        <a-input v-model="addFrom.address" placeholder="Enter wallet address" allow-clear />
      </a-form-item>
      <a-form-item field="trade_type" label="Trade Type" :rules="[{ required: true, message: 'Trade type is required' }]">
        <a-select v-model="addFrom.trade_type" placeholder="Select" allow-clear allow-search>
          <a-option v-for="item in tradeTypeOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="other_notify" label="Other Notifications">
        <a-select v-model="addFrom.other_notify" placeholder="Select" allow-clear>
          <a-option :value="0">Off</a-option>
          <a-option :value="1">Enabled</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="remark" label="Remarks" validate-trigger="blur">
        <a-textarea v-model="addFrom.remark" placeholder="EnterRemarks" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- Edit Wallet dialog -->
  <a-modal :width="formDialogWidth" v-model:visible="modOpen" @close="afterModClose" @ok="modWallet" @cancel="afterModClose">
    <template #title>{{ modTitle }}</template>
    <a-form ref="modFormRef" auto-label-width :layout="formLayout" :rules="rules" :model="modFrom">
      <a-form-item field="name" label="Wallet Name" validate-trigger="blur">
        <a-input v-model="modFrom.name" placeholder="Enter wallet name" allow-clear />
      </a-form-item>
      <a-form-item field="address" label="Wallet Address" validate-trigger="blur">
        <a-input v-model="modFrom.address" placeholder="Enter wallet address" allow-clear />
      </a-form-item>
      <a-form-item field="trade_type" label="Trade Type" :rules="[{ required: true, message: 'Trade type is required' }]">
        <a-select v-model="modFrom.trade_type" placeholder="Select" allow-clear allow-search>
          <a-option v-for="item in tradeTypeOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="status" label="Receiving Status">
        <a-select v-model="modFrom.status" placeholder="Select" allow-clear>
          <a-option :value="1">Enabled</a-option>
          <a-option :value="0">Disabled</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="other_notify" label="Other Notifications">
        <a-select v-model="modFrom.other_notify" placeholder="Select" allow-clear>
          <a-option :value="0">Off</a-option>
          <a-option :value="1">On</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="remark" label="Remarks" validate-trigger="blur">
        <a-textarea v-model="modFrom.remark" placeholder="EnterRemarks" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>

  <!-- Details dialog -->
  <a-modal
    :width="detailDialogWidth"
    v-model:visible="detailVisible"
    @close="closeDetail"
    @cancel="closeDetail"
    :footer="false"
    unmount-on-close
  >
    <template #title>
      <div class="detail-modal-title">
        <icon-star />
        <span>Wallet Details</span>
      </div>
    </template>

    <div class="detail-content">
      <a-card class="detail-card" title="Basic Information" :bordered="false">
        <template #extra>
          <a-tag size="medium" :color="detailData.status === 1 ? 'green' : 'red'" class="status-tag">
            <icon-check-circle v-if="detailData.status === 1" />
            <icon-close-circle v-else />
            {{ detailData.status === 1 ? "Enabled" : "Disabled" }}
          </a-tag>
        </template>

        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-idcard />
                <span>Wallet ID</span>
              </div>
              <div class="detail-value">{{ detailData.id }}</div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-user />
                <span>Wallet Name</span>
              </div>
              <div class="detail-value">{{ detailData.name }}</div>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="24">
            <div class="detail-item">
              <div class="detail-label">
                <icon-location />
                <span>Wallet Address</span>
              </div>
              <div class="detail-value address-value">
                <a-typography-text copyable>{{ detailData.address }}</a-typography-text>
              </div>
            </div>
          </a-col>
        </a-row>

        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-swap />
                <span>Trade Type</span>
              </div>
              <div class="detail-value">
                <a-tag color="blue">{{ detailData.trade_type }}</a-tag>
              </div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12">
            <div class="detail-item">
              <div class="detail-label">
                <icon-notification />
                <span>Monitoring Status</span>
              </div>
              <div class="detail-value">
                <a-tag :color="detailData.other_notify === 1 ? 'arcoblue' : 'gray'">
                  <icon-eye v-if="detailData.other_notify === 1" />
                  <icon-eye-invisible v-else />
                  {{ detailData.other_notify === 1 ? "Enabled" : "Disabled" }}
                </a-tag>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <a-card class="detail-card" title="Remarks" :bordered="false" v-if="detailData.remark">
        <div class="remark-content">
          <icon-message />
          <span>{{ detailData.remark }}</span>
        </div>
      </a-card>

      <a-card class="detail-card" title="Time Information" :bordered="false" v-if="detailData.created_at || detailData.updated_at">
        <a-row :gutter="24">
          <a-col :xs="24" :sm="24" :md="12" v-if="detailData.created_at">
            <div class="detail-item">
              <div class="detail-label">
                <icon-plus-circle />
                <span>Created At</span>
              </div>
              <div class="detail-value">{{ detailData.created_at }}</div>
            </div>
          </a-col>
          <a-col :xs="24" :sm="24" :md="12" v-if="detailData.updated_at">
            <div class="detail-item">
              <div class="detail-label">
                <icon-edit />
                <span>Updated At</span>
              </div>
              <div class="detail-value">{{ detailData.updated_at }}</div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { getWalletListAPI, delWalletAPI, addWalletAPI, modWalletAPI } from "@/api/modules/wallet/index";
import { List, FormData, Pagination, AddForm, ModForm } from "./config";
import { Notification } from "@arco-design/web-vue";
import { useUserInfoStore } from "@/store/modules/user-info";
import { useWalletDetail } from "./detail";
import { useLayoutModel } from "@/hooks/useLayoutModel";

const userStores = useUserInfoStore();
const { detailVisible, detailData, showDetail, closeDetail } = useWalletDetail();
const { dialogWidth, formLayout } = useLayoutModel();
const formDialogWidth = computed(() => dialogWidth("40%"));
const detailDialogWidth = computed(() => dialogWidth("680px"));

const tradeTypeOptions = computed(() => Object.entries(userStores.trade_type).map(([value, label]) => ({ value, label })));

const formData = reactive<FormData>({
  form: { name: "", trade_type: "", address: "" },
  search: false
});

const selectedKeys = ref<string[]>([]);
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
  { title: "Name", align: "center", dataIndex: "name", width: 200 },
  { title: "Trade Type", align: "center", dataIndex: "trade_type", width: 120 },
  { title: "Wallet Address", align: "center", dataIndex: "address", slotName: "address", width: 300, ellipsis: true },
  { title: "Receiving Status", dataIndex: "status", align: "center", slotName: "status", width: 100 },
  { title: "Other Notifications", dataIndex: "other_notify", align: "center", slotName: "other_notify", width: 100 },
  { title: "Actions", slotName: "optional", align: "center", fixed: "right", width: 200 }
];

const rules = {
  name: [{ required: true, message: "Enter wallet name" }],
  address: [{ required: true, message: "Enter wallet address" }],
  trade_type: [{ required: true, message: "Enter trade type" }]
};

const formRef = ref();
const modFormRef = ref();
const title = ref("");
const modTitle = ref("");
const open = ref(false);
const modOpen = ref(false);

const addFrom = ref<AddForm>({
  name: "",
  address: "",
  trade_type: "",
  remark: "",
  other_notify: 0
});

const modFrom = ref<ModForm>({
  id: 0,
  name: "",
  address: "",
  trade_type: "",
  remark: "",
  other_notify: 0,
  status: 1
});

const pageChange = (page: number) => {
  pagination.value.current = page;
  getCommonTableList();
};

const pageSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize;
  getCommonTableList();
};

const onReset = () => {
  formData.form = { name: "", trade_type: "", address: "" };
  getCommonTableList();
};

const getCommonTableList = async () => {
  try {
    loading.value = true;
    const res = await getWalletListAPI({
      page: pagination.value.current,
      size: pagination.value.pageSize,
      sort: "desc",
      keyword: "",
      name: formData.form.name,
      trade_type: formData.form.trade_type,
      address: formData.form.address,
      status: 99
    });

    data.length = 0;
    data.push(...res.data);
    pagination.value.total = res.total;
  } finally {
    loading.value = false;
  }
};

const onDelete = async (record: List) => {
  try {
    await delWalletAPI({ id: record.id });
    getCommonTableList();
    Notification.success("Deleted successfully");
  } catch (error) {
    Notification.error(error);
  }
};

const onAdd = () => {
  title.value = "Add Wallet";
  open.value = true;
};

const onMod = (record: List) => {
  modTitle.value = "Edit Wallet";
  modFrom.value = {
    id: record.id,
    name: record.name,
    address: record.address,
    trade_type: record.trade_type || "",
    remark: record.remark || "",
    other_notify: record.other_notify || 0,
    status: record.status
  };
  modOpen.value = true;
};

const afterClose = () => {
  formRef.value.resetFields();
  addFrom.value = {
    name: "",
    address: "",
    trade_type: "",
    remark: "",
    other_notify: 0
  };
};

const afterModClose = () => {
  modFormRef.value?.resetFields();
  modFrom.value = {
    id: 0,
    name: "",
    address: "",
    trade_type: "",
    remark: "",
    other_notify: 0,
    status: 1
  };
};

const addWallet = async () => {
  const state = await formRef.value.validate();
  if (state) return;

  try {
    const submitData = {
      ...addFrom.value,
      other_notify: addFrom.value.other_notify ?? 0
    };
    await addWalletAPI(submitData);
    open.value = false;
    getCommonTableList();
    Notification.success("Added successfully");
  } catch (error) {
    Notification.error(error);
  }
};

const modWallet = async () => {
  const state = await modFormRef.value.validate();
  if (state) return;

  try {
    await modWalletAPI(modFrom.value);
    modOpen.value = false;
    getCommonTableList();
    Notification.success("Updated successfully");
  } catch (error) {
    Notification.error(error);
  }
};

getCommonTableList();
</script>

<style lang="scss" scoped>
.search-btn {
  margin-bottom: 20px;
}

.address-cell {
  max-width: 250px;

  .address-text {
    font-family: "Monaco", "Menlo", "Consolas", monospace;
    font-size: 12px;
    word-break: break-all;
    line-height: 1.4;

    :deep(.arco-typography-operation-copy) {
      color: $color-link;
      margin-left: 4px;

      &:hover {
        color: rgb(var(--link-5));
      }
    }
  }
}

.detail-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-weight: 600;
    font-size: 16px;
  }
}

.detail-content {
  padding: 8px 0;

  .detail-card {
    margin-bottom: 16px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    &:last-child {
      margin-bottom: 0;
    }

    :deep(.arco-card-header) {
      border-bottom: 1px solid var(--color-border-2);
      padding: 16px 20px 12px;

      .arco-card-header-title {
        font-weight: 600;
        color: var(--color-text-1);
      }
    }

    :deep(.arco-card-body) {
      padding: 20px;
    }
  }

  .detail-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 8px;
    }

    .detail-label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--color-text-3);
      font-weight: 500;

      .arco-icon {
        font-size: 14px;
        color: var(--color-text-4);
      }
    }

    .detail-value {
      font-size: 14px;
      color: var(--color-text-1);
      font-weight: 500;
      min-height: 22px;
      display: flex;
      align-items: center;

      :deep(.arco-typography-operation-copy) {
        color: $color-link;
        margin-left: 4px;

        &:hover {
          color: rgb(var(--link-5));
        }
      }

      &.address-value {
        word-break: break-all;
        font-family: "Monaco", "Menlo", monospace;
        font-size: 13px;

        :deep(.arco-typography) {
          font-family: inherit;
          font-size: inherit;
        }
      }
    }
  }

  .status-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;

    .arco-icon {
      font-size: 12px;
    }
  }

  .remark-content {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 16px;
    background-color: var(--color-fill-2);
    border-radius: 6px;
    line-height: 1.6;

    .arco-icon {
      margin-top: 2px;
      color: var(--color-text-3);
      flex-shrink: 0;
    }

    span {
      color: var(--color-text-2);
    }
  }
}

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

  .detail-content {
    .detail-card :deep(.arco-card-body) {
      padding: 16px;
    }

    .detail-item .detail-value.address-value {
      font-size: 12px;
    }
  }
}
</style>
