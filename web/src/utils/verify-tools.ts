/**
 * 处理输入内容，只允许输入number和2位小数，其它的替换为空
 * 用于输入框限制输入number和2位小数的场景
 * @param {string} val current value string
 * @returns {string} return processed string
 */
export const verifyNumberIntegerAndFloat = (val: string): string => {
  // match whitespace
  let v = val.replace(/(^\s*)|(\s*$)/g, "");
  // 只能Yesnumber和小数点，不能Yes其他输入
  v = v.replace(/[^\d.]/g, "");
  // 以0开始只能输入one个
  v = v.replace(/^0{2}$/g, "0");
  // 保证No. one位只能Yesnumber，不能Yes点
  v = v.replace(/^\./g, "");
  // 小数只能出现1位
  v = v.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  // 小数点后面保留2位
  v = v.replace(/^(\-)*(\d+)\.(\d\d).*$/, "$1$2.$3");
  // return result
  return v;
};

/**
 * 正整数validation
 * 用于输入框限制正整数的场景
 * @param {string} val current value string
 * @returns {string} 返回正整数string
 */
export const verifiyNumberInteger = (val: string): string => {
  // match whitespace
  let v = val.replace(/(^\s*)|(\s*$)/g, "");
  // 去掉 '.' , 防止贴贴的时候出现问题 如 0.1.12.12
  v = v.replace(/[\.]*/g, "");
  // 去掉以 0 开始后面的数, 防止贴贴的时候出现问题 如 00121323
  v = v.replace(/(^0[\d]*)$/g, "0");
  // 首位Yes0,只能出现one次
  v = v.replace(/^0\d$/g, "0");
  // 只匹配number
  v = v.replace(/[^\d]/g, "");
  // return result
  return v;
};

/**
 * 手机号码formatvalidation
 * @param {string} val current value string
 * @returns {boolean} returns true: mobile number is valid
 */
export const verifyPhone = (val: string): boolean => {
  // false: 手机号码不valid
  if (!/^((12[0-9])|(13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0|1,5-9]))\d{8}$/.test(val)) return false;
  // true: mobile number is valid
  else return true;
};

/**
 * 国内电话号码formatvalidation
 * @param {string} val current value string
 * @returns {boolean} returns true: domestic phone number is valid
 */
export const verifyTelPhone = (val: string): boolean => {
  // false: 国内电话号码不valid
  if (!/\d{3}-\d{8}|\d{4}-\d{7}/.test(val)) return false;
  // true: domestic phone number is valid
  else return true;
};

/**
 * Login Accountvalidation (字母开头，允许5-16字节，允许字母number下划线)
 * @param {string} val current value string
 * @returns {boolean} returns true: Login Accountvalid
 */
export const verifyAccount = (val: string): boolean => {
  // false: Login Account不valid
  if (!/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(val)) return false;
  // true: Login Accountvalid
  else return true;
};

/**
 * Password (以字母开头，长度在6~16and，只能包含字母、number和下划线)
 * @param {string} val current value string
 * @returns {boolean} returns true: Passwordvalid
 */
export const verifyPassword = (val: string): boolean => {
  // false: Password不valid
  if (!/^[a-zA-Z]\w{5,15}$/.test(val)) return false;
  // true: Passwordvalid
  else return true;
};

/**
 * StrongPassword (字母+number+special characters，长度在6-16and)
 * @param {string} val current value string
 * @returns {boolean} returns true: strong password is valid
 */
export const verifyPasswordPowerful = (val: string): boolean => {
  // false: StrongPassword不valid
  if (
    !/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(
      val
    )
  )
    return false;
  // true: strong password is valid
  else return true;
};

/**
 * PasswordStrong度
 * @param {string} val current value string
 * @description weak: only numbers, only letters, or only special characters
 * @description medium: letters+numbers and letters+special characters and numbers+special characters
 * @description strong: letters+number+special characters
 * @returns {string} PasswordStrong度string：Weak、Medium、Strong
 */
export const verifyPasswordStrength = (val: string): string => {
  let v = "";
  // weak: only numbers, only letters, or only special characters
  if (/^(?:\d+|[a-zA-Z]+|[!@#$%^&\.*]+){6,16}$/.test(val)) v = "Weak";
  // medium: letters+numbers and letters+special characters and numbers+special characters
  if (/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val)) v = "Medium";
  // strong: letters+number+special characters
  if (
    /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(
      val
    )
  )
    v = "Strong";
  // return result
  return v;
};

/**
 * 校验IPAddressYesNovalid
 * @param {string} val current value string
 * @returns {boolean} returns true: IPAddressvalid
 */
export const verifyIPAddress = (val: string): boolean => {
  // false: IPAddress不valid
  if (
    !/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(
      val
    )
  )
    return false;
  // true: IPAddressvalid
  else return true;
};

/**
 * 校验邮箱YesNovalid
 * @param {string} val current value string
 * @returns {boolean} returns true: email is valid
 */
export const verifyEmail = (val: string): boolean => {
  // false: 邮箱不valid
  if (
    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      val
    )
  )
    return false;
  // true: email is valid
  else return true;
};

/**
 * 身份证validation
 * @param {string} val current value string
 * @returns {boolean} returns true: ID card is valid
 */
export const verifyIdCard = (val: string): boolean => {
  // false: 身份证不valid
  if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(val)) return false;
  // true: ID card is valid
  else return true;
};

/**
 * Chinese姓名validation
 * @param {string} val current value string
 * @returns {boolean} returns true: name is valid
 */
export const verifyFullName = (val: string): boolean => {
  // false: 姓名不valid
  if (!/^[\u4e00-\u9fa5]{1,6}(·[\u4e00-\u9fa5]{1,6}){0,2}$/.test(val)) return false;
  // true: name is valid
  else return true;
};

/**
 * 邮政编码validation
 * @param {string} val current value string
 * @returns {boolean} returns true: postal code is valid
 */
export const verifyPostalCode = (val: string): boolean => {
  // false: 邮政编码不valid
  if (!/^[1-9][0-9]{5}$/.test(val)) return false;
  // true: postal code is valid
  else return true;
};

/**
 * urlvalid性validation
 * @param {string} val current value string
 * @returns {boolean} returns true: url valid
 */
export const verifyUrl = (val: string): boolean => {
  // false: url不valid
  if (
    !/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
      val
    )
  )
    return false;
  // true: urlvalid
  else return true;
};

/**
 * 车牌号validation
 * @param {string} val current value string
 * @returns {boolean} returns true：车牌号valid
 */
export const verifyCarNum = (val: string): boolean => {
  // false: 车牌号不valid
  if (
    !/^(([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳使领]))$/.test(
      val
    )
  )
    return false;
  // true：车牌号valid
  else return true;
};
