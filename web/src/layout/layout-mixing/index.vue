<template>
  <a-layout class="layout">
    <div :class="asideDark ? 'aside dark' : 'aside'" v-if="isPc">
      <Logo />
      <a-layout-sider :collapsed="collapsed" breakpoint="xl" class="layout_side" :width="220">
        <a-scrollbar style="height: 100%; overflow: auto" outer-class="scrollbar"><Menu :route-tree="routeList" /></a-scrollbar>
      </a-layout-sider>
    </div>
    <a-layout class="layout-right">
      <a-layout-header class="header">
        <div class="header-left">
          <ButtonCollapsed />
          <Breadcrumb v-if="!isPc" />
        </div>

        <div class="layout-head-menu" v-if="isPc">
          <a-menu
            v-if="drawing"
            mode="horizontal"
            :selected-keys="[selectedMenu]"
            @menu-item-click="onMenuItem"
            :popup-max-height="600"
          >
            <template v-for="item in routeTree" :key="item.path">
              <a-menu-item v-if="!item.meta.hide" :key="item.path" :popup-max-height="600">
                <template #icon v-if="item.meta.svgIcon || item.meta.icon">
                  <MenuItemIcon :svg-icon="item.meta.svgIcon" :icon="item.meta.icon" />
                </template>
                <span>{{ $t(`menu.${item.meta.title}`) }}</span>
              </a-menu-item>
            </template>
          </a-menu>
        </div>
        <HeaderRight />
      </a-layout-header>
      <Main />
      <Footer v-if="isFooter" />
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import Logo from "@/layout/components/Logo/index.vue";
import Main from "@/layout/components/Main/index.vue";
import Footer from "@/layout/components/Footer/index.vue";
import Menu from "@/layout/components/Menu/index.vue";
import HeaderRight from "@/layout/components/Header/components/header-right/index.vue";
import MenuItemIcon from "@/layout/components/Menu/menu-item-icon.vue";
import ButtonCollapsed from "@/layout/components/Header/components/button-collapsed/index.vue";
import Breadcrumb from "@/layout/components/Header/components/Breadcrumb/index.vue";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { useRoutingMethod } from "@/hooks/useRoutingMethod";
import { storeToRefs } from "pinia";
import { useThemeConfig } from "@/store/modules/theme-config";
import { useDevicesSize } from "@/hooks/useDevicesSize";
defineOptions({ name: "LayoutMixing" });
const route = useRoute();
const router = useRouter();
const routerStore = useRouteConfigStore();
const themeStore = useThemeConfig();
const { isFooter, collapsed, asideDark, language } = storeToRefs(themeStore);
const { routeTree } = storeToRefs(routerStore);
const { isPc } = useDevicesSize();

const drawing = ref<boolean>(true);
watch(language, () => {
  drawing.value = false;
  nextTick(() => (drawing.value = true));
});

// horizontal menu click event
// 将one级菜单下的children给左侧菜单
// 如果没有children则直接自身菜单给左侧菜单
const routeList = ref<any>([]);
const onMenuItem = (path: string) => {
  const { findLinearArray } = useRoutingMethod();
  const find = findLinearArray(path);
  // route存在则存入并跳转，不存在则跳404
  if (find) {
    // assign the left tree
    setAside(find);
    // 若有重定向，则跳转到重定向的route
    // 如果有子route则重定向到自己的No. one个菜单
    // 如果没有子route则说明当前父级Yesone个菜单，直接跳转
    let path = "";
    if (find.redirect) {
      path = find.redirect;
    } else if (find.children && find.children.length > 0) {
      path = find.children[0].path;
    } else {
      path = find.path;
    }
    router.push(path);
  } else {
    router.push("/404");
  }
};

// assign the left tree
const setAsideMenu = (find: Menu.MenuOptions) => {
  // 将父级的chindren给左侧树
  if (find.children && find.children.length > 0) {
    routeList.value = find.children;
  } else {
    // 如果没有则直接将父级给左侧树，做one级兜底
    routeList.value = [find];
  }
};

const setAside = debounce(setAsideMenu, 150);

// 由于Refresh后，routeinformation丢失，所以需要重新获取
// Mixed Layout的横向菜单为顶层route下的one级菜单
const selectedMenu = computed(() => {
  const { getAllParentRoute } = useRoutingMethod();
  // Dynamic Route参数会在path拼接，导致匹配Failed
  // 这取matched做route匹配
  const find = getAllParentRoute(route.matched.at(-1).path);
  if (find) {
    setAside(find[0]);
    return find[0].path;
  }
  return "";
});
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
}
.dark {
  background: #232324;
}
.layout_side {
  height: calc(100% - 60px);
  .scrollbar {
    height: 100%;
  }
}

// Editleft scrollbar width
:deep(.arco-scrollbar-thumb-direction-vertical .arco-scrollbar-thumb-bar) {
  width: 4px;
  margin-left: 8px;
}

// remove right shadow and replace with border
:deep(.arco-layout-sider-light) {
  border-right: $border-1 solid $color-border-2;
  box-shadow: unset;
}

// fix collapsed menu icon centering
:deep(.arco-menu-vertical.arco-menu-collapsed) {
  // remove icon padding and center the element
  .arco-menu-has-icon {
    justify-content: center;
    padding: 0;
  }

  // remove icon margin-right and set padding to preserve spacing
  .arco-menu-icon {
    padding: 10px 0;
    margin-right: 0;
  }

  // remove title placeholder
  .arco-menu-title {
    display: none;
  }
}

// remove sider background
.arco-layout-sider {
  background: unset;
}
.layout-right {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  .header {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 $padding;
    overflow: hidden;
    border-bottom: $border-1 solid $color-border-2;
    .header-left {
      display: flex;
      align-items: center;
    }
  }
  .layout-head-menu {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
}
:deep(.arco-menu-pop) {
  white-space: nowrap;
}

// 横向菜单样式Edit
:deep(.arco-menu-horizontal) {
  flex: 1;
  overflow: hidden;
  .arco-menu-inner {
    padding-left: 0; // 横向排列，禁用左padding
    .arco-menu-overflow-wrap {
      white-space: nowrap; // 禁用换行，No则会导致菜单换行闪烁
    }
  }
}
</style>
