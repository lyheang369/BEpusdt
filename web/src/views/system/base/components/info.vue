<template>
  <a-row align="center" :gutter="[0, 16]">
    <a-col :span="24">
      <a-card title="Basic Information">
        <a-form :model="form" :rules="rules" :layout="layoutMode" class="base-setting-form" @submit="onSubmit">
          <a-form-item
            field="block_height_max_diff"
            label="Maximum Block Difference"
            extra="Maximum block height difference. If exceeded, scanning restarts from the current block height."
          >
            <a-input v-model="form.block_height_max_diff" placeholder="Recommended 1000" />
          </a-form-item>

          <a-form-item
            field="block_offset_confirm"
            label="Block Offset Confirmation"
            extra="Enabling this improves transaction safety but increases confirmation wait time."
          >
            <a-select v-model="form.block_offset_confirm" placeholder="Select">
              <a-option value="0">Off</a-option>
              <a-option value="1">On</a-option>
            </a-select>
          </a-form-item>

          <a-form-item
            field="notify_max_retry"
            label="Max Callback Retries"
            extra="Maximum retries after payment callback failure. Retry intervals in minutes: 2, 4, 8, 16, 32, 64..."
          >
            <a-input v-model="form.notify_max_retry" placeholder="Recommended 10" />
          </a-form-item>

          <a-form-item
            field="payment_min_amount"
            label="Minimum Single Payment"
            extra="Minimum allowed amount for a single payment, in the fiat currency passed when creating the transaction. Used for risk control."
          >
            <a-input v-model="form.payment_min_amount" placeholder="Recommended 0.01" />
          </a-form-item>

          <a-form-item
            field="payment_max_amount"
            label="Maximum Single Payment"
            extra="Maximum allowed amount for a single payment, in the fiat currency passed when creating the transaction. Used for risk control."
          >
            <a-input v-model="form.payment_max_amount" placeholder="Suggested 9999" />
          </a-form-item>

          <a-form-item
            field="payment_timeout"
            label="Default Order Timeout"
            extra="Default order timeout in seconds. Orders unpaid after this time are automatically closed."
          >
            <a-input v-model="form.payment_timeout" placeholder="Recommended 1200" />
          </a-form-item>

          <a-form-item field="payment_match_mode" label="Amount Matching Mode">
            <template #extra>
              When confirming order amounts, different matching algorithms can be used. For details, see
              <a-link
                href="https://github.com/v03413/BEpusdt/blob/main/docs/payment-match-mode/README.md"
                target="_blank"
                :hoverable="false"
              >
                Documentation
              </a-link>
            </template>
            <a-select v-model="form.payment_match_mode" placeholder="Select amount matching mode">
              <a-option value="classic">Classic Mode</a-option>
              <a-option value="has_prefix">Prefix Match</a-option>
              <a-option value="round_off">Rounded Match</a-option>
            </a-select>
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

const form = ref({
  payment_timeout: "",
  block_height_max_diff: "",
  block_offset_confirm: "0",
  notify_max_retry: "",
  payment_max_amount: "",
  payment_min_amount: "",
  payment_match_mode: "classic"
});
const rules = {
  block_height_max_diff: [
    {
      required: true,
      type: "number",
      positive: true,
      message: "Maximum block difference is required"
    }
  ],
  block_offset_confirm: [
    {
      required: true,
      message: "Block offset confirmation is required"
    }
  ],
  notify_max_retry: [
    {
      required: true,
      type: "number",
      positive: true,
      message: "Maximum callback retry count is required"
    }
  ],
  payment_min_amount: [
    {
      required: true,
      type: "number",
      positive: true,
      message: "Minimum payment amount is required"
    }
  ],
  payment_max_amount: [
    {
      required: true,
      type: "number",
      positive: true,
      message: "Maximum payment amount is required"
    }
  ],
  payment_timeout: [
    {
      required: true,
      type: "number",
      min: 180,
      max: 3600,
      message: "Default order timeout must be between 180 and 3600 seconds",
      positive: true
    }
  ],
  payment_match_mode: [
    {
      required: true,
      message: "Amount matching mode is required"
    }
  ]
};

const onSubmit = async ({ errors }: ArcoDesign.ArcoSubmit) => {
  if (errors) return;

  await setsConfAPI([
    { key: "block_height_max_diff", value: form.value.block_height_max_diff },
    { key: "block_offset_confirm", value: form.value.block_offset_confirm },
    { key: "notify_max_retry", value: form.value.notify_max_retry },
    { key: "payment_max_amount", value: form.value.payment_max_amount },
    { key: "payment_min_amount", value: form.value.payment_min_amount },
    { key: "payment_timeout", value: form.value.payment_timeout },
    { key: "payment_match_mode", value: form.value.payment_match_mode }
  ]);

  Message.success("Saved successfully");

  emit("refresh");
};

watch(
  () => data.value,
  () => {
    form.value.block_height_max_diff = data.value.block_height_max_diff;
    form.value.block_offset_confirm = data.value.block_offset_confirm || "0";
    form.value.notify_max_retry = data.value.notify_max_retry;
    form.value.payment_max_amount = data.value.payment_max_amount;
    form.value.payment_min_amount = data.value.payment_min_amount;
    form.value.payment_timeout = data.value.payment_timeout;
    form.value.payment_match_mode = data.value.payment_match_mode || "classic";
  }
);
</script>

<style lang="scss" scoped>
.row-title {
  font-size: $font-size-title-1;
}
</style>
