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

    const updateUI = () => {
      const tabs = overlay.querySelectorAll('.ql-type-tab');
      if (tabs.length > 0) tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.type === targetType);
      });

      const browseBtn = overlay.querySelector('#ql-browse');
      const urlInput = overlay.querySelector('#ql-target-input');
      const nameInput = overlay.querySelector('#ql-name-input');

      if (!browseBtn || !urlInput) return;

      if (targetType === 'url') {
        // 网址模式：不用系统浏览按钮，输入框可手填
        browseBtn.style.display = 'none';
        urlInput.style.display = '';
        urlInput.readOnly = false;
        urlInput.placeholder = '输入网址，如 https://www.baidu.com';
        urlInput.value = '';
      } else if (targetType === 'app' || targetType === 'folder') {
        browseBtn.style.display = '';
        urlInput.placeholder = '点击浏览选择文件...';
        urlInput.readOnly = true;
        if (targetPath) {
          urlInput.style.display = '';
          urlInput.value = targetPath;
        } else {
          urlInput.style.display = 'none';
        }
      }
    };

    overlay.innerHTML = `
      <div class="ql-dialog">
        <h3>🚀 添加快捷方式</h3>
        <div class="ql-type-tabs">
          <button class="ql-type-tab active" data-type="app">⚡ 应用</button>
          <button class="ql-type-tab" data-type="folder">📁 文件夹</button>
          <button class="ql-type-tab" data-type="url">🌐 网址</button>
        </div>
        <input class="input" id="ql-name-input" placeholder="快捷方式名称">
        <div class="input-row">
          <input class="input" id="ql-target-input" placeholder="点击浏览选择文件..." readonly>
          <button class="btn" id="ql-browse">浏览</button>
        </div>
        <div class="btn-row">
          <button class="btn" id="ql-cancel">取消</button>
          <button class="btn btn-accent" id="ql-confirm">确认添加</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 类型切换（必须在 appendChild 之后绑定）
    overlay.querySelectorAll('.ql-type-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        targetType = tab.dataset.type;
        targetPath = '';
        updateUI();
      });
    });

    // 浏览按钮
    overlay.querySelector('#ql-browse').addEventListener('click', () => {
      if (targetType === 'app') {
        const picked = utools.showOpenDialog({
          filters: [{ name: '可执行文件', extensions: ['exe', 'lnk'] }],
          properties: ['openFile']
        });
        if (picked && picked[0]) {
          targetPath = picked[0];
          updateUI();
        }
      } else if (targetType === 'folder') {
        const picked = utools.showOpenDialog({
          properties: ['openDirectory']
        });
        if (picked && picked[0]) {
          targetPath = picked[0];
          updateUI();
        }
      }
    });

    // 取消
    overlay.querySelector('#ql-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    // 确认
    overlay.querySelector('#ql-confirm').addEventListener('click', () => {
      const nameEl = overlay.querySelector('#ql-name-input');
      const targetEl = overlay.querySelector('#ql-target-input');
      const name = nameEl.value.trim();
      const target = targetType === 'url' ? targetEl.value.trim() : targetPath;

      if (!name) { nameEl.focus(); return; }
      if (!target) { targetEl.focus(); return; }

      this._addShortcut(name, targetType, target);
      overlay.remove();
    });

    updateUI();
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
