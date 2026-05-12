<template>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useThemeMethods } from "@/hooks/useThemeMethods";

// initialize theme
const onTheme = () => {
  let { initTheme } = useThemeMethods();
  initTheme();
};
onTheme();
</script>

<style lang="scss" scoped></style>
