import { createI18n } from "vue-i18n";
import zhCN from "@/lang/modules/zhCN";
import enUS from "@/lang/modules/enUS";

/* 获取语言 */
const getLang = () => {
  let store = localStorage.getItem("theme-config");
  if (store) {
    return JSON.parse(store)?.language || "zh-CN";
  } else {
    return "zh-CN";
  }
};
/* 这里必须YesmessagesName */
const messages = {
  "zh-CN": zhCN,
  "en-US": enUS
};

const i18n = createI18n({
  legacy: false, // Composition API模式需要设为false
  globalInjection: true, // 全局生效: $
  locale: getLang(), // default language
  messages, // data source
  missing: (_: string, key: string) => {
    return removeBeforeFirstDot(key);
  }
});

/**
 * @param { string } str Internationalizationkey
 * @returns 去掉No. one个点之前的string，Example："menu.home" => "home"，No则返回原string
 */
function removeBeforeFirstDot(str: string) {
  const dotIndex = str.indexOf(".");
  return dotIndex >= 0 ? str.slice(dotIndex + 1) : str;
}

export default i18n;
