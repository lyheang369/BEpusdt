import { storeToRefs } from "pinia";
import { useThemeConfig } from "@/store/modules/theme-config";
import { generate, getRgbStr } from "@arco-design/color";
/**
 * 主题处理hooks，内置多种主题处理场景
 * @returns 主题方法
 */
export const useThemeMethods = () => {
  /**
   * @description: initialize theme
   */
  const initTheme = () => {
    // dark mode和主题色
    setDarkMode();
    // Color Weakness Mode和Gray Mode
    const themeStore = useThemeConfig();
    const { grayMode } = storeToRefs(themeStore);
    if (grayMode.value) {
      setGray();
    } else {
      setColorWeak();
    }
  };

  /**
   * @description: 暗黑模式
   */
  const setDarkMode = () => {
    const themeStore = useThemeConfig();
    const { darkMode, asideDark } = storeToRefs(themeStore);
    if (darkMode.value) {
      // 设置为暗黑主题
      document.body.setAttribute("arco-theme", "dark");
      asideDark.value = false; // dark mode与Dark Sidebar互斥
    } else {
      // 恢复亮色主题
      document.body.removeAttribute("arco-theme");
    }
    // dark mode切换后需要更新主题色
    setThemeColor();
  };

  /**
   * @description: theme color setting
   */
  const setThemeColor = () => {
    const themeStore = useThemeConfig();
    const { themeColor, darkMode } = storeToRefs(themeStore);
    // 对于给定的颜色，使用算法生成包含10种颜色的渐变样本。这适用于光模式和暗模式。
    let list = generate(themeColor.value, { list: true, dark: darkMode.value });
    list.forEach((color: string, index: number) => {
      // https://arco.design/palette/list
      // arco的颜色等级为1-10，这里需要index+1
      document.body.style.setProperty(`--primary-${index + 1}`, getRgbStr(color));
    });
  };

  /**
   * @description: Color Weakness Mode
   */
  const setColorWeak = () => {
    // get HTML
    const htmlCase = document.querySelector("html") as HTMLHtmlElement | null;
    if (!htmlCase) return;
    const themeStore = useThemeConfig();
    const { colorWeakMode, grayMode } = storeToRefs(themeStore);
    if (colorWeakMode.value) {
      grayMode.value = false; // Color Weakness Modeand Gray Mode are mutually exclusive
      htmlCase.style.filter = "invert(80%)"; // 反转色80%
    } else {
      htmlCase.style.filter = "";
    }
  };

  /**
   * @description: Gray Mode
   */
  const setGray = () => {
    // get HTML
    const htmlCase = document.querySelector("html") as HTMLHtmlElement | null;
    if (!htmlCase) return;
    const themeStore = useThemeConfig();
    const { colorWeakMode, grayMode } = storeToRefs(themeStore);
    if (grayMode.value) {
      colorWeakMode.value = false; // Color Weakness Modeand Gray Mode are mutually exclusive
      htmlCase.style.filter = "grayscale(100%)"; // 灰度100%
    } else {
      htmlCase.style.filter = "";
    }
  };

  return {
    initTheme,
    setDarkMode,
    setThemeColor,
    setColorWeak,
    setGray
  };
};
