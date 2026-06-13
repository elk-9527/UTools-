/**
 * 快捷启动模块
 * 支持应用 (.exe)、文件夹、网址 三种快捷方式
 * 数据存储在 utools.db
 */
class QuickLaunchModule extends WidgetModule {
  constructor() {
    super({
      id: 'quick-launch',
      name: '快捷启动',
      icon: '🚀',
      defaultSize: { w: 320, h: 220 },
      minSize: { w: 200, h: 140 },
      maxSize: { w: 500, h: 400 }
    });
    this._shortcuts = [];
  }

  render(container) {
    super.render(container);
    this._loadShortcuts();
  }

  _loadShortcuts() {
    try {
      this._shortcuts = utools.db.allDocs('ql-')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (err) {
      console.error('[QuickLaunch] 读取快捷方式失败:', err);
      this._shortcuts = [];
    }
    this._renderUI();
  }

  _renderUI() {
    const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const typeIcons = { app: '⚡', folder: '📁', url: '🌐' };
    const typeDots = { app: 'app', folder: 'folder', url: 'url' };

    let html = '<div class="ql-container"><div class="ql-grid">';

    for (const s of this._shortcuts) {
      html += `
        <div class="ql-item" data-id="${s._id}" title="${esc(s.name)}">
          <div class="ql-icon-wrapper">
            ${typeIcons[s.targetType] || '📦'}
            <span class="ql-type-dot ${typeDots[s.targetType] || ''}"></span>
          </div>
          <span class="ql-name">${esc(s.name)}</span>
        </div>
      `;
    }

    // 添加按钮
    html += `
      <div class="ql-add-btn" id="ql-add-btn">
        <div class="ql-add-icon">＋</div>
        <span class="ql-add-label">添加</span>
      </div>
    `;

    html += '</div></div>';
    this.container.innerHTML = html;

    // 绑定点击事件
    this.container.querySelectorAll('.ql-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const sc = this._shortcuts.find(s => s._id === id);
        if (sc) this._launch(sc);
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();  // 阻止冒泡到全局，防止设置面板覆盖删除菜单
        this._showItemMenu(e, item.dataset.id);
      });
    });

    // 添加按钮
    this.container.querySelector('#ql-add-btn')?.addEventListener('click', () => {
      this._showAddDialog();
    });
  }

  async _launch(sc) {
    try {
      if (sc.targetType === 'app') {
        await window.widgetServices.launchApp(sc.target);
      } else if (sc.targetType === 'folder') {
        await window.widgetServices.openFolder(sc.target);
      } else if (sc.targetType === 'url') {
        await window.widgetServices.openUrl(sc.target);
      }
    } catch (err) {
      console.error('[QuickLaunch] 启动失败:', err);
      // 静默失败
    }
  }

  _showAddDialog() {
    const old = document.querySelector('.ql-dialog-overlay');
    if (old) old.remove();

    let targetType = 'app';
    let targetPath = '';
    let targetName = '';

    const overlay = document.createElement('div');
    overlay.className = 'ql-dialog-overlay';
    overlay.innerHTML = `
      <div class="ql-dialog">
        <h3>🚀 添加快捷方式</h3>
        <div class="ql-type-tabs">
          <button class="ql-type-tab active" data-type="app">⚡ 应用</button>
          <button class="ql-type-tab" data-type="folder">📁 文件夹</button>
          <button class="ql-type-tab" data-type="url">🌐 网址</button>
        </div>
        <input class="input" id="ql-name-input" placeholder="快捷方式名称" autocomplete="off">
        <div class="input-row">
          <input class="input" id="ql-target-input" placeholder="点击浏览选择文件..." readonly autocomplete="off">
          <button class="btn" id="ql-browse">浏览</button>
        </div>
        <div class="btn-row">
          <button class="btn" id="ql-cancel">取消</button>
          <button class="btn btn-accent" id="ql-confirm">确认添加</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const nameInput   = overlay.querySelector('#ql-name-input');
    const targetInput = overlay.querySelector('#ql-target-input');
    const browseBtn   = overlay.querySelector('#ql-browse');
    const confirmBtn  = overlay.querySelector('#ql-confirm');
    const cancelBtn   = overlay.querySelector('#ql-cancel');
    const tabs        = overlay.querySelectorAll('.ql-type-tab');

    // 根据当前类型刷新输入框状态
    function refreshInputs() {
      // tab 高亮
      tabs.forEach(t => t.classList.toggle('active', t.dataset.type === targetType));

      if (targetType === 'url') {
        browseBtn.style.display = 'none';
        targetInput.readOnly = false;
        targetInput.value = '';               // 清空以供用户填写
        targetInput.placeholder = '输入网址，如 https://www.baidu.com';
        targetInput.style.display = '';
      } else {
        // app / folder
        browseBtn.style.display = '';
        targetInput.readOnly = true;
        targetInput.placeholder = targetType === 'app'
          ? '点击浏览选择 .exe 或 .lnk 文件'
          : '点击浏览选择文件夹';
        targetInput.value = targetPath || '';
        targetInput.style.display = targetPath ? '' : 'none';
      }
    }

    // tab 点击
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        targetType = t.dataset.type;
        targetPath = '';
        refreshInputs();
      });
    });

    // 浏览（showOpenDialog 返回 Promise，必须异步处理）
    browseBtn.addEventListener('click', async () => {
      if (targetType === 'app') {
        const picked = await utools.showOpenDialog({
          filters: [{ name: '可执行文件', extensions: ['exe', 'lnk'] }],
          properties: ['openFile']
        });
        if (picked && picked[0]) { targetPath = picked[0]; refreshInputs(); }
      } else if (targetType === 'folder') {
        const picked = await utools.showOpenDialog({
          properties: ['openDirectory']
        });
        if (picked && picked[0]) { targetPath = picked[0]; refreshInputs(); }
      }
    });

    // 确认
    confirmBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      const target = targetType === 'url' ? targetInput.value.trim() : targetPath;

      if (!name)  { nameInput.focus(); return; }
      if (!target) { targetInput.focus(); return; }

      this._addShortcut(name, targetType, target);
      overlay.remove();
    });

    // 取消
    cancelBtn.addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // 初始状态
    refreshInputs();
  }

  _addShortcut(name, targetType, target) {
    const now = Date.now();
    const doc = {
      _id: 'ql-' + now + '-' + Math.random().toString(36).slice(2, 6),
      type: 'shortcut',
      name,
      targetType,
      target,
      order: this._shortcuts.length,
      createdAt: now
    };
    utools.db.put(doc);
    this._shortcuts.push(doc);
    this._renderUI();
  }

  _removeShortcut(id) {
    const doc = this._shortcuts.find(s => s._id === id);
    this._shortcuts = this._shortcuts.filter(s => s._id !== id);
    if (doc) utools.db.remove(doc);
    else utools.db.remove(id);
    this._renderUI();
  }

  _showItemMenu(e, id) {
    const sc = this._shortcuts.find(s => s._id === id);
    if (!sc) return;

    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    menu.innerHTML = `
      <div class="menu-item" style="opacity:0.6;cursor:default">${sc.name}</div>
      <div class="menu-divider"></div>
      <div class="menu-item" data-action="delete">🗑 删除</div>
    `;

    menu.addEventListener('click', (ev) => {
      const action = ev.target.closest('.menu-item')?.dataset.action;
      if (action === 'delete') {
        this._removeShortcut(id);
      }
      menu.remove();
    });

    document.body.appendChild(menu);

    const closeHandler = (ev) => {
      if (!menu.contains(ev.target)) {
        menu.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 0);
  }

  destroy() {
    super.destroy();
  }
}

window.QuickLaunchModule = QuickLaunchModule;
