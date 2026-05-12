/**
 * deep clone
 * @param { string } data data to deep clone
 * @returns deep-cloned data
 */
export function deepClone(data: any) {
  let stack = [];
  let cloned;
  if (Array.isArray(data)) {
    cloned = [];
  } else if (typeof data === "object" && data !== null) {
    cloned = {};
  } else {
    return data;
  }
  stack.push({
    original: data,
    copy: cloned
  });
  while (stack.length > 0) {
    let current: any = stack.pop();
    let original = current.original;
    let copy = current.copy;

    for (let key in original) {
      if (original.hasOwnProperty(key)) {
        let value = original[key];

        if (typeof value === "object" && value !== null) {
          copy[key] = Array.isArray(value) ? [] : {};

          stack.push({
            original: value,
            copy: copy[key]
          });
        } else {
          copy[key] = value;
        }
      }
    }
  }
  return cloned;
}

/**
 * get browser default language
 * @returns language type
 */
export const webDefaultLanguage = () => navigator.language;

/**
 * Timetimestamp转 年月day时minsec
 * use current time if timestamp is not provided
 * use year-month-day hour:min:sec if type is not provided
 * @param { number } timestamp Timetimestamp
 * @return return date-time string
 */
export const getTimestamp = (timestamp: string | number | null, type: string) => {
  let date = null;
  if (timestamp) {
    date = new Date(timestamp);
  } else {
    date = new Date();
  }
  let Year = String(date.getFullYear());
  let Moth = String(date.getMonth() + 1).padStart(2, "0");
  let Day = String(date.getDate()).padStart(2, "0");
  let Hour = String(date.getHours()).padStart(2, "0");
  let Minute = String(date.getMinutes()).padStart(2, "0");
  let Seconds = String(date.getSeconds()).padStart(2, "0");
  if (type === "yyyy") {
    return `${Year}`;
  }
  if (type === "yyyy-MM") {
    return `${Year}-${Moth}`;
  }
  if (type === "yyyy-MM-dd") {
    return `${Year}-${Moth}-${Day}`;
  }
  return `${Year}-${Moth}-${Day} ${Hour}:${Minute}:${Seconds}`;
};

/**
 * move back from current date by the specified number of days
 * @param { number } days number of days to move back
 * @return {Array[]} YesNois an empty object [date moved back by the specified days from current date]
 */
export const getDatesForwardDate = (days = 0) => {
  const today = new Date();
  const firstDay: any = new Date(today);
  firstDay.setDate(firstDay.getDate() - days); // move back specified days to get the first day of that period

  const lastDay: any = new Date(today);
  lastDay.setDate(lastDay.getDate() - 1); // yesterday is the last day of the specified previous period

  const firstDayFormatted = getTimestamp(firstDay, "YYYY-MM-DD");
  const lastDayFormatted = getTimestamp(lastDay, "YYYY-MM-DD");
  return [firstDayFormatted, lastDayFormatted];
};

/**
 * 给formData循环添加参数，过滤null、undefined、空string、NaN
 * 示例：let data = appendFormData(your-object);
 * @param { object } obj 参数object
 * @return 返回formDataobject
 */
export const appendFormData = (obj: any) => {
  let formData = new FormData();
  function deepAppendFormData(formData: any, data: any, parentKey = "") {
    if (Array.isArray(data) || (typeof data === "object" && data !== null)) {
      // 如果数据Yes数组或object，序列化为 JSON string
      formData.append(parentKey, JSON.stringify(data));
    } else if (data !== null && data !== undefined && !Number.isNaN(data) && data !== "") {
      // 如果数据Yes基本类型，直接添加
      formData.append(parentKey, data);
    }
  }
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      deepAppendFormData(formData, obj[key], key);
    }
  }
  deepAppendFormData(formData, obj);
  return formData;
};

/**
 * check whether it is an empty object
 * @param {object} obj object
 * @returns {boolean} YesNois an empty object
 */
export const isEmptyObject = (obj: object) => {
  // validate whether it is an object and not null
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * check whether it is a secure environment, HTTPS or localhost
 * @returns YesNo为安全环境https或localhost
 */
export const isSecureEnvironment = () => {
  const { protocol, hostname } = window.location;

  // check whether protocol is HTTPS
  const isHttps = protocol === "https:";

  // check whether hostname is localhost or local IP (IPv4 and IPv6 supported)
  const isLocalhost =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "[::1]" || hostname === "::1";

  return isHttps || isLocalhost;
};

/**
 * 获取不同route模式所对应的 url + params
 * @returns {String} 返回路径
 */
export const getUrlWithParams = (): string => {
  type UrlParams = {
    hash: string;
    history: string;
  };

  if (typeof window === "undefined") return "";
  const url: UrlParams = {
    hash: window.location.hash.substring(1),
    history: window.location.pathname + window.location.search
  };
  const mode = (import.meta.env.VITE_ROUTER_MODE as keyof UrlParams) || "history";
  return url[mode] || "";
};

/**
 * 下划线转驼峰
 * @param v 下划线string
 * @returns 驼峰string
 */
export const getPascalCase = (v: string) => {
  // 处理空string情况
  if (!v) return v;

  // 1. 替换所有下划线序列及其后的首个字符
  // - 正则 /_+(.)/g 匹配one个或多个下划线后紧跟的任意字符
  // - 替换函数将匹配的字符转为大写（字母则大写，非字母则原样保留）
  let result = v.replace(/_+(.)/g, (_, char) => char.toUpperCase());

  // 2. Delete开头和结尾剩余的下划线
  result = result.replace(/^_+|_+$/g, "");

  // 3. 将首字母转为大写后返回
  return result.charAt(0).toUpperCase() + result.slice(1);
};
