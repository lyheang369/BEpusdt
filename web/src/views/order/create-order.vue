<template>
  <div class="snow-page">
    <a-spin :loading="loading" style="display: block">
      <div class="snow-inner container">
        <a-row justify="center">
          <a-col :xs="22" :sm="18" :md="16" :lg="16" :xl="12" :xxl="12">
            <a-steps :current="currentStep" line-less>
              <a-step description="Create Order">Basic Information</a-step>
              <a-step description="Created Successfully">Complete</a-step>
            </a-steps>
          </a-col>
        </a-row>
        <a-row justify="center" class="margin-top">
          <a-col :xs="18" :sm="12" :md="12" :lg="12" :xl="12" :xxl="12">
            <a-form ref="formRef" auto-label-width :layout="formLayout" :model="form" :rules="rules" @submit="handleSubmit">
              <div v-if="currentStep == 1">
                <a-form-item field="name" label="Payment Item" :validate-trigger="['change', 'input']">
                  <a-input :style="{ width: '100%' }" v-model="form.name" placeholder="Enter payment item" allow-clear />
                </a-form-item>
                <a-form-item field="order_id" label="Order Number" :validate-trigger="['change', 'input']">
                  <a-input :style="{ width: '100%' }" v-model="form.order_id" placeholder="Enter order number" allow-clear />
                </a-form-item>
                <a-form-item field="amount" label="Order Amount" :validate-trigger="['change', 'input']">
                  <a-input-number :style="{ width: '100%' }" v-model="form.amount" placeholder="Enter order amount" allow-clear />
                </a-form-item>
                <a-form-item field="trade_fiat" label="Fiat Currency" :rules="[{ required: true, message: 'Fiat currency is required' }]">
                  <a-select v-model="form.trade_fiat" placeholder="Select" allow-clear>
                    <a-option v-for="(_, key) in userInfoStore.trade_fiat" :key="key" :value="key">{{ key }}</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item field="trade_crypto" label="Limit Cryptocurrency (leave empty for no limit)">
                  <a-select v-model="form.trade_crypto" placeholder="Select" multiple>
                    <a-option v-for="(_, key) in userInfoStore.trade_crypto" :key="key" :value="key">{{ key }}</a-option>
                  </a-select>
                </a-form-item>
                <a-form-item field="timeout" label="Order Validity (hours)">
                  <a-slider v-model="form.timeout" :max="3" />
                </a-form-item>
              </div>

              <div v-if="currentStep == 2">
                <a-result :status="resultStatus" :title="resultTitle">
                  <template #subtitle> {{ resultSubtitle }} </template>
                  <template #extra>
                    <a-space direction="vertical" size="large">
                      <a-space v-if="resultStatus === 'success'" class="payment-link-row" wrap>
                        <span>Order Link: </span>
                        <a-link class="payment-link" :href="paymentUrl" target="_blank" :hoverable="false">{{ paymentUrl }}</a-link>
                      </a-space>
                      <a-space wrap>
                        <a-button type="primary" v-if="resultStatus === 'success'" @click="copyLink">Copy Order Link</a-button>
                        <a-button @click="resetForm">Create Again</a-button>
                      </a-space>
                    </a-space>
                  </template>
                </a-result>
              </div>
              <a-form-item v-if="currentStep != 2">
                <a-space>
                  <a-button @click="onLastStep" v-if="currentStep != 1">Previous</a-button>
                  <a-button html-type="submit" type="primary">Next</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </a-col>
        </a-row>
        <a-row v-if="currentStep == 2">
          <a-col :span="16" :offset="4">
            <a-typography class="result-tip">
              <a-typography-paragraph>Notice</a-typography-paragraph>
              <ul>
                <li>You can send this link to the customer for payment.</li>
                <li>This order is valid within the period you set.</li>
              </ul>
            </a-typography>
          </a-col>
        </a-row>
      </div>
    </a-spin>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useUserInfoStore } from "@/store/modules/user-info";
