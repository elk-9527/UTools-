# Win11 桌面组件

一个用于 **uTools** 的 Win11 桌面悬浮窗插件，在桌面上显示 **天气、时钟、日历、待办事项、快捷启动**。

毛玻璃/液态玻璃视觉风格，模块支持**自由拖拽排列**和**自由缩放**，架构支持**未来扩展新模块**。

---

## 快速开始

### 1. 前提条件

- 安装 [uTools](https://www.u.tools/download/)
- 安装 [uTools 开发者工具](https://www.u.tools/plugins/detail/uTools%20%E5%BC%80%E5%8F%91%E8%80%85%E5%B7%A5%E5%85%B7/)

### 2. 加载插件

1. 打开 uTools，按 `Ctrl + Space` 调出搜索框
2. 输入 `uTools 开发者工具` 并进入
3. 点击 **新建插件应用** → 选择 `desktop-widget` 目录
4. 点击 **接入开发**

### 3. 启动桌面组件

在 uTools 搜索框中输入以下任一关键词：

- `桌面组件`
- `桌面小工具`
- `DesktopWidget`
- `Widget`

---

## 功能模块

| 模块 | 说明 | 数据来源 |
|------|------|---------|
| 🕐 **时钟** | 实时数字时钟，显示日期和星期 | 系统时间 |
| 📅 **日历** | 月历视图，可翻月，高亮今天，点击日期筛选待办 | 前端计算 |
| 🌤️ **天气** | 显示当前温度、湿度、风速、3天预报 | Open-Meteo 免费 API |
| ✅ **待办** | 增删改待办事项，支持日期关联 | uTools DB（可跨设备同步） |
| 🚀 **快捷启动** | 应用(.exe)、文件夹、网址 三种快捷方式 | uTools DB |

## 操作方式

| 操作 | 方式 |
|------|------|
| 移动模块 | 按住标题栏拖拽 |
| 缩放模块 | 拖动卡片右下角手柄 |
| 添加/移除模块 | 右键卡片 → 菜单选择 |
| 切换城市 | 点击天气模块的城市名 |
| 日历翻月 | 点击 ◀ ▶ 箭头 |
| 添加快捷方式 | 点击 + 号图标 |

---

## 目录结构

```
desktop-widget/
├── plugin.json              # 插件核心配置
├── index.html               # 插件入口（创建悬浮窗）
├── widget.html              # 真实桌面 UI
├── style.css                # 全局毛玻璃/液态玻璃主题
├── framework.js             # 模块注册表 + 布局引擎 + 拖拽缩放
├── preload.js               # Node.js 系统能力
├── package.json
├── logo.png
└── modules/
    ├── module-base.js       # WidgetModule 基类
    ├── clock/               # 时钟模块
    ├── calendar/            # 日历模块
    ├── weather/             # 天气模块
    ├── todo/                # 待办事项模块
    └── quick-launch/        # 快捷启动模块
```

## 技术方案

- **窗口**：`utools.createBrowserWindow` 创建无边框、透明、置顶的独立悬浮窗
- **UI**：CSS `backdrop-filter: blur(60px) saturate(220%)` 毛玻璃 + 多层渐变叠加模拟液态玻璃
- **数据存储**：`utools.db`（支持跨设备云同步）
- **天气 API**：Open-Meteo（免费，无需 Key，自动 IP 定位）
- **模块系统**：基于注册表的可扩展架构，新增模块只需实现 `WidgetModule` 接口

---

## 添加新模块

1. 创建 `modules/<name>/` 目录，编写 `.js` + `.css`
2. 继承 `WidgetModule` 基类，实现 `render(container)` 和 `destroy()` 方法
3. 在 `widget.html` 中加载脚本并注册：
   ```js
   WidgetFramework.register(new YourModule());
   ```

---

## 调试

1. 在 uTools 开发者工具中，点击右上角设置 → 开启 **退出到后台立即结束运行**
2. 进入插件后，右键悬浮窗空白处 → 选择 **开发者工具**
3. 控制台可查看模块日志（`[Framework]`、`[Weather]`、`[DesktopWidget]` 等前缀）

---

## 打包离线安装包（UPXS）

1. 打开 uTools 开发者工具
2. 选中 `desktop-widget` 项目 → 点击 **打包**
3. 填写版本号 → 确认 → 选择保存路径
4. 生成 `.upxs` 文件，可直接分享安装

---

## 更新日志

### v1.0.0 — 2026-06-12
- 🎉 首次发布
- 5个核心模块：时钟、日历、天气、待办、快捷启动
- 毛玻璃/液态玻璃视觉风格
- 模块自由拖拽排列和缩放
- 支持深色/浅色主题自动切换
- 可扩展的模块注册表架构
