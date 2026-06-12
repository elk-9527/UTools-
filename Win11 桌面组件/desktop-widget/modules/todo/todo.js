/**
 * 待办事项模块
 * 增删改 + utools.db 云同步
 */
class TodoModule extends WidgetModule {
  constructor() {
    super({
      id: 'todo',
      name: '待办',
      icon: '✅',
      defaultSize: { w: 280, h: 320 },
      minSize: { w: 200, h: 180 },
      maxSize: { w: 420, h: 500 }
    });
    this._todos = [];
    this._filterDate = null; // 筛选日期
  }

  render(container) {
    super.render(container);
    this._initUI();
    this._loadTodos();

    // 监听日历日期选择
    this._dateHandler = (e) => {
      this._filterDate = e.detail.date;
      this._renderList();
    };
    window.addEventListener('calendar:dateSelect', this._dateHandler);
  }

  _initUI() {
    this.container.innerHTML = `
      <div class="todo-container">
        <div class="todo-input-row">
          <input class="input" id="todo-input" placeholder="添加待办事项..." maxlength="200">
          <button class="btn btn-accent" id="todo-add">添加</button>
        </div>
        <div class="todo-filter-bar" id="todo-filter-bar" style="display:none"></div>
        <div class="todo-list" id="todo-list"></div>
      </div>
    `;

    const input = this.container.querySelector('#todo-input');
    const addBtn = this.container.querySelector('#todo-add');

    const addTodo = () => {
      const text = input.value.trim();
      if (!text) return;
      this._addTodo(text);
      input.value = '';
      input.focus();
    };

    addBtn.addEventListener('click', addTodo);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTodo();
    });
  }

  _loadTodos() {
    this._todos = utools.db.allDocs('todo-')
      .sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    this._renderList();
  }

  _addTodo(text) {
    const now = Date.now();
    const doc = {
      _id: 'todo-' + now + '-' + Math.random().toString(36).slice(2, 6),
      type: 'todo',
      text,
      done: false,
      date: this._filterDate || null,
      createdAt: now
    };
    utools.db.put(doc);
    this._todos.unshift(doc);
    this._renderList();
    window.dispatchEvent(new CustomEvent('todo:changed'));
  }

  _toggleTodo(id) {
    const doc = this._todos.find(t => t._id === id);
    if (!doc) return;
    doc.done = !doc.done;
    utools.db.put(doc);
    // 重新排序
    this._todos.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    this._renderList();
    window.dispatchEvent(new CustomEvent('todo:changed'));
  }

  _deleteTodo(id) {
    const doc = this._todos.find(t => t._id === id);
    this._todos = this._todos.filter(t => t._id !== id);
    if (doc) utools.db.remove(doc);
    else utools.db.remove(id);
    this._renderList();
    window.dispatchEvent(new CustomEvent('todo:changed'));
  }

  _renderList() {
    const listEl = this.container.querySelector('#todo-list');
    if (!listEl) return;

    // 更新筛选条
    const bar = this.container.querySelector('#todo-filter-bar');
    if (bar) {
      if (this._filterDate) {
        bar.style.display = '';
        bar.innerHTML = `<span>📅 ${this._filterDate}</span><button class="todo-filter-clear">显示全部 ✕</button>`;
        bar.querySelector('.todo-filter-clear').onclick = () => { this._filterDate = null; this._renderList(); };
      } else {
        bar.style.display = 'none';
        bar.innerHTML = '';
      }
    }

    let todos = this._todos;
    if (this._filterDate) {
      todos = todos.filter(t => t.date === this._filterDate);
    }

    if (todos.length === 0) {
      listEl.innerHTML = '<div class="todo-empty">暂无待办事项</div>';
      return;
    }

    listEl.innerHTML = todos.map(t => `
      <div class="todo-item ${t.done ? 'done' : ''}" data-id="${t._id}">
        <div class="todo-checkbox" data-action="toggle">✓</div>
        <span class="todo-text">${this._escapeHtml(t.text)}</span>
        ${t.date ? `<span class="todo-date-badge">📅 ${t.date}</span>` : ''}
        <button class="todo-delete" data-action="delete">✕</button>
      </div>
    `).join('');

    // 绑定事件
    listEl.querySelectorAll('.todo-item').forEach(item => {
      const id = item.dataset.id;
      item.querySelector('[data-action="toggle"]').addEventListener('click', () => this._toggleTodo(id));
      item.querySelector('[data-action="delete"]').addEventListener('click', () => this._deleteTodo(id));
    });
  }

  _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  destroy() {
    if (this._dateHandler) {
      window.removeEventListener('calendar:dateSelect', this._dateHandler);
    }
    super.destroy();
  }
}

window.TodoModule = TodoModule;