import { createOrderApi } from "@/api/modules/order";
import { Message } from "@arco-design/web-vue";

import dayjs from "dayjs";

const copyLink = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(paymentUrl.value);
      Message.success("CopySuccess");
    } else {
      // Fallback for non-secure contexts or older browsers
      const textArea = document.createElement("textarea");
      textArea.value = paymentUrl.value;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        Message.success("CopySuccess");
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        Message.error("Copy failed");
      }
      document.body.removeChild(textArea);
    }
  } catch (e) {
    console.error(e);
    Message.error("Copy failed");
  }
};

const loading = ref(false);
const currentStep = ref(1);
const userInfoStore = useUserInfoStore();

const formRef = ref();
const formLayout = ref("vertical");
const rules = {
  name: [
    { required: true, message: 'Payment item is required' },
    { minLength: 3, message: 'Must be longer than 3 characters' }
  ],
  order_id: [{ required: true, message: 'Order number is required' }],
  amount: [
    { required: true, message: 'Order amount is required' },
    { type: 'number', min: 1, max: 99999999, message: 'Order amount must be between 1 and 99999999' }
  ],
  trade_fiat: [{ required: true, message: 'Fiat currency is required' }],
  timeout: [{ type: 'number', min: 1, message: 'Minimum is 1 hour' }]
};

const form = reactive({
  name: "",
  order_id: "",
  amount: 0,
  trade_fiat: undefined,
  trade_crypto: [],
  timeout: 1
});

const generateOrderId = () => {
  return "PAY" + dayjs().format("YYYYMMDDHHmmss");
};

const initForm = async () => {
  form.name = "";
  form.order_id = generateOrderId();

  form.amount = 0;
  form.trade_fiat = undefined;
  form.trade_crypto = [];
  form.timeout = 1;
};

onMounted(() => {
  initForm();
});

const resultStatus = ref("success");
const resultTitle = ref("Created Successfully");
const resultSubtitle = ref("Order created successfully");
const paymentUrl = ref("");

const handleSubmit = async ({ errors, values }: ArcoDesign.ArcoSubmit) => {
  if (errors) return;
  if (currentStep.value == 2) return;

  loading.value = true;
  try {
    const payload = {
      ...values,
      fiat: form.trade_fiat,
      currencies: Array.isArray(form.trade_crypto) ? form.trade_crypto.join(",") : "",
      timeout: form.timeout * 3600
    };

    const res = await createOrderApi(payload);
    if (res.code === 200) {
      resultStatus.value = "success";
      resultTitle.value = "Created Successfully";
      resultSubtitle.value = "Order created successfully";
      paymentUrl.value = res.data.payment_url;
      currentStep.value += 1;
    } else {
      resultStatus.value = "error";
      resultTitle.value = "Failed to create order";
      resultSubtitle.value = res.data.message || "Unknown error";
      paymentUrl.value = "";
      currentStep.value += 1;
    }
  } catch (err: any) {
    console.error(err);
    resultStatus.value = "error";
    resultTitle.value = "Failed to create order";
    resultSubtitle.value = err.message || "Request failed";
    paymentUrl.value = "";
    currentStep.value += 1;
  } finally {
    loading.value = false;
  }
};

const onLastStep = () => {
  if (currentStep.value == 1) return;
  currentStep.value -= 1;
};

const resetForm = () => {
  currentStep.value = 1;
  initForm();
};
</script>

<style lang="scss" scoped>
.container {
  padding: 60px 0;
}
.margin-top {
  margin-top: 60px;
}

.result-tip {
  padding: 24px;
  background: var(--color-fill-2);
}

.payment-link-row {
  max-width: 100%;
}

.payment-link {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}

@media (max-width: 768px) {
  .container {
    padding: 32px 0;
  }

  .margin-top {
    margin-top: 32px;
  }

  .result-tip {
    padding: 16px;
  }
}
</style>
