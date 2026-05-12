import { Directive } from "vue";

const antiShake: Directive = {
  mounted(el, binding) {
    // 判断YesNoYes函数，Debounce指令必须绑定函数
    if (typeof binding.value != "function") {
      return console.warn("Anti-shake instructions must be bound to a function");
    }
    let timeout: any = null;
    // 给el添加Custom事件-Debounce函数
    el.__onClick__ = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        // 由于绑定的Yes函数，这里直接调用绑定之即可(也就Yes调用绑定的函数)
        binding.value();
      }, 500);
    };
    // 监听点击事件，点击后调用绑定的Custom事件
    el.addEventListener("click", el.__onClick__);
  },
  beforeUnmount(el) {
    el.removeEventListener("click", el.__onClick__);
  }
};

export default antiShake;

// 每个生命week期都有两个参数，el、binding
// 其Mediumel为绑定的domelement，binding为指令的传入值
// app.directive("focus", {
// 在绑定element的 attribute 前
// 或事件监听器Application前调用
//   created(el, binding, vnode) {
//     // 下面会介绍各个参数的细节
//   },
//   // 在element被插入到 DOM 前调用
//   beforeMount(el, binding, vnode) {},
//   // 在绑定element的父组件
//   // 及他自己的所有子node都挂载完成后调用
//   mounted(el, binding, vnode) {},
//   // 绑定element的父组件更新前调用
//   beforeUpdate(el, binding, vnode, prevVnode) {},
//   // 在绑定element的父组件
//   // 及他自己的所有子node都更新后调用
//   updated(el, binding, vnode, prevVnode) {},
//   // 绑定element的父组件卸载前调用
//   beforeUnmount(el, binding, vnode) {},
//   // 绑定element的父组件卸载后调用
//   unmounted(el, binding, vnode) {}
// });
