/**
 * 全局加载 loading-page
 * @method start 创建 loading
 * @method done 移除 loading
 */
export const loadingPage = {
  // 开始渲染loading
  start: () => {
    // 获取顶层body
    // 将新创建的dc-loaderelement（div）插入到bodyelement的子element列表Medium的指定位置（在指定element之前）
    // 插入的位置Yes作为bodyelement的No. one个子element，即page的最顶部位置
    const bodyDom: Element = document.body;
    const div = document.createElement("div");
    div.className = "loading-page";
    const loader = document.createElement("div");
    loader.className = "dc-loader";
    div.appendChild(loader);
    bodyDom.insertBefore(div, bodyDom.firstChild);
  },
  // 结束渲染loading
  done: (time: number = 0) => {
    setTimeout(() => {
      // 找到No. one个匹配object
      // 找到loading-page的父node，移除loading-page
      const dom = document.querySelector(".loading-page");
      dom?.parentNode?.removeChild(dom);
    }, time);
  }
};
