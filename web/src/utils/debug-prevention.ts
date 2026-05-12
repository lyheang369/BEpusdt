/**
 * prevent keyboard events from opening devtools
 */
class KeydownControl {
  /**
   * prevent keyboard events from opening devtools
   * 主要的组合键有four种：
   * 1、ctrl+shift+i
   * 2、F12
   * 3、ctrl+shift+c
   * 4、shift+f10
   * @param e 键盘事件
   */
  private keydown = (e: KeyboardEvent) => {
    const code = e.code; // 具体按键
    const ctrl = e.ctrlKey; // Controlwhether key is pressed
    const shift = e.shiftKey; // Shiftwhether key is pressed
    // ctrl+shift+i
    const isCSI = ctrl && shift && code === "KeyI";
    // F12
    const isF12 = code === "F12";
    // ctrl+shift+c
    const isCSC = ctrl && shift && code === "KeyC";
    // shift+f10
    const isSF10 = shift && code === "F10";
    // 禁止打开控制台
    if (isF12 || isCSI || isCSC || isSF10) {
      e.preventDefault();
    }
  };
  // 监听键盘事件
  start() {
    document.addEventListener("keydown", this.keydown);
  }
  // 移除键盘事件监听
  stop() {
    document.removeEventListener("keydown", this.keydown);
  }
}

/**
 * prevent mouse events from opening devtools
 */
class RightMouseControl {
  /**
   * prevent mouse events from opening devtools
   * @param e 鼠标事件
   */
  private rightClick = (e: MouseEvent) => {
    e.preventDefault();
  };
  // 监听鼠标右键
  start() {
    // 禁用鼠标右键菜单
    document.addEventListener("contextmenu", this.rightClick);
  }
  // 移除鼠标右键监听
  stop() {
    document.removeEventListener("contextmenu", this.rightClick);
  }
}

/**
 * use debugger keyword to prevent devtools opening
 */
class DebugProtector {
  private isActive = false; // YesNoOnAnti-debugging

  start() {
    if (this.isActive) return;
    this.isActive = true; // OnAnti-debugging
    this.asyncCheck(); // 异步检查
  }

  private asyncCheck() {
    if (!this.isActive) return;
    // 直接使用debugger关键字，避免eval的安全风险
    debugger;

    // 异步调度避免栈溢出
    setTimeout(() => {
      this.asyncCheck();
    }, 200); // 保持0.2sec间隔
  }

  stop() {
    this.isActive = false;
  }
}

/**
 * Anti-debugging开关
 * 1、prevent keyboard events from opening devtools
 * 2、prevent mouse events from opening devtools
 * 3、use debugger keyword to prevent devtools opening
 */
class DebugControl {
  private modules: any[] = [];

  constructor() {
    this.modules.push(new KeydownControl(), new RightMouseControl(), new DebugProtector());
  }
  /**
   * OnAnti-debugging
   */
  start() {
    this.modules.forEach(m => m.start?.());
  }
  /**
   * OffAnti-debugging
   */
  stop() {
    this.modules.forEach(m => m.stop?.());
  }
}

export { DebugControl };
