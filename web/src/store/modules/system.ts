import { defineStore } from "pinia";
import persistedstateConfig from "@/store/config/index";
import { getDictAPI } from "@/api/modules/system/index";
/**
 * User Information
 * @methods setAccount 设置Accountinformation
 * @methods setToken 设置token
 * @methods logOut Log Out
 */
const systemStore = () => {
  // 字典数据
  const dict = ref<any>([]);

  // set dictionary数据
  async function setDictData() {
    let dictData = await getDictAPI();
    dict.value = dictData.data || [];
  }

  return { dict, setDictData };
};

export const useSystemStore = defineStore("system", systemStore, {
  persist: persistedstateConfig("system", ["dict"])
});
