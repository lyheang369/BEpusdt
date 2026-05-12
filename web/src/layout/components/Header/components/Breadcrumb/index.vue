<template>
  <div id="system-breadcrumb" class="breadcrumb" v-if="!isMobile && isBreadcrumb">
    <a-space direction="vertical">
      <a-breadcrumb>
        <a-breadcrumb-item v-for="(item, index) in breadcrumb" :key="item.path" :class="transition">
          <span v-if="index === breadcrumb.length - 1" class="main_button">{{ $t(`menu.${item?.meta?.title || ""}`) }}</span>
          <span v-else class="route_button" @click="onBreadcrumb(item)">{{ $t(`menu.${item?.meta?.title || ""}`) }}</span>
        </a-breadcrumb-item>
      </a-breadcrumb>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useThemeConfig } from "@/store/modules/theme-config";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { useDevicesSize } from "@/hooks/useDevicesSize";
import { findPathOfParentNode } from "@/utils/tree-tools";
import { HOME_PATH } from "@/config/index";
const themeStore = useThemeConfig();
const { isBreadcrumb, transitionPage } = storeToRefs(themeStore);
const routeConfigStore = useRouteConfigStore();
const { routeTree } = storeToRefs(routeConfigStore);
const { isMobile } = useDevicesSize();
const route = useRoute();
const router = useRouter();

/**
 * 获取Breadcrumb
 * 根据current routeinformation获取，route.matched可以获取current route的所有父级routeinformation
 * 如果current routeYeshomeroute，则只返回current routeinformation(说明当前就Yes顶层)
 * No则返回所有父级routeinformation，顶层route重写为Home
 */
const breadcrumb = computed(() => {
  // 如果YesHome则直接返回current routeinformation
  if (route.path === HOME_PATH) return [route];
  // 返回路径information
  let list = findPathOfParentNode(routeTree.value, "name", route.name);
  if (!list) return [];
  if (!routeTree.value[0].children) list.unshift(routeTree.value[0]);
  return list;
});

// Page Transition
const transition = computed(() => {
  if (transitionPage.value === "fadeInOut") {
    return "fadeInOut-enter-active";
  } else if (transitionPage.value === "cardInOut") {
    return "cardInOut-enter-active";
  } else {
    return "fadeOut-enter-active";
  }
});

// Breadcrumb跳转
const onBreadcrumb = (route: any) => {
  let path = route.redirect || route.path;
  router.replace((path as string) || HOME_PATH);
};
</script>

<style lang="scss" scoped>
.breadcrumb {
  margin-left: $margin;
  overflow: auto;
  .main_button {
    color: $color-text-1;
    white-space: nowrap;
    cursor: pointer;
  }
  .route_button {
    color: $color-text-2;
    white-space: nowrap;
    cursor: pointer;
    &:hover {
      color: $color-primary;
    }
  }
}
</style>
