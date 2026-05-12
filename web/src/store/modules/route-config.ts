import { defineStore } from "pinia";
import router from "@/router/index";
import { staticRoutes } from "@/router/route";
import { getRoutersAPI } from "@/api/modules/system/index";
import { moduleReplacement, linearArray } from "@/router/route-output";
import { getUrlWithParams } from "@/utils/index";

/**
 * route列表
 * @method setTabsTitle 设置tabs标签页Name
 * @methods setRoutePaths 设置routeName集合
 * @methods setTabs 添加tabs标签页
 * @methods setCurrentRoute 设置系统内的current route
 * @methods removeTabsList Deletetabs页的指定route
 * @methods removeRouteName Delete缓存route名，用于Cancelpage缓存，单个Delete
 * @methods removeRoutePaths Delete缓存route名，用于Cancelpage缓存，批量Delete
 * @methods resetRoute Reset动态添加的route
 * @methods initSetRouter route初始化
 */
export const routeConfigStore = () => {
  const routeTree = ref<any>([]); // 有访问permission的route树
  const routeList = ref<any>([]); // 有访问permission的one维route数组
  const cacheRoutes = ref<string[]>([]); // 所有可缓存route的route路径
  const tabsList = ref<Menu.MenuOptions[]>([]); // 标签页数据
  const currentRoute = ref<Menu.MenuOptions | object>({}); // current route

  /**
   * 设置tabsName
   * @param {string} title routeName
   */
  function setTabsTitle(title: string) {
    for (let i = 0; i < tabsList.value.length; i++) {
      if (tabsList.value[i].path == getUrlWithParams()) {
        tabsList.value[i].meta.title = title;
        break;
      }
    }
  }

  /**
   * 设置可缓存route的路径 -> fullPath
   * 同route不同参兼容，会On多个标签页，fullPath可做标识
   * @param {string} path routefullPath
   */
  function setRoutePaths(path: string) {
    let state = cacheRoutes.value.some((item: string) => item === path);
    if (state) return;
    cacheRoutes.value.push(path);
  }

  /**
   * 添加tabs标签页
   * @param {object} route 当前tabsroute
   */
  function setTabs(route: Menu.MenuOptions) {
    // 顶层手动添加的Full Screen静态route不参与tabs
    if (staticRoutes.some(item => item.name == route.name)) return;
    // 不在可访问的routeMedium则不参与tabs
    if (!routeList.value.some((item: any) => item.name == route.name)) return;
    // current route在tagsMediumYesNo存在
    let index = tabsList.value.findIndex((item: Menu.MenuOptions) => item.path === route.path);
    // 不存在，直接缓存
    if (index == -1) return tabsList.value.push(route);
  }
  /**
   * 设置系统内的current route数据
   * @param {object} data current route
   */
  function setCurrentRoute(data: Menu.MenuOptions) {
    // Nameone样不代表参数相同，这不用做已存在匹配，直接存储current route
    currentRoute.value = data;
  }
  /**
   * Deletetabs页的指定route
   * @param {string} path routefullPath
   */
  function removeTabsList(path: string) {
    const index = tabsList.value.findIndex((item: Menu.MenuOptions) => item.path === path);
    if (tabsList.value[index].meta.affix) return;
    if (index === -1) return;
    tabsList.value.splice(index, 1);
  }
  /**
   * Delete缓存route，用于Cancelpage缓存，单个Delete
   * @param {string} path route
   */
  function removeRouteName(path: string) {
    const index = cacheRoutes.value.findIndex((item: string) => item === path);
    if (index === -1) return;
    cacheRoutes.value.splice(index, 1);
  }
  /**
   * Delete缓存route，用于Cancelpage缓存，批量Delete
   * @param {Array} list route
   */
  function removeRoutePaths(list: Array<string>) {
    cacheRoutes.value = cacheRoutes.value.filter((item: string) => !list.includes(item));
  }
  /**
   * Reset动态添加的route
   */
  async function resetRoute() {
    // 清除标签页数据
    tabsList.value = [];
    // 清除有访问permission的route树
    routeTree.value = [];
    // 清除所有可缓存route的route路径
    cacheRoutes.value = [];
    // 清除current route
    currentRoute.value = {};
    // 清除动态添加的route
    routeList.value.forEach((item: any) => {
      if (router.hasRoute(item.name)) router.removeRoute(item.name);
    });
    // 清除有访问permission的one维route数组
    routeList.value = [];
  }

  /**
   * route初始化
   * 1、获取过滤角色permission后排过序的的route树，后端处理
   * 2、获取route树转换的one维route
   * 3、将模块设置为真实模块
   * 4、动态添加route
   * 5、存储route树，用于生成菜单
   * 6、缓存one维route
   */
  async function initSetRouter() {
    // 1、获取过滤角色permission后的树，后端做排序处理
    let { data } = await getRoutersAPI();

    // validation数据有效性
    if (!data || !Array.isArray(data) || data.length === 0) {
      return;
    }

    // 2、获取route树转换的one维route
    let flatRoute = linearArray(data);
    // 3、将模块设置为真实模块
    let realTree = await moduleReplacement(flatRoute);
    // 4、动态添加route
    realTree.forEach((route: any) => {
      if (route.meta.isFull) {
        router.addRoute(route);
      } else {
        router.addRoute("layout", route);
      }
    });
    // 5、存储route树，用于生成菜单
    routeTree.value = data;
    // 6、缓存one维route
    routeList.value = flatRoute;
  }

  return {
    routeTree,
    routeList,
    cacheRoutes,
    tabsList,
    currentRoute,
    setTabsTitle,
    setRoutePaths,
    setTabs,
    setCurrentRoute,
    removeTabsList,
    removeRouteName,
    removeRoutePaths,
    resetRoute,
    initSetRouter
  };
};

export const useRouteConfigStore = defineStore("route-config", routeConfigStore);
