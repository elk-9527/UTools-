# Win11 桌面组件

一个用于 **uTools** 的 Win11 桌面悬浮窗插件，在桌面上显示 **天气、时钟、日历、待办事项、快捷启动**。

毛玻璃/液态玻璃视觉风格，每个模块独立窗口，支持**自由拖拽**和**自由缩放**。

---

## 快速开始

### 1. 前提条件

- 安装 [uTools](https://www.u.tools/download/)
- 安装 [uTools 开发者工具](https://www.u.tools/plugins/detail/uTools%20%E5%BC%80%E5%8F%91%E8%80%85%E5%B7%A5%E5%85%B7/)

### 2. 加载插件

1. 打开 uTools 开发者工具
2. 点击 **新建插件应用** → 选择 `desktop-widget` 目录
3. 点击 **接入开发**

### 3. 启动桌面组件

在 uTools 搜索框中输入以下任一关键词：

- `桌面组件` / `桌面小工具` / `DesktopWidget` / `Widget`

---

## 功能模块

| 模块 | 说明 | 数据来源 |
|------|------|---------|
| 🕐 **时钟** | 实时数字时钟，显示日期和星期 | 系统时间 |
| 📅 **日历** | 月历视图，可翻月，高亮今天，点击日期筛选待办 | 前端计算 |
| 🌤️ **天气** | 显示当前温度、湿度、风速、3天预报 | Open-Meteo 免费 API |
| ✅ **待办** | 增删改待办事项，支持日期关联 | uTools DB |
| 🚀 **快捷启动** | 应用(.exe)、文件夹、网址三种快捷方式 | uTools DB |

## 操作方式

| 操作 | 方式 |
|------|------|
| 移动模块 | 按住顶部标题栏拖拽 |
| 缩放模块 | 拖动右下角手柄 |
| 打开/关闭设置 | 右键任意位置 |
| 切换城市 | 点击天气模块的城市名 |
| 日历翻月 | 点击 ◀ ▶ 箭头 |
| 添加快捷方式 | 点击 ＋ 号图标 |
| 删除快捷方式 | 鼠标悬停项目，点击右上角 ✕ |

## 设置面板功能

右键任意位置弹出设置面板，支持：

- **主题颜色**：跟随系统 / 深色 / 浅色
- **底色遮罩**：黑底 / 白底
- **遮罩浓度**：5%~95% 滑块调节
- **窗口层级**：顶层 / 正常 / 底层（📌 按钮）

---

## 目录结构

```
desktop-widget/
├── plugin.json              # 插件核心配置
├── index.html               # 插件入口（创建5个独立悬浮窗）
├── widget.html              # 单模块窗口模板
├── style.css                # 全局毛玻璃/液态玻璃主题
├── preload.js               # Node.js 系统能力（启动应用/打开文件夹/网址）
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

- **窗口**：每个模块独立 `utools.createBrowserWindow`，无边框、透明、可拖拽
- **UI**：CSS `backdrop-filter: blur+saturate` 毛玻璃 + 径向渐变模拟液态玻璃深度
- **数据**：`utools.db`（支持跨设备云同步）
- **天气**：Open-Meteo 免费 API（无需 Key，IP 自动定位）
- **模块通信**：db 桥接文档轮询（`calendar-bridge` / `todo-bridge`）

## 添加新模块

1. 创建 `modules/<name>/` 目录，编写 `.js` + `.css`
2. 继承 `WidgetModule` 基类，实现 `render(container)` 和 `destroy()` 方法
3. 在 `widget.html` 中加载脚本并注册到 `MODULE_MAP`
4. 在 `index.html` 的 `MODULE_CONFIGS` 中添加窗口配置

## 调试

1. uTools 开发者工具 → 开启 **退出到后台立即结束运行**
2. 右键悬浮窗 → 选择 **开发者工具**
3. 控制台查看日志（`[DesktopWidget]`、`[Weather]` 等前缀）

## 打包

uTools 开发者工具 → 选中项目 → **打包** → 生成 `.upxs` 离线安装包
