import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  easing: "ease", // animation easing
  speed: 500, // progress increment speed
  showSpinner: false, // YesNo显示圆圈加载
  trickleSpeed: 200, // automatic increment interval
  minimum: 0.3 // minimum percentage on initialization
});

export default NProgress;
