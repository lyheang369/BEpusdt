/**
 * 小驼峰转小写下划线 userNameInfo
 * @param { string } v 需要转换的string，Example: userNameInfo
 * @return min割后的string user_name_info
 */
export const toUnderline = (v: string) => {
  return v.replace(/[A-Z]/g, current => `_${current.toLowerCase()}`);
};

/**
 * 下划线命名转小驼峰 user_name_info
 * @param { string } v 需要转换的string，Example: user_name_info
 * @return 转换后的stringuserNameInfo
 */
export const getCamelCase = (v: string) => {
  return v.replace(/_[a-z]/g, current => current.split("_")[1].toUpperCase());
};

/**
 * 生成随机Hex颜色
 * @return 返回色值，Example: #1eb31
 */
export const getColorHexColor = () => `#${Math.floor(Math.random() * 0xfffff).toString(16)}`;

/**
 * 判断变量数据类型
 * @param { any } val 需要判断数据类型的变量
 * @return 数据类型
 */
export const getObjType = (val: any) => {
  const toString = Object.prototype.toString;
  const map: any = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regExp",
    "[object Undefined]": "undefined",
    "[object Null]": "null",
    "[object Object]": "object",
    "[object Symbol]": "symbol"
  };
  // 如果Yesnode
  if (val instanceof Element) {
    return "element";
  }
  // 通过toString.call 判断Yes哪个类型
  // 判断的值为类型[object Boolean]， 通过object取值返回
  return map[toString.call(val)];
};

/**
 * 基本数据类型数组去重
 * @param { array } v 需要去重的数组
 * @return 去重后的数组
 */
export const arrSet = (v: any) => [...new Set(v)];

/**
 * 数组object去重
 * @param { array } v 需要去重的数组
 * @return 去重后的数组
 */
export const arrObjSet = (v: any) => {
  return [...new Set(v.map((el: any) => JSON.stringify(el)))].map((el: any) => JSON.parse(el));
};

/**
 * 数组object根据指定key去重
 * @param { array } v 需要去重的数组
 * @param { string } k 根据指定key去重
 * @return 去重后的数组
 */
export const somethingSet = (v: any, k: any) => {
  let res = new Set();
  return v.filter((item: any) => !res.has(item[k]) && res.add(item[k]));
};

/**
 * 排序-根据条件对数组object排序
 * v:数组object，k:key，type:0升序|1降序
 * @param { array } v 需要排序的数组
 * @param { string } k 根据指定key排序
 * @param { number } type 0升序|1降序
 * @return 排序结果
 */
export const toSort = (v: any, k: string, type: number) => {
  v.sort(function (a: any, b: any) {
    if (type == 0) {
      return a[k] - b[k];
    } else {
      return b[k] - a[k];
    }
  });
  return v;
};

/**
 * 比对新object和旧object的差异值，返回新object的差异值
 * @param { object } newObj 新object
 * @param { object } oldObj 旧object
 * @return { object } obj 新object的差异值
 */
export const Difference = (newObj: any, oldObj: any) => {
  let diff: any = {};
  for (let k in newObj) {
    if (newObj[k] != oldObj[k]) {
      diff[k] = newObj[k];
    }
  }
  return diff;
};

/***
 * Delete数组Medium多个指定element
 * 根据指定的key比对YesNo匹配，匹配则Delete，最后返回Delete后的数组
 * arrMoreDeletion(arr, [2,3,4], 'id')
 * @param {array} arr 原数组
 * @param {array} keys 需要Delete的key数组
 * @param {string | number} key 根据指定keyDelete
 * @return {array} Delete后的数组
 */
export const arrMoreDeletion = (arr: any, keys: any, key: string | number) => {
  const keysSet = new Set(keys);
  return arr.filter((item: any) => !keysSet.has(item[key]));
};

/**
 * None条件A/B数组交叉合并
 * @param {array} listA 数组A
 * @param {array} listB 数组B
 * @return {array} 数组A、B的交叉数组
 */
export const crossList = (listA = [], listB = []) => {
  const maxLength = Math.max(listA.length, listB.length);
  const result: any = [];

  for (let i = 0; i < maxLength; i++) {
    if (i < listA.length) result.push(listA[i]);
    if (i < listB.length) result.push(listB[i]);
  }

  return result;
};

/***
 * 生成指定长度的随机string
 * @param {number} num 需要生成多少位随机字符
 * @return {string} 生成的随机字符
 */
export const randomString = (num: number) => {
  let str = "",
    arr = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z"
    ];
  let index = null;
  for (let i = 0; i < num; i++) {
    index = Math.round(Math.random() * (arr.length - 1));
    str += arr[index];
  }
  return str;
};

/***
 * 获取Value在数组Medium的近似值
 * @param {number[]} arr 数组,Example: [23, 30, 35, 47, 16, 21]
 * @param {number} num 当前值，如37
 * @return {string} 当前值在数组Medium最接近的值
 */
export const closest = (arr: number[], num: number) => {
  let ret = arr[0];
  let distance = Math.abs(ret - num);
  for (let i = 1; i < arr.length; i++) {
    let newDistance = Math.abs(arr[i] - num);
    if (newDistance < distance) {
      distance = newDistance;
      ret = arr[i];
    }
  }
  return ret;
};

/***
 * 根据标准值计算当前值的increase和decrease
 * @param {number} current 当前值
 * @param {number} base 标准值
 * @description 返回{ percent: 10, type: 1, text: 'increase10.00%' }format
 * @description percent为increase或decrease，type: 1为increase，2为decrease，0为Nonechange
 * @return {object} increase/decreaseinformation
 */
