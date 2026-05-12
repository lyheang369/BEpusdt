/**
 * Timetimestamp转 年月day时minsec
 * use current time if timestamp is not provided
 * use year-month-day hour:min:sec if type is not provided
 * @param { number } timestamp Timetimestamp
 * @return { string } return date-time string
 */
export const getTimestamp = (timestamp: string | number | null, type: string): string => {
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
 * Timestring转Timetimestamp
 * @param { string } str Timestring，Example: 2025-06-28
 * @return 返回Timetimestamp
 */
export const getTimes = (str: string) => {
  return new Date(str.substring(0, 19).replace(/-/g, "/")).getTime();
};

/**
 * 获取当前月份的No. onedays、当days和最后onedays
 * @param {string} YearandMonty Example: '2025-09'；参数可传可不传，不传获取当月，传则获取指定月
 * @return {array} [当月No. onedays,当前days,最后onedays]
 **/
export const getFirstandLastDay = (YearandMonty?: string): Array<string> => {
  let date = YearandMonty ? new Date(YearandMonty) : new Date();
  let year = String(date.getFullYear());
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  // new DateNo. three个参数默认1，也就Yes当月No. onedays,如果传0则Yes当月最后onedays
  let lastDay = new Date(Number(year), Number(month), 0).getDate();
  let firstDate = `${year}-${month}-01`;
  let theDay = `${year}-${month}-${day}`;
  let lastDate = `${year}-${month}-${lastDay}`;
  return [firstDate, theDay, lastDate];
};

/**
 * move back from current date by the specified number of days
 * @param { number } days number of days to move back
 * @param { string } type 返回的Timeformat
 * @return {Array[]} YesNois an empty object [date moved back by the specified days from current date]
 */
export const getDatesForwardDate = (days = 0, type = "YYYY-MM-DD"): Array<string> => {
  const today = new Date();
  const firstDay: any = new Date(today);
  firstDay.setDate(firstDay.getDate() - days); // move back specified days to get the first day of that period

  const lastDay: any = new Date(today);
  lastDay.setDate(lastDay.getDate() - 1); // yesterday is the last day of the specified previous period

  const firstDayFormatted = getTimestamp(firstDay, type);
  const lastDayFormatted = getTimestamp(lastDay, type);
  return [firstDayFormatted, lastDayFormatted];
};

/**
 * 获取当前day期YesNo. 几week
 * @param dateTime 当前传入的day期值
 * @description 示例：getWeek(new Date()); 返回25，说明今年No. 25week
 * @returns 返回No. 几weeknumber值
 */
export const getWeek = (dateTime: Date): number => {
  let temptTime = new Date(dateTime.getTime());
  // week几
  let weekday = temptTime.getDay() || 7;
  // week1+5days=week六
  temptTime.setDate(temptTime.getDate() - weekday + 1 + 5);
  let firstDay = new Date(temptTime.getFullYear(), 0, 1);
  let dayOfWeek = firstDay.getDay();
  let spendDay = 1;
  if (dayOfWeek != 0) spendDay = 7 - dayOfWeek + 1;
  firstDay = new Date(temptTime.getFullYear(), 0, 1 + spendDay);
  let d = Math.ceil((temptTime.valueOf() - firstDay.valueOf()) / 86400000);
  let result = Math.ceil(d / 7);
  return result;
};

/**
 * Timeday期转换
 * @param date current time, new Date() format
 * @param format time string to convert
 * @description format string随意，如 `YYYY-mm、YYYY-mm-dd`
 * @description format quarter："YYYY-mm-dd HH:MM:SS QQQQ"
 * @description format week："YYYY-mm-dd HH:MM:SS WWW"
 * @description format weeks:"YYYY-mm-dd HH:MM:SS ZZZ"
 * @description format quarter + week + weeks:"YYYY-mm-dd HH:MM:SS WWW QQQQ ZZZ"
 * @returns 返回拼接后的Timestring
 */
export const formatDate = (date: Date, format: string): string => {
  let we = date.getDay(); // week
  let z = getWeek(date); // week
  let qut = Math.floor((date.getMonth() + 3) / 3).toString(); // quarter
  const opt: { [key: string]: string } = {
    "Y+": date.getFullYear().toString(), // 年
    "m+": (date.getMonth() + 1).toString(), // 月(月份从0开始，要+1)
    "d+": date.getDate().toString(), // day
    "H+": date.getHours().toString(), // 时
    "M+": date.getMinutes().toString(), // min
    "S+": date.getSeconds().toString(), // sec
    "q+": qut // quarter
  };
  // Chinesenumber (week)
  const week: { [key: string]: string } = {
    "0": "day",
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "五",
    "6": "六"
  };
  // Chinesenumber（quarter）
  const quarter: { [key: string]: string } = {
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four"
  };
  if (/(W+)/.test(format))
    format = format.replace(
      RegExp.$1,
      RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? "week" + week[we] : "week" + week[we]) : week[we]
    );
  if (/(Q+)/.test(format))
    format = format.replace(RegExp.$1, RegExp.$1.length == 4 ? "No. " + quarter[qut] + "quarter" : quarter[qut]);
  if (/(Z+)/.test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 3 ? "No. " + z + "week" : z + "");
  for (let k in opt) {
    let r = new RegExp("(" + k + ")").exec(format);
    // 若输入的长度不为1，则前面补zero
    if (r) format = format.replace(r[1], RegExp.$1.length == 1 ? opt[k] : opt[k].padStart(RegExp.$1.length, "0"));
  }
  return format;
};

