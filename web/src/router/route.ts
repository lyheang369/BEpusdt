import { HOME_PATH } from "@/config/index";
import Layout from "@/layout/index.vue";
/**
 * routepath路径与文件夹Name相同，找文件可以浏览器Address快速查找，方便定位文件
 *
 * routemetaobject参数，我们通常将属性放到metaobjectMedium
 * meta: {
 *   title:     菜单栏以及 tabsView 栏、菜单搜索Name（Internationalization）
 *   hide:      YesNo隐藏此route，不会显示在菜单树，可以访问
 *   disable:   YesNoDisabled，不会显示在菜单树，且不可访问
 *   keepAlive: YesNo缓存组件Status
 *   affix:     YesNo固定在 tabsView 栏上
 *   link:      YesNoYes超链接菜单，On外链条件：1、 link：链接Address不为空  2、iframe: false
 *   iframe:    YesNo内嵌窗口，On条件：1、iframe：true  2、link：链接Address不为空
 *   roles:     current routepermission表示，取Role Management。route控制显示、隐藏。 超级Admin：admin；普通角色：common
 *   icon:      菜单、tabsView 图标等
 *   svgIcon:   svg图标
 *   sort:      菜单顺序
 * }
 */

/**
 * 静态route （默认route）
 * 此route不要动，用于做静态route定向，如果要添加route，请在 `layout-children` Medium添加
 * @description 前端控制route 直接改 mock/_data/system_menu Medium的route，后端控制则不需要
 * @returns 返回route菜单数据
 */
export const staticRoutes = [
  {
    path: "/",
    redirect: HOME_PATH
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/login.vue"),
    meta: {
      title: "login"
    }
  },
  {
    path: "/layout",
    name: "layout",
    redirect: HOME_PATH,
    component: Layout, // 容器布局-顶层route
    // two级route-主要渲染page
    children: []
  }
  /**
   * Notice：写在这里的为Full Screen界面，不Suggested写在这里非Full Screen界面，请写在 layout.children route数组Medium
   *
   */
];

/**
 * 定义401、404、500界面
 * 401Nonepermission
 * 404page不存在
 * 500network-disconnected
 * @link Reference: https://router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
export const notFoundAndNoPower = [
  {
    path: "/401", // Nonepermission，跳转401
    name: "no-access",
    component: () => import("@/views/error/401.vue"),
    meta: {
      title: "no-access",
      hide: true
    }
  },
  {
    path: "/500", // NoneNetwork-浏览器离线
    name: "no-network",
    component: () => import("@/views/error/500.vue"),
    meta: {
      title: "no-network",
      hide: true
    }
  },
  {
    path: "/:path(.*)*", // 匹配任意route，兜底，Page Not Found的时候跳转该page
    name: "not-found",
    component: () => import("@/views/error/404.vue"),
    meta: {
      title: "not-found",
      hide: true
    }
  }
];
