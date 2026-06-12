/**
 * 桌面组件 - 框架层
 * 模块注册表 + 布局引擎 + 拖拽缩放 + 持久化
 * 优化：rAF 节流 + 拖拽时禁用 transition + 缓存位置
 */

const WidgetFramework = {
  // === 模块注册表 ===
  _modules: new Map(),

  // === 已实例化的模块 ===
  _instances: [],

  // === 预设模块配置（启动时加载的模块） ===
  _presetModules: ['clock', 'calendar', 'weather', 'todo', 'quick-launch'],

  // === 容器引用 ===
  _container: null,

  // === 拖拽状态 ===
  _dragState: null,

  // === 缩放状态 ===
  _resizeState: null,

  // === 保存定时器 ===
  _saveTimer: null,

  // === 吸附阈值（px） ===
  _snapThreshold: 12,

  // === rAF 节流 ===
  _rafPending: false,
  _latestMoveEvent: null,

  // === 右键菜单关闭处理器 ===
  _ctxCloseHandler: null,
  _layoutData: null,

  /* ==================== 模块注册 ==================== */

  /**
   * 注册一个模块实例
   * @param {WidgetModule} instance - 模块实例
   */
  register(instance) {
    this._modules.set(instance.id, instance);
    console.log(`[Framework] 注册模块: ${instance.name} (${instance.id})`);
  },

  /* ==================== 布局引擎 ==================== */

  /**
   * 加载布局数据
   */
  _loadLayout() {
    this._layoutData = utools.db.get('widget-layout');
    if (!this._layoutData) {
      this._layoutData = { _id: 'widget-layout', modules: {} };
    }
    // 缓存 _rev 以便后续 put 更新
    this._layoutRev = this._layoutData._rev;
    return this._layoutData;
  },

  /**
   * 保存布局数据（debounce 500ms）
   */
  saveLayout() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      const layout = { _id: 'widget-layout', modules: {} };
      if (this._layoutRev) layout._rev = this._layoutRev;
      for (const inst of this._instances) {
        const card = inst.card;
        if (!card) continue;
        layout.modules[inst.module.id] = {
          x: inst._x != null ? inst._x : (parseInt(card.style.left) || 0),
          y: inst._y != null ? inst._y : (parseInt(card.style.top) || 0),
          w: inst._w != null ? inst._w : (parseInt(card.style.width) || inst.module.defaultSize.w),
          h: inst._h != null ? inst._h : (parseInt(card.style.height) || inst.module.defaultSize.h)
        };
      }
      utools.db.put(layout);
      // 更新 _rev 缓存，下一次 put 使用新版
      const result = utools.db.get('widget-layout');
      if (result) this._layoutRev = result._rev;
      this._layoutData = layout;
    }, 500);
  },

  /**
   * 获取模块保存的布局，没有则计算默认排布
   */
  _getModuleLayout(moduleId, defaultSize) {
    const saved = this._layoutData?.modules?.[moduleId];
    if (saved && saved.w && saved.h) {
      return { x: saved.x || 20, y: saved.y || 20, w: saved.w, h: saved.h };
    }
    // 无存储时自动计算位置，避免堆叠
    return this._autoPosition(moduleId, defaultSize);
  },

  /**
   * 为新模块自动分配不重叠的初始位置
   */
  _autoPosition(moduleId, defaultSize) {
    const cols = 3;
    const gap = 16;
    const pad = 4;
    const idx = this._presetModules.indexOf(moduleId);
    // 非预设模块放在新行
    if (idx === -1) {
      return { x: pad, y: pad + this._instances.length * (defaultSize.h + gap), w: defaultSize.w, h: defaultSize.h };
    }
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      x: pad + col * (defaultSize.w + gap),
      y: pad + row * (defaultSize.h + gap),
      w: defaultSize.w,
      h: defaultSize.h
    };
  },

  /**
   * 刷新所有其他卡片的矩形缓存（用于 _snap 快速查找）
   */
  _refreshSnapCache(exceptCard) {
    this._snapCache = [];
    for (const inst of this._instances) {
      const c = inst.card;
      if (!c || c === exceptCard) continue;
      this._snapCache.push({
        x: parseInt(c.style.left) || 0,
        y: parseInt(c.style.top) || 0,
        w: parseInt(c.style.width) || 280,
        h: parseInt(c.style.height) || 240
      });
    }
  },

  /* ==================== DOM 构建 ==================== */

  /**
   * 为模块创建卡片 DOM
   */
  _createCard(module, layout) {
    const card = document.createElement('div');
    card.className = 'widget-card';
    card.style.left = layout.x + 'px';
    card.style.top = layout.y + 'px';
    card.style.width = layout.w + 'px';
    card.style.height = layout.h + 'px';

    // 标题栏
    const header = document.createElement('div');
    header.className = 'widget-header';
    header.innerHTML = `
      <span class="widget-icon">${module.icon}</span>
      <span class="widget-title">${module.name}</span>
      <div class="widget-actions">
        <button class="widget-btn" data-action="remove" title="移除模块">✕</button>
      </div>
    `;

    // 内容区
    const content = document.createElement('div');
    content.className = 'widget-content';

    // 缩放手柄
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(resizeHandle);

    // 绑定事件
    this._bindCardEvents(card, header, resizeHandle, module);

    return { card, header, content, resizeHandle };
  },

  /**
   * 为卡片绑定拖拽、缩放、右键事件
   */
  _bindCardEvents(card, header, resizeHandle, module) {
    // --- 拖拽移动 ---
    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.widget-btn')) return;
      if (e.button !== 0) return;

      // 构建吸附缓存
      this._refreshSnapCache(card);

      const inst = this._instances.find(i => i.card === card);
      if (inst) {
        inst._x = parseInt(card.style.left) || 0;
        inst._y = parseInt(card.style.top) || 0;
      }

      this._dragState = {
        card,
        startX: e.clientX,
        startY: e.clientY,
        origLeft: parseInt(card.style.left) || 0,
        origTop: parseInt(card.style.top) || 0
      };

      // 拖拽期间禁用 transition 减少重排开销
      card.classList.add('dragging');

      e.preventDefault();
    });

    // --- 缩放 ---
    resizeHandle.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const inst = this._instances.find(i => i.card === card);
      if (inst) {
        inst._w = parseInt(card.style.width) || module.defaultSize.w;
        inst._h = parseInt(card.style.height) || module.defaultSize.h;
      }
      this._resizeState = {
        card,
        startX: e.clientX,
        startY: e.clientY,
        origW: parseInt(card.style.width) || module.defaultSize.w,
        origH: parseInt(card.style.height) || module.defaultSize.h,
        module
      };
      card.classList.add('dragging');
      e.preventDefault();
      e.stopPropagation();
    });

    // --- 右键菜单 ---
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this._showContextMenu(e.clientX, e.clientY, module);
    });
  },

  /* ==================== 全局鼠标事件（rAF 节流） ==================== */

  _onMouseMove(e) {
    this._latestMoveEvent = e;
    if (!this._rafPending) {
      this._rafPending = true;
      requestAnimationFrame(() => {
        this._rafPending = false;
        this._processMouseMove(this._latestMoveEvent);
      });
    }
  },

  _processMouseMove(e) {
    // 拖拽移动
    if (this._dragState) {
      const ds = this._dragState;
      let newLeft = ds.origLeft + (e.clientX - ds.startX);
      let newTop = ds.origTop + (e.clientY - ds.startY);

      // 快速吸附（使用缓存位置）
      const snapped = this._snapFast(ds.card, newLeft, newTop);
      newLeft = snapped.x;
      newTop = snapped.y;

      ds.card.style.left = newLeft + 'px';
      ds.card.style.top = newTop + 'px';

      // 同步缓存
      const inst = this._instances.find(i => i.card === ds.card);
      if (inst) { inst._x = newLeft; inst._y = newTop; }
    }

    // 缩放
    if (this._resizeState) {
      const rs = this._resizeState;
      const m = rs.module;
      let newW = rs.origW + (e.clientX - rs.startX);
      let newH = rs.origH + (e.clientY - rs.startY);

      newW = Math.max(m.minSize.w, Math.min(m.maxSize.w, newW));
      newH = Math.max(m.minSize.h, Math.min(m.maxSize.h, newH));

      rs.card.style.width = newW + 'px';
      rs.card.style.height = newH + 'px';

      const inst = this._instances.find(i => i.card === rs.card);
      if (inst) { inst._w = newW; inst._h = newH; }
    }
  },

  _onMouseUp() {
    if (this._dragState) {
      this._dragState.card.classList.remove('dragging');
      this._dragState = null;
      this.saveLayout();
    }
    if (this._resizeState) {
      this._resizeState.card.classList.remove('dragging');
      this._resizeState = null;
      this.saveLayout();
    }
  },

  /**
   * 网格吸附算法（使用缓存位置，避免每次 parseInt）
   */
  _snapFast(card, x, y) {
    const cache = this._snapCache;
    if (!cache || cache.length === 0) return { x, y };

    let bestX = x;
    let bestY = y;
    let minDistX = this._snapThreshold + 1;
    let minDistY = this._snapThreshold + 1;
    const cardW = parseInt(card.style.width) || 280;
    const cardH = parseInt(card.style.height) || 240;
    const threshold = this._snapThreshold;

    for (const other of cache) {
      // 水平吸附
      const targetsX = [
        other.x,
        other.x + other.w - cardW,
        other.x + other.w
      ];
      for (const tx of targetsX) {
        const d = Math.abs(x - tx);
        if (d < minDistX) { minDistX = d; bestX = tx; }
      }

      // 垂直吸附
      const targetsY = [
        other.y,
        other.y + other.h - cardH,
        other.y + other.h
      ];
      for (const ty of targetsY) {
        const d = Math.abs(y - ty);
        if (d < minDistY) { minDistY = d; bestY = ty; }
      }
    }

    return {
      x: minDistX <= threshold ? bestX : x,
      y: minDistY <= threshold ? bestY : y
    };
  },

  /* ==================== 右键菜单 ==================== */

  _showContextMenu(clientX, clientY, module) {
    this._hideContextMenu();

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = clientX + 'px';
    menu.style.top = clientY + 'px';

    const allModules = Array.from(this._modules.values());

    const removeSection = module
      ? `<div class="menu-item" data-action="remove">✕ 移除「${module.name}」</div>
         <div class="menu-divider"></div>`
      : '';

    menu.innerHTML = `
      ${removeSection}
      ${allModules
        .filter(m => !this._instances.some(inst => inst.module.id === m.id))
        .map(m => `<div class="menu-item" data-action="add" data-module="${m.id}">＋ 添加「${m.name}」</div>`)
        .join('') || '<div class="menu-item" style="opacity:0.4">所有模块已添加</div>'
      }
      <div class="menu-divider"></div>
      <div class="menu-item" data-action="refresh">🔄 刷新布局</div>
    `;

    menu.addEventListener('click', (e) => {
      const item = e.target.closest('.menu-item');
      if (!item) return;
      const action = item.dataset.action;

      if (action === 'remove' && module) {
        this.removeModule(module.id);
      } else if (action === 'add') {
        this.addModule(item.dataset.module);
      } else if (action === 'refresh') {
        this.refreshLayout();
      }

      this._hideContextMenu();
      document.removeEventListener('click', this._ctxCloseHandler);
      this._ctxCloseHandler = null;
    });

    document.body.appendChild(menu);
    this._contextMenu = menu;

    // 点击其他地方关闭菜单
    this._ctxCloseHandler = (e) => {
      if (!menu.contains(e.target)) {
        this._hideContextMenu();
        document.removeEventListener('click', this._ctxCloseHandler);
        this._ctxCloseHandler = null;
      }
    };
    setTimeout(() => document.addEventListener('click', this._ctxCloseHandler), 0);
  },

  _hideContextMenu() {
    if (this._contextMenu) {
      this._contextMenu.remove();
      this._contextMenu = null;
    }
    if (this._ctxCloseHandler) {
      document.removeEventListener('click', this._ctxCloseHandler);
      this._ctxCloseHandler = null;
    }
  },

  /* ==================== 模块生命周期 ==================== */

  /**
   * 添加一个模块实例到桌面
   */
  addModule(moduleId) {
    const module = this._modules.get(moduleId);
    if (!module) {
      console.warn(`[Framework] 未知模块: ${moduleId}`);
      return;
    }

    // 检查是否已存在
    if (this._instances.some(inst => inst.module.id === moduleId)) {
      console.warn(`[Framework] 模块已存在: ${moduleId}`);
      return;
    }

    const layout = this._getModuleLayout(moduleId, module.defaultSize);
    const { card, header, content, resizeHandle } = this._createCard(module, layout);

    // 渲染模块
    module.render(content);

    this._container.appendChild(card);

    const inst = { module, card, header, content, resizeHandle, _x: layout.x, _y: layout.y, _w: layout.w, _h: layout.h };
    this._instances.push(inst);
    this.saveLayout();
    console.log(`[Framework] 添加模块: ${module.name}`);
  },

  /**
   * 移除一个模块实例
   */
  removeModule(moduleId) {
    const idx = this._instances.findIndex(inst => inst.module.id === moduleId);
    if (idx === -1) return;

    const inst = this._instances[idx];
    inst.module.destroy();
    inst.card.remove();
    this._instances.splice(idx, 1);

    // 从布局数据中删除
    if (this._layoutData?.modules?.[moduleId]) {
      delete this._layoutData.modules[moduleId];
      const clean = { _id: 'widget-layout', modules: this._layoutData.modules };
      if (this._layoutRev) clean._rev = this._layoutRev;
      const res = utools.db.put(clean);
      if (res && res.ok && res.rev) this._layoutRev = res.rev;
    }

    console.log(`[Framework] 移除模块: ${inst.module.name}`);
  },

  /**
   * 刷新所有模块布局
   */
  refreshLayout() {
    const layout = this._loadLayout();
    for (const inst of this._instances) {
      const saved = layout.modules[inst.module.id];
      if (saved) {
        inst.card.style.left = saved.x + 'px';
        inst.card.style.top = saved.y + 'px';
        inst.card.style.width = saved.w + 'px';
        inst.card.style.height = saved.h + 'px';
        inst._x = saved.x;
        inst._y = saved.y;
        inst._w = saved.w;
        inst._h = saved.h;
      }
    }
  },

  /* ==================== 初始化 ==================== */

  /**
   * 启动框架
   */
  init(containerId) {
    this._container = document.getElementById(containerId);
    if (!this._container) {
      console.error('[Framework] 容器不存在:', containerId);
      return;
    }

    this._loadLayout();

    // 全局鼠标事件
    document.addEventListener('mousemove', (e) => this._onMouseMove(e));
    document.addEventListener('mouseup', () => this._onMouseUp());

    // 创建添加按钮
    const addBtn = document.createElement('button');
    addBtn.id = 'add-module-btn';
    addBtn.title = '添加模块';
    addBtn.textContent = '+';
    addBtn.addEventListener('click', (e) => {
      this._showContextMenu(e.clientX, e.clientY, null);
    });
    this._container.appendChild(addBtn);

    // 加载预设模块
    for (const modId of this._presetModules) {
      if (this._modules.has(modId)) {
        this.addModule(modId);
      }
    }

    console.log(`[Framework] 初始化完成，${this._instances.length} 个模块已加载`);
  }
};

// 暴露到全局
window.WidgetFramework = WidgetFramework;
