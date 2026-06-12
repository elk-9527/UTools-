/**
 * 天气模块
 * 基于 Open-Meteo API（免费，无需 Key）
 * 数据缓存 30 分钟
 */

const WMO_CODES = {
  0:  { desc: '晴天', icon: '☀️' },
  1:  { desc: '大部晴朗', icon: '🌤️' },
  2:  { desc: '部分多云', icon: '⛅' },
  3:  { desc: '多云', icon: '☁️' },
  45: { desc: '雾', icon: '🌫️' },
  48: { desc: '冻雾', icon: '🌫️' },
  51: { desc: '小毛毛雨', icon: '🌦️' },
  53: { desc: '毛毛雨', icon: '🌦️' },
  55: { desc: '大毛毛雨', icon: '🌧️' },
  61: { desc: '小雨', icon: '🌧️' },
  63: { desc: '中雨', icon: '🌧️' },
  65: { desc: '大雨', icon: '🌧️' },
  71: { desc: '小雪', icon: '❄️' },
  73: { desc: '中雪', icon: '❄️' },
  75: { desc: '大雪', icon: '❄️' },
  77: { desc: '雪粒', icon: '❄️' },
  80: { desc: '阵雨', icon: '🌦️' },
  81: { desc: '中阵雨', icon: '🌧️' },
  82: { desc: '大阵雨', icon: '⛈️' },
  85: { desc: '小阵雪', icon: '🌨️' },
  86: { desc: '大阵雪', icon: '🌨️' },
  95: { desc: '雷暴', icon: '⛈️' },
  96: { desc: '雷暴+小冰雹', icon: '⛈️' },
  99: { desc: '雷暴+大冰雹', icon: '⛈️' }
};

class WeatherModule extends WidgetModule {
  constructor() {
    super({
      id: 'weather',
      name: '天气',
      icon: '🌤️',
      defaultSize: { w: 280, h: 240 },
      minSize: { w: 200, h: 180 },
      maxSize: { w: 400, h: 400 }
    });
    this._cache = null;
    this._cacheTime = 0;
    this._cacheDuration = 30 * 60 * 1000; // 30 分钟
    this._refreshTimer = null;
  }

  render(container) {
    super.render(container);
    container.innerHTML = '<div class="weather-loading">正在获取天气...</div>';
    this._loadWeather();
  }

  async _loadWeather() {
    try {
      // 获取城市设置
      const cityData = utools.db.get('weather-city');
      let lat, lon, cityName;

      if (cityData) {
        lat = cityData.lat;
        lon = cityData.lon;
        cityName = cityData.name;
      } else {
        // IP 定位
        const loc = await this._locateByIP();
        lat = loc.lat;
        lon = loc.lon;
        cityName = loc.city;
        // 保存（首次写入无需 _rev）
        const existing = utools.db.get('weather-city');
        const doc = { _id: 'weather-city', lat, lon, name: cityName };
        if (existing && existing._rev) doc._rev = existing._rev;
        utools.db.put(doc);
      }

      // 检查缓存
      const now = Date.now();
      if (this._cache && (now - this._cacheTime) < this._cacheDuration &&
          this._cache.lat === lat && this._cache.lon === lon) {
        this._renderWeather(this._cache.data, cityName);
        return;
      }

      // 请求天气数据
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
      const resp = await fetch(url);
      const data = await resp.json();

      this._cache = { lat, lon, data };
      this._cacheTime = now;
      this._renderWeather(data, cityName);

      // 写入离线缓存
      const cacheEx = utools.db.get('weather-cache');
      const cacheDoc = { _id: 'weather-cache', data, cityName, ts: now };
      if (cacheEx && cacheEx._rev) cacheDoc._rev = cacheEx._rev;
      utools.db.put(cacheDoc);
    } catch (err) {
      console.error('[Weather] 获取天气失败:', err);
      // 尝试使用离线缓存
      const cache = utools.db.get('weather-cache');
      if (cache && cache.data) {
        this._renderWeather(cache.data, cache.cityName);
        // 叠加离线提示
        if (this.container) {
          const bar = document.createElement('div');
          bar.className = 'weather-offline-bar';
          const ts = cache.ts || 0;
          bar.textContent = ts ? `⚠️ 离线 · 上次更新 ${new Date(ts).toLocaleString()}` : '⚠️ 离线 · 显示缓存数据';
          this.container.insertBefore(bar, this.container.firstChild);
        }
      } else if (this.container) {
        this.container.innerHTML = '<div class="weather-loading">天气数据加载失败<br><small>点击重试</small></div>';
        this.container.style.cursor = 'pointer';
        this.container.addEventListener('click', () => this._loadWeather(), { once: true });
      }
    }
  }