export const getPercent = (current: number, base: number) => {
  // 处理特殊情况
  if (base === 0) {
    return { error: "Base value cannot be zero" };
  }

  if (!current && current !== 0) {
    return { error: "Current value is invalid" };
  }

  // 计算change百min比
  const change = ((current - base) / base) * 100;

  // 根据change值return result
  if (change > 0) {
    return {
      percent: change,
      type: 1, // increase
      text: `increase${change.toFixed(2)}%`
    };
  } else if (change < 0) {
    return {
      percent: Math.abs(change),
      type: 2, // decrease
      text: `decrease${Math.abs(change).toFixed(2)}%`
    };
  } else {
    return {
      percent: 0,
      type: 0, // Nonechange
      text: "Nonechange"
    };
  }
};

/**
 * 根据increase和decrease计算实际值
 * @param {Number} num 要计算的值
 * @param {Object} extent 包含 type 和 percent 的object
 * @returns {Number} 计算后的值，保留两位小数
 */
export const getValue = (num: number, extent: { type: number; percent: number }) => {
  if (!extent || (extent.type !== 1 && extent.type !== 2)) return num;

  const percent = extent.percent || 0;
  let result;

  if (extent.type === 1) {
    // increase计算
    result = num * (1 + percent / 100);
  } else {
    // decrease计算（修复了原代码Medium的item.value引用错误）
    result = num * (1 - percent / 100);
  }

  // 使用更精确的four舍五入方法
  return Math.round(result * 100) / 100;
};

/**
 * check whether it is an empty object
 * @param {any} obj object
 * @returns {boolean} YesNois an empty object
 */
export const isEmptyObject = (obj: any) => {
  // validate whether it is an object and not null
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * check whether it is a secure environment, HTTPS or localhost
 * @returns {boolean} YesNo为安全环境https或localhost
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
 * get browser default language
 * @returns {string} language type
 */
export const webDefaultLanguage = () => navigator.language;

/**
 * deep clone
 * @param { any } data data to deep clone
 * @returns deep-cloned data
 */
export const deepClone = (data: any) => {
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
};

/**
 * 获取URL附带的参数
 * @param { string } url 浏览器链接
 * @returns 解析url?之后的参数转化为object的数据
 */
export const getQueryParams = (url = window.location.href) => {
  const searchParams = new URL(url).searchParams;
  const params: any = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
};

/**
 * 截断string，如果string超过指定长度，则截断并添加省略号
 * @param { string } str string
 * @param { number } maxLength 截断长度
 * @returns 截断后的string
 */
export const truncateString = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
};

/**
 * 去掉string前后空格
 * @param {string} val string
 * @returns {string} return processed string
 */
export const verifyAndSpace = (val: string): string => {
  // match whitespace
  let v = val.replace(/(^\s*)|(\s*$)/g, "");
  // return result
  return v;
};

/**
 * 去掉string的所有Chinese和空格
 * @param {string} val current value string
 * @returns {string} 纯非Chinese不包含空格的string
 */
export const verifyCnAndSpace = (val: string): string => {
  // 匹配Chinese与空格
  let v = val.replace(/[\u4e00-\u9fa5\s]+/g, "");
  // match whitespace
  v = v.replace(/(^\s*)|(\s*$)/g, "");
  // return result
  return v;
};

/**
 * 去掉前后空格和stringMedium的英文
 * @param {string} val current value string
 * @returns {string} 纯非英文不包含前后空格的string
 */
export const verifyEnAndSpace = (val: string): string => {
  // 匹配英文与空格
  let v = val.replace(/[a-zA-Z]+/g, "");
  // match whitespace
  v = v.replace(/(^\s*)|(\s*$)/g, "");
  // return result
  return v;
};

/**
 * number转Chinese大写
 * @param {any} val current value string
 * @param {string} unit 默认：仟佰拾hundred million仟佰拾ten thousand仟佰拾yuan角min
 * @returns {string} return processed string
 */
export const verifyNumberCnUppercase = (val: any, unit = "仟佰拾hundred million仟佰拾ten thousand仟佰拾yuan角min", v = ""): string => {
  // 处理小数部min，确保能valid转换角min
  val += "00";
  // 返回某个指定的string值在stringMedium首次出现的位置，没有出现，则该方法返回 -1
  let lookup = val.indexOf(".");
  // substring：不包含结束下标内容，substr：包含结束下标内容
  if (lookup >= 0) val = val.substring(0, lookup) + val.substr(lookup + 1, 2);
  // 根据内容 val 的长度，截取返回对应大写
  unit = unit.substr(unit.length - val.length);
  // 循环截取拼接大写
  for (let i = 0; i < val.length; i++) {
    v += "zero壹贰叁肆伍陆柒捌玖".substr(val.substr(i, 1), 1) + unit.substr(i, 1);
  }
  // 正则处理
  v = v
    .replace(/zero角zeromin$/, "整")
    .replace(/zero[仟佰拾]/g, "zero")
    .replace(/zero{2,}/g, "zero")
    .replace(/zero([hundred million|ten thousand])/g, "$1")
    .replace(/zero+yuan/, "yuan")
    .replace(/hundred millionzero{0,3}ten thousand/, "hundred million")
    .replace(/^yuan/, "zeroyuan");
  // return result
  return v;
};
