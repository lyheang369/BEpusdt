<template>
  <div class="shortcut-box">
    <div class="box-title">
      <div>Data Summary</div>
    </div>
    <a-divider :margin="16" />
    <a-grid class="finance-card" :cols="{ xs: 1, sm: 2, lg: 3, xl: 5 }" :col-gap="16" :row-gap="20">
      <a-grid-item v-for="(item, index) in financeData" :key="index">
        <a-card hoverable class="finance-a-card" :class="'animated-fade-up-' + index">
          <div class="finance-nav">
            <div class="tag-dot" :style="{ border: `3px solid ${item.color}` }"></div>
            <span class="finance-nav-title">{{ item.title }}</span>
          </div>
          <div class="finance-value">{{ item.value }}</div>
          <div class="finance-sub">
            <span>{{ item.subLabel }}</span>
            <span>{{ item.subValue }}</span>
          </div>
        </a-card>
      </a-grid-item>
    </a-grid>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  homeData: any;
}>();

const formatAmount = (value: any) => Number(value || 0).toFixed(2);

const formatPeriod = (from?: string, to?: string) => {
  if (!from || !to) return "--";
  return `${from.slice(5, 10).replace("-", "/")} - ${to.slice(5, 10).replace("-", "/")}`;
};

const buildFinanceData = (data: any) => {
  const kpi = data?.kpi || {};
  return [
    {
      id: 1,
      title: "Total Orders",
      value: kpi.orders_total || 0,
      subLabel: "Paid Orders:",
      subValue: kpi.orders_success || 0,
      color: "#165DFF"
    },
    {
      id: 2,
      title: "Received Amount",
      value: formatAmount(kpi.gmv_paid),
      subLabel: "Payment Success Rate:",
      subValue: `${formatAmount(kpi.order_success_rate)}%`,
      color: "#14A058"
    },
    {
      id: 3,
      title: "Pending Orders",
      value: kpi.orders_pending || 0,
      subLabel: "Confirming Orders:",
      subValue: kpi.orders_confirming || 0,
      color: "#F5A623"
    },
    {
      id: 4,
      title: "FailedOrder",
      value: kpi.orders_failed || 0,
      subLabel: "NotificationsFailed:",
      subValue: kpi.notify_failed || 0,
      color: "#E33E38"
    },
    {
      id: 5,
      title: "Statistics Period",
      value: formatPeriod(data?.from, data?.to),
      subLabel: "",
      subValue: data?.timezone || "--",
      color: "#722ED1"
    }
  ];
};

const financeData = ref(buildFinanceData(props.homeData));

watch(
  () => props.homeData,
  newData => {
    financeData.value = buildFinanceData(newData);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.shortcut-box {
  .card-box {
    margin-bottom: $padding;
    .shortcut-card-label {
      width: 100px;
      margin-left: 20px;
      font-size: $font-size-body-3;
      color: $color-text-2;
    }
  }
  .card-middling {
    width: 200px;
  }
  .row-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.box-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: $font-size-body-3;
  color: $color-text-1;
}
.finance-a-card {
  min-height: 126px;
}
.finance-value {
  margin: 14px 0 0 16px;
  color: $color-text-1;
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  word-break: break-word;
}
.finance-sub {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 8px 0 0 16px;
  color: $color-text-2;
  font-size: 13px;
  line-height: 18px;
  white-space: nowrap;
}
.margin-left-text {
  margin-left: $margin-text;
}
</style>
