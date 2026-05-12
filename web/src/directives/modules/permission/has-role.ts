import { Directive } from "vue";
import { useUserInfoStore } from "@/store/modules/user-info";

/**
 * 检测directive binding valueYesNo为空
 * @param value directive binding value
 * @returns {Array<string>} directive binding value数组
 */
const bindingValueEmpty = (value: unknown): Array<string> => {
  // 处理未定义或空值情况
  if (!value) throw new Error("v-hasRole directive requires a permission identifier");

  // 标准化为数组format
  // 如果 value Yesone个数组，则直接返回该数组
  // 如果 value 不Yes数组，则将其转换为包含单个stringelement的数组
  return Array.isArray(value) ? (value as string[]) : [String(value)];
};

/**
 * check custom directive permission
 * @param {HTMLElement} el domelement
 * @param {unknown} bindingValue directive binding value
 */
const checkRole = (el: HTMLElement, bindingValue: unknown) => {
  try {
    // 检测Custom Directive值并转化为数组format
    const requiredRole = bindingValueEmpty(bindingValue);

    // super admin identifier
    const super_admin = "admin";

    // 获取用户permission标识-Array[string]
    let { roles } = useUserInfoStore().account;

    // 如果Yes超级Admin则放行
    if (roles.includes(super_admin)) return;

    // YesNohas permission
    const hasRole = requiredRole.some((perm: string) => roles.includes(perm));

    // Nonepermission、父node存在时，Deletecurrent node
    if (!hasRole && el.parentNode) el.parentNode.removeChild(el);
  } catch (error) {
    console.error(`permission directive error: ${error}`);
    // Deletecurrent node
    if (el.parentNode) el.parentNode.removeChild(el);
  }
};

const hasPerm: Directive = {
  mounted: (el, binding) => checkRole(el, binding.value),
  updated: (el, binding) => checkRole(el, binding.value)
};

export default hasPerm;
