import NProgress from "@/config/nprogress";
import pinia from "@/store/index";
import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { staticRoutes, notFoundAndNoPower } from "@/router/route.ts";
import { currentlyRoute } from "@/router/route-output";
import { storeToRefs } from "pinia";
import { useUserInfoStore } from "@/store/modules/user-info";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { useRoutingMethod } from "@/hooks/useRoutingMethod";

/**
 * 创建vue的route示例
 * @method createRouter(options: RouterOptions): Router
 * @link Reference: https://next.router.vuejs.org/zh/api/#createrouter
 */
const routerHistory = import.meta.env.VITE_ROUTER_MODE === "history" ? createWebHistory() : createWebHashHistory();
const router = createRouter({
  history: routerHistory,
  /**
   * 设置静态route，其它的route通过addRoute动态添加
   * 1、staticRoutesLogin页、layout页、默认page('/')
   * 2、notFoundAndNoPower 添加默认 401、500界面，防止Notice No match found for location with path 'xxx'
   * 3、后端控制routeMedium也需要添加 notFoundAndNoPower 401、500界面
   * 静态添加 notFoundAndNoPower 401、500界面将Full Screen显示
   * 如果要 notFoundAndNoPower 在layout容器展示，则需要移除静态添加并将其添加到缓存route树
   */
  routes: [...staticRoutes, ...notFoundAndNoPower]
});

/**
 * route加载前需要判断用户YesNoLogin
 * 1、去Login页，Nonetoken，放行
 * 2、没有token，直接重定向到Login页
 * 3、去Login页，有token，直接重定向到home页
 * 4、去非Login页，有token，User InformationYesNo存在，有则放行，No则重新获取routeinformation、初始化route
 * Warning：
 * 全局routeTree不能持久化缓存
 * pageRefresh会导致addRoute动态添加的route失效，需要重新初始化route
 */
router.beforeEach(async (to: any, _: any, next: any) => {
  NProgress.start(); // On进度条
  const store = useUserInfoStore(pinia);
  const routeStore = useRouteConfigStore(pinia);
  const { token } = storeToRefs(store);
  const { routeTree } = storeToRefs(routeStore);
  // console.log("去", to, "来自", _);
  // next()Internal加了path等于跳转指定route会再次触发router.beforeEach，InternalNone参数等于放行，不会触发router.beforeEach

  // 1、Nonetoken处理
  if (!token.value) {
    // 如果Yes去Login页，直接放行；No则重定向到Login页
    return to.path === "/login" ? next() : next("/login");
  }

  // 2、有token但去Login页 -> 重定向到Home
  if (to.path === "/login") {
    // internal navigation, handle route highlight
    currentlyRoute(to);
    return next("/home");
  }

  // 3、去非Login页，有token，route树YesNo存在，有则放行，No则重新获取routeinformation、初始化route
  // 判断routeYesNo获取，先获取Accountinformation和routeinformation，添加route后再跳转(pageRefresh时触发)
  // 解决Refreshpage404的问题
  if (!routeTree.value.length) {
    const routeStore = useRouteConfigStore(pinia);
    // 获取Accountinformation
    await store.setAccount();
    // 获取routeinformation
    await routeStore.initSetRouter();

    // Common Route需要添加query
    // Dynamic Route会自动匹配params
    return next({ path: to.path, query: to.query });
  }

  // 获取外链route的处理函数
  // 所有的route正常放行，只不过额外判断YesNoYes外链，如果Yes，则打开新窗口跳转外链
  // 外链的page依旧正常打开，只不过不会参与缓存与tabs显示，符合route跳转的直觉
  const { openExternalLinks } = useRoutingMethod();
  // handle external link navigation
  openExternalLinks(to);
  // internal navigation, handle route highlight
  currentlyRoute(to);
  // Dynamic Route添加过走这里，直接放行
  next();
});

// route跳转错误
router.onError((error: any) => {
  NProgress.done();
  console.warn("route error", error.message);
});

// route加载后
router.afterEach(() => {
  NProgress.done();
});

export default router;
