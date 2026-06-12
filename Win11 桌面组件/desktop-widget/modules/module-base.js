/**
 * 桌面组件 - 模块基类
 * 所有功能模块必须实现此接口
 */
class WidgetModule {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.icon = config.icon || '📦';
    this.defaultSize = config.defaultSize || { w: 280, h: 240 };
    this.minSize = config.minSize || { w: 180, h: 140 };
    this.maxSize = config.maxSize || { w: 500, h: 500 };
    this.container = null;
    this.contentEl = null;
    this._destroyed = false;
  }

  /**
   * 渲染模块内容到指定容器
   * 子类必须实现此方法
   */
  render(container) {
    this.container = container;
  }

  /**
   * 清理资源（定时器、事件监听等）
   * 子类可重写
   */
  destroy() {
    this._destroyed = true;
    this.container = null;
  }

  /**
   * 模块配置变更时调用
   * 子类可重写
   */
  onConfigChange(key, value) {}

  isDestroyed() {
    return this._destroyed;
  }
}

// CommonJS 导出（供 preload 使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WidgetModule;
}
