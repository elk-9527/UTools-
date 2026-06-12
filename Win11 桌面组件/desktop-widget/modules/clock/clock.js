/**
 * 时钟模块
 * 实时显示当前时间、日期、星期
 */
class ClockModule extends WidgetModule {
  constructor() {
    super({
      id: 'clock',
      name: '时钟',
      icon: '🕐',
      defaultSize: { w: 260, h: 140 },
      minSize: { w: 180, h: 100 },
      maxSize: { w: 400, h: 220 }
    });
    this._timer = null;
    this._timeEl = null;
    this._dateEl = null;
    this._weekEl = null;
  }

  render(container) {
    super.render(container);
    container.innerHTML = `
      <div class="clock-container">
        <div class="clock-time" id="clock-time">00:00:00</div>
        <div class="clock-date" id="clock-date">2026年1月1日</div>
        <div class="clock-weekday" id="clock-weekday">星期四</div>
      </div>
    `;

    this._timeEl = container.querySelector('#clock-time');
    this._dateEl = container.querySelector('#clock-date');
    this._weekEl = container.querySelector('#clock-weekday');

    this._update();
    this._timer = setInterval(() => this._update(), 1000);
  }

  _update() {
    if (this.isDestroyed()) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    if (this._timeEl) {
      this._timeEl.textContent = `${hh}:${mm}:${ss}`;
    }

    if (this._dateEl) {
      this._dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    }

    if (this._weekEl) {
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      this._weekEl.textContent = weekdays[now.getDay()];
    }
  }

  destroy() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this._timeEl = null;
    this._dateEl = null;
    this._weekEl = null;
    super.destroy();
  }
}

// 注册到全局
window.ClockModule = ClockModule;