/**
 * 将Time转换为 `几 seconds ago`、`几min minutes ago`、`几 hours ago`、`几 days ago`
 * @param param current time, new Date() format或者stringTimeformat
 * @param format time string to convert
 * @description param 10sec：  10 * 1000
 * @description param 1min：   60 * 1000
 * @description param 1h： 60 * 60 * 1000
 * @description param 24h：60 * 60 * 24 * 1000
 * @description param 3days：   60 * 60* 24 * 1000 * 3
 * @returns 返回转换后的string
 */
export const formatPast = (param: string | Date, format: string = "YYYY-mm-dd"): string => {
  // 传入format处理、存储转换值
  let t: any, s: number;
  // 获取js Timetimestamp
  let time: number = new Date().getTime();
  // YesNoYesobject
  typeof param === "string" || "object" ? (t = new Date(param).getTime()) : (t = param);
  // 当前Timetimestamp - 传入Timetimestamp
  time = Number.parseInt(`${time - t}`);
  if (time < 10000) {
    // 10sec内
    return "just now";
  } else if (time < 60000 && time >= 10000) {
    // 超过10sec少于1min钟内
    s = Math.floor(time / 1000);
    return `${s} seconds ago`;
  } else if (time < 3600000 && time >= 60000) {
    // 超过1min钟少于1h
    s = Math.floor(time / 60000);
    return `${s}min minutes ago`;
  } else if (time < 86400000 && time >= 3600000) {
    // 超过1h少于24h
    s = Math.floor(time / 3600000);
    return `${s} hours ago`;
  } else if (time < 259200000 && time >= 86400000) {
    // 超过1days少于3days内
    s = Math.floor(time / 86400000);
    return `${s} days ago`;
  } else {
    // 超过3days
    let date = typeof param === "string" || "object" ? new Date(param) : param;
    return formatDate(date, format);
  }
};

/**
 * Time问候语
 * @param param current time, new Date() format
 * @description param 调用 `formatAxis(new Date())` 输出 `Good morning`
 * @returns 返回根据Time处理后的问候语
 */
export function formatAxis(param: Date): string {
  let hour: number = new Date(param).getHours();
  if (hour < 6) return "Good early morning";
  else if (hour < 9) return "Good morning";
  else if (hour < 12) return "Good morning";
  else if (hour < 14) return "Good noon";
  else if (hour < 17) return "Good afternoon";
  else if (hour < 19) return "Good evening";
  else if (hour < 22) return "Good evening";
  else return "Good night";
}

/**
 * sec转时minsec
 * @param {number} seconds secTimetimestamp
 * @returns {string} sec转时minsec后的string，Example: 00h11min01sec
 */
export const formatTime = (seconds: number) => {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - hours * 3600) / 60);
  let remainingSeconds = seconds - hours * 3600 - minutes * 60;
  return `${String(hours).padStart(2, "0")}h${String(minutes).padStart(2, "0")}min${String(remainingSeconds).padStart(2, "0")}sec`;
};

/**
 * 判断Start Time和End TimeYesNo大于12个月
 * @param {string} startTime Start Time，Example: '2023-09-14'
 * @param {string} endTime End Time，Example: '2023-12-10'
 * @return {boolean} true\false
 */
export const dateLimit = (startTime: string, endTime: string): boolean => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // 计算年差和月差
  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();

  // 总月差 = 年差*12 + 月差
  let totalMonths = yearDiff * 12 + monthDiff;

  // 如果day期部min end 小于 start，总月差减1
  if (end.getDate() < start.getDate()) {
    totalMonths--;
  }

  return totalMonths > 12;
};
