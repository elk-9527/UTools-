/**
 * 日历模块
 * 月历视图，可翻月，高亮今天
 */
class CalendarModule extends WidgetModule {
  constructor() {
    super({
      id: 'calendar',
      name: '日历',
      icon: '📅',
      defaultSize: { w: 280, h: 300 },
      minSize: { w: 220, h: 240 },
      maxSize: { w: 400, h: 450 }
    });
    this._currentYear = new Date().getFullYear();
    this._currentMonth = new Date().getMonth(); // 0-11
  }

  render(container) {
    super.render(container);
    this._renderCalendar();
    // 用 db 轮询检测待办变化，跨窗口桥接
    this._dbSyncTimer = setInterval(() => {
      const bridge = utools.db.get('todo-bridge');
      if (bridge && bridge._ts !== this._lastTodoBridgeTs) {
        this._lastTodoBridgeTs = bridge._ts;
        this._renderCalendar();
      }
    }, 600);
  }

  _renderCalendar() {
    const today = new Date();
    const firstDay = new Date(this._currentYear, this._currentMonth, 1);
    const lastDay = new Date(this._currentYear, this._currentMonth + 1, 0);
    const startDayOfWeek = firstDay.getDay(); // 0=周日
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = new Date(this._currentYear, this._currentMonth, 0).getDate();

    const weekHeaders = ['日', '一', '二', '三', '四', '五', '六'];

    // 读取所有有待办的日期
    const todoDates = this._getTodoDates();

    let html = '<div class="calendar-container">';
    html += '<div class="calendar-header">';
    html += `<button class="calendar-nav-btn" data-action="prev">◀</button>`;
    html += `<span class="calendar-month-label">${this._currentYear}年${this._currentMonth + 1}月</span>`;
    html += `<button class="calendar-nav-btn" data-action="next">▶</button>`;
    html += '</div>';

    html += '<div class="calendar-grid">';

    // 星期头
    for (const day of weekHeaders) {
      html += `<div class="calendar-day-header">${day}</div>`;
    }

    // 上个月填充
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      html += `<div class="calendar-day other-month">${d}</div>`;
    }

    // 当月日期
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this._currentYear}-${String(this._currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let cls = 'calendar-day';
      if (this._currentYear === today.getFullYear() &&
          this._currentMonth === today.getMonth() &&
          d === today.getDate()) {
        cls += ' today';
      }
      if (todoDates.has(dateStr)) cls += ' has-todo';
      html += `<div class="${cls}" data-day="${d}" data-date="${dateStr}">${d}</div>`;
    }

    // 下个月填充
    const totalCells = startDayOfWeek + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remaining; d++) {
      html += `<div class="calendar-day other-month">${d}</div>`;
    }

    html += '</div></div>';

    this.container.innerHTML = html;

    // 绑定事件
    this._bindEvents();
  }

  _getTodoDates() {
    try {
      const docs = utools.db.allDocs('todo-');
      const set = new Set();
      for (const d of docs) if (d.date) set.add(d.date);
      return set;
    } catch (e) { return new Set(); }
  }

  _bindEvents() {
    const prevBtn = this.container.querySelector('[data-action="prev"]');
    const nextBtn = this.container.querySelector('[data-action="next"]');

    prevBtn?.addEventListener('click', () => {
      if (this._currentMonth === 0) {
        this._currentMonth = 11;
        this._currentYear--;
      } else {
        this._currentMonth--;
      }
      this._renderCalendar();
    });

    nextBtn?.addEventListener('click', () => {
      if (this._currentMonth === 11) {
        this._currentMonth = 0;
        this._currentYear++;
      } else {
        this._currentMonth++;
      }
      this._renderCalendar();
    });

    // 日期点击 → 写入 db 桥接通知待办模块
    this.container.querySelectorAll('.calendar-day:not(.other-month)').forEach(el => {
      el.addEventListener('click', () => {
        const dateStr = el.dataset.date;
        if (!dateStr) return;
        // 写入 db 桥接文档，跨窗口通知待办模块
        const existing = utools.db.get('calendar-bridge');
        const doc = { _id: 'calendar-bridge', date: dateStr, ts: Date.now() };
        if (existing && existing._rev) doc._rev = existing._rev;
        utools.db.put(doc);
      });
    });
  }

  destroy() {
    if (this._todoChangedHandler) {
      window.removeEventListener('todo:changed', this._todoChangedHandler);
    }
    if (this._dbSyncTimer) { clearInterval(this._dbSyncTimer); }
    super.destroy();
  }
}

// 注册到全局
window.CalendarModule = CalendarModule;
