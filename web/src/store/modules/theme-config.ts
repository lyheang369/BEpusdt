import { defineStore } from "pinia";
import persistedstateConfig from "@/store/config/index";
/**
 * 全局配置
 * @methods setCollapsed 设置Collapse Menu
 * @methods setRefreshPage Refreshpage
 * @methods setLanguage 设置语言
 */
const themeConfig = () => {
  // YesNo折叠菜单
  const collapsed = ref<boolean>(false);
  // Refreshpage
  const refreshPage = ref<boolean>(true);
  // 系统语言
  const language = ref<string>("zh-CN");
  // dark mode
  const darkMode = ref<boolean>(false);
  // Menu Accordion
  const isAccordion = ref<boolean>(true);
  // Breadcrumb渲染
  const isBreadcrumb = ref<boolean>(true);
  // Tab Bar渲染
  const isTabs = ref<boolean>(true);
  // Footer渲染
  const isFooter = ref<boolean>(true);
  // 水印
  const watermark = ref<string>("");
  // 水印风格
  const watermarkStyle = ref<{ fontSize: number; color: string }>({
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.15)"
  });
  // Watermark Angle
  const watermarkRotate = ref<number>(330);
  // Watermark Gap
  const watermarkGap = ref<[number, number]>([100, 100]);
  // 防止调试
  const debugPrevention = ref<boolean>(false);
  // 布局模式：layoutDefaults、layoutHead、layoutMixing
  const layoutType = ref<string>("layoutDefaults");
  // Color Weakness Mode
  const colorWeakMode = ref<boolean>(false);
  // Gray Mode
  const grayMode = ref<boolean>(false);
  // Dark Sidebar
  const asideDark = ref<boolean>(false);
  // Page Transition方式
  const transitionPage = ref<string>("fadeInOut");
  // 主题色
  const themeColor = ref<string>("#165DFF");
  // 调色盘
  const presetColors = ref<string[]>([
    "#165DFF",
    "#F53F3F",
    "#F77234",
    "#FF7D00",
    "#F7BA1E",
    "#FADC19",
    "#9FDB1D",
    "#00B42A",
    "#3491FA",
    "#c34d9c",
    "#722ED1",
    "#E6A23C",
    "#F56C6C",
    "#409EFF",
    "#42b883",
    "#b1d391"
  ]);

  // 折叠菜单
  function setCollapsed(data: boolean) {
    collapsed.value = data;
  }
  // Refreshpage
  function setRefreshPage(data: boolean) {
    refreshPage.value = data;
  }
  // 设置语言
  function setLanguage(data: string) {
    language.value = data;
  }

  return {
    collapsed,
    refreshPage,
    language,
    darkMode,
    isAccordion,
    isBreadcrumb,
    isTabs,
    isFooter,
    watermark,
    watermarkStyle,
    watermarkRotate,
    watermarkGap,
    debugPrevention,
    layoutType,
    colorWeakMode,
    grayMode,
    asideDark,
    transitionPage,
    themeColor,
    presetColors,
    setCollapsed,
    setRefreshPage,
    setLanguage
  };
};

export const useThemeConfig = defineStore("theme-config", themeConfig, {
  persist: persistedstateConfig("theme-config")
});