  async _locateByIP() {
    try {
      const resp = await fetch('https://ipapi.co/json/');
      const data = await resp.json();
      return { lat: data.latitude, lon: data.longitude, city: data.city || '未知城市' };
    } catch (e) {
      // 默认北京
      return { lat: 39.9042, lon: 116.4074, city: '北京' };
    }
  }

  _renderWeather(data, cityName) {
    if (!this.container || this.isDestroyed()) return;

    const current = data.current;
    const daily = data.daily;
    const wmo = WMO_CODES[current.weather_code] || { desc: '未知', icon: '🌈' };

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    let html = '<div class="weather-container">';

    // 城市名
    html += `<div class="weather-city" id="weather-city-btn">📍 ${cityName} <span class="edit-hint">点击切换</span></div>`;

    // 主信息
    html += '<div class="weather-main">';
    html += `<span class="weather-icon">${wmo.icon}</span>`;
    html += `<span class="weather-temp">${Math.round(current.temperature_2m)}<sup>°C</sup></span>`;
    html += '</div>';

    html += `<div class="weather-desc">${wmo.desc}</div>`;

    // 详细信息
    html += '<div class="weather-details">';
    html += `<div class="weather-detail">💧 <span class="label">湿度</span> ${current.relative_humidity_2m}%</div>`;
    html += `<div class="weather-detail">💨 <span class="label">风速</span> ${current.wind_speed_10m} km/h</div>`;
    html += '</div>';

    // 未来预报
    html += '<div class="weather-forecast">';
    for (let i = 1; i <= 3; i++) {
      const date = new Date(daily.time[i]);
      const dayLabel = i === 1 ? '明天' : weekDays[date.getDay()];
      const dayWmo = WMO_CODES[daily.weather_code[i]] || { icon: '🌈' };
      html += '<div class="forecast-day">';
      html += `<span class="day-label">${dayLabel}</span>`;
      html += `<span class="day-icon">${dayWmo.icon}</span>`;
      html += `<span class="day-temps"><span class="high">${Math.round(daily.temperature_2m_max[i])}°</span> <span class="low">${Math.round(daily.temperature_2m_min[i])}°</span></span>`;
      html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    this.container.innerHTML = html;

    // 城市切换按钮
    const cityBtn = this.container.querySelector('#weather-city-btn');
    cityBtn?.addEventListener('click', () => this._showCityDialog());

    // 定时刷新
    if (this._refreshTimer) clearInterval(this._refreshTimer);
    this._refreshTimer = setInterval(() => this._loadWeather(), this._cacheDuration);
  }

  _showCityDialog() {
    // 移除旧弹窗
    const old = document.querySelector('.weather-settings-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'weather-settings-overlay';
    overlay.innerHTML = `
      <div class="weather-settings-dialog">
        <h3>🏙️ 设置城市</h3>
        <div class="input-row">
          <input class="input" id="city-input" placeholder="输入城市名（如：北京）" autofocus>
          <button class="btn btn-accent" id="city-confirm">确认</button>
        </div>
        <div class="hint">输入中文城市名，将自动查询经纬度</div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#city-input');
    const confirmBtn = overlay.querySelector('#city-confirm');

    const setCity = async () => {
      const cityName = input.value.trim();
      if (!cityName) return;

      try {
        // 地理编码
        const resp = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=zh`);
        const data = await resp.json();
        if (data.results && data.results.length > 0) {
          const result = data.results[0];
          const existing = utools.db.get('weather-city');
          const doc = { _id: 'weather-city', lat: result.latitude, lon: result.longitude, name: result.name };
          if (existing && existing._rev) doc._rev = existing._rev;
          utools.db.put(doc);
          this._cache = null; // 清除缓存
          this._loadWeather();
        } else {
          alert('未找到该城市，请尝试其他名称');
        }
      } catch (e) {
        alert('查询失败，请检查网络');
      }

      overlay.remove();
    };

    confirmBtn.addEventListener('click', setCity);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') setCity();
      if (e.key === 'Escape') overlay.remove();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  destroy() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
    super.destroy();
  }
}

window.WeatherModule = WeatherModule;
