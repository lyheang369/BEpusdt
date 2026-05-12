import pinia from "@/store/index";
import { storeToRefs } from "pinia";
import { useRouteConfigStore } from "@/store/modules/route-config";
import { findCategoryById, findPathOfParentNode } from "@/utils/tree-tools";

/**
 * route处理hooks，内置多种route处理场景
 * @returns route方法
 */
export const useRoutingMethod = () => {
  /**
   * 从one维routeMedium查找route
   * @param {string} path route path
   * @returns found route, undefined means not found
   */
  const findLinearArray = (path: string) => {
    const routerStore = useRouteConfigStore(pinia);
    const { routeTree } = storeToRefs(routerStore);
    return findCategoryById(routeTree.value, "path", path);
  };

  /**
   * 根据current route找到所有直属父级route
   * @param {string} path route path
   * @returns 查找到的所有父级route，未找到则null
   */
  const getAllParentRoute = (path: string) => {
    const routerStore = useRouteConfigStore(pinia);
    const { routeTree } = storeToRefs(routerStore);
    return findPathOfParentNode(routeTree.value, "path", path);
  };

  /**
   * 从one维routeMedium判断routeYesNo存在
   * @param {string} key route name
   * @returns routeYesNo存在，true存在 false不存在
   */
  const hasRoute = (key: string) => {
    const routerStore = useRouteConfigStore(pinia);
    const { routeList } = storeToRefs(routerStore);
    return routeList.value.some((item: Menu.MenuOptions) => item.name == key);
  };

  /**
   * 从tabsrouteMedium查找route
   * @param {string} key route name
   * @returns found route, undefined means not found
   */
  const findTagsList = (key: string) => {
    const routerStore = useRouteConfigStore(pinia);
    const { tabsList } = storeToRefs(routerStore);
    return tabsList.value.find((item: Menu.MenuOptions) => item.name == key);
  };

  /**
   * handle external link navigation，打开one个新窗口并根据url跳转
   * @param {any} route route
   */
  const openExternalLinks = (route: any) => {
    // handle external link navigation
    if (route.meta.link && !route.meta.iframe) {
      window.open(route.meta.link as string, "_blank");
    }
  };

  /**
   * 检测YesNoYes动态匹配route，如果Yes动态匹配route，则path必然带有"/:"字样，Example：/user/:id
   * @param {string} path routepath
   * @returns YesNoYes动态匹配route
   */
  const isDynamicRoute = (route: any) => {
    // to.matched 包含了current route匹配到的所有层级（包括父级 layout 等）
    // 我们主要关心叶子node或包含参数的node
    return route.matched.some((record: any) => {
      // record.path Yes定义时的路径，如 "/user/:id"
      return record.path.includes("/:");
    });
  };

  return {
    findLinearArray,
    getAllParentRoute,
    findTagsList,
    openExternalLinks,
    isDynamicRoute,
    hasRoute
  };
};
