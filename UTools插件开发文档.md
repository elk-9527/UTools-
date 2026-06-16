# UTools 插件开发文档

本文档基于本仓库现有代码、`参考文档.md` 中列出的官方开发文档，以及本项目实际用到的 uTools API 整理。它既可作为新插件开发指南，也可作为维护 `cc-skip` 与 `Win11 桌面组件` 的项目内参考。

阅读日期：2026-06-16

## 1. 项目现状

本仓库是一个个人 uTools 插件合集，每个插件使用一个独立目录维护。

```text
UTools/
├── README.md
├── 参考文档.md
├── UTools插件开发文档.md
├── cc-skip/
│   ├── index.html
│   ├── plugin.json
│   ├── preload.js
│   ├── logo.png
│   └── Claude Code 快速启动器.upx
└── Win11 桌面组件/
    ├── README.md
    └── desktop-widget/
        ├── plugin.json
        ├── index.html
        ├── widget.html
        ├── style.css
        ├── preload.js
        ├── logo.png
        └── modules/
```

当前有两个插件方向：

| 插件 | 目录 | 类型 | 核心能力 |
| --- | --- | --- | --- |
| Claude Code 快速启动器 | `cc-skip/` | 指令触发型工具 | 通过 uTools 指令打开 CMD，并执行 `claude --dangerously-skip-permissions` |
| Win11 桌面组件 | `Win11 桌面组件/desktop-widget/` | 多窗口桌面工具 | 创建天气、时钟、日历、待办、快捷启动等透明悬浮窗 |

这两个插件都采用“静态 HTML + 原生 JavaScript + `preload.js`”的轻量结构，没有前端构建步骤。

## 2. uTools 插件应用模型

uTools 插件应用本质上是：

- Web 前端页面：负责界面、交互、状态展示。
- uTools 全局 API：通过 `window.utools` 提供插件生命周期、窗口、数据库、系统等能力。
- `preload.js`：运行在预加载环境，可使用 Node.js 原生模块和 Electron 渲染进程 API，用来桥接本地系统能力。

因此，一个 uTools 插件既像普通网页，又能做普通网页做不到的本地操作，例如启动程序、打开文件夹、读写本地数据、创建独立窗口、调用系统通知等。

开发前需要准备：

- 安装 uTools。
- 安装 uTools 开发者工具。
- 准备代码编辑器。
- 熟悉 HTML、CSS、JavaScript。
- 如需本地系统能力，理解 Node.js CommonJS 模块写法。

## 3. 插件目录结构

uTools 通过 `plugin.json` 识别一个插件应用。官方要求插件至少包含 `plugin.json`，并配置 `logo` 以及 `main` 或 `preload`。

推荐的普通插件目录：

```text
my-plugin/
├── plugin.json
├── preload.js
├── index.html
├── index.js
├── index.css
└── logo.png
```

本仓库的 `cc-skip` 是最小可运行结构：

```text
cc-skip/
├── plugin.json
├── preload.js
├── index.html
└── logo.png
```

`desktop-widget` 使用一个主入口创建多个子窗口：

```text
desktop-widget/
├── plugin.json
├── index.html          # 主入口：监听指令并创建多个 BrowserWindow
├── widget.html         # 子窗口模板：按 query 参数加载模块
├── style.css           # 通用主题
├── preload.js          # 启动应用、打开文件夹、打开 URL
└── modules/
    ├── module-base.js
    ├── clock/
    ├── calendar/
    ├── weather/
    ├── todo/
    └── quick-launch/
```

如果以后使用 Vue、React、Svelte、Vite、Webpack 等框架，开发源码不能直接作为插件包发布。应先构建成普通 HTML、CSS、JS，再打包输出目录，例如 `dist/`。不要把整个工程根目录连同源码、缓存、开发依赖一起打包为插件。

## 4. `plugin.json` 核心配置

`plugin.json` 是插件的核心配置文件，定义入口页面、图标、预加载脚本、功能指令和匹配规则。路径字段均相对于 `plugin.json` 所在目录。

基础示例：

```json
{
  "main": "index.html",
  "logo": "logo.png",
  "preload": "preload.js",
  "features": [
    {
      "code": "hello",
      "explain": "hello world",
      "cmds": ["hello", "你好"]
    }
  ]
}
```

### 4.1 顶层字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `main` | string | 通常必填 | 插件主入口 HTML，相对路径，必须是 `.html` 文件 |
| `logo` | string | 必填 | 插件 Logo，相对路径 |
| `preload` | string | 可选 | 预加载脚本，相对路径，通常用于暴露 Node.js / Electron 能力 |
| `pluginSetting` | object | 可选 | 插件默认行为配置 |
| `features` | array | UI 插件必填 | 指令和匹配能力集合 |
| `tools` | object | 可选 | 将插件能力暴露给 AI Agent 调用 |

### 4.2 `pluginSetting`

常用配置：

```json
{
  "pluginSetting": {
    "single": true,
    "height": 544
  }
}
```

- `single`：是否单例运行，默认 `true`。大部分插件保持默认即可。
- `height`：主窗口初始高度，可配合 `utools.setExpendHeight` 动态调整。

本仓库 `desktop-widget` 配置了：

```json
{
  "pluginSetting": {
    "single": true
  }
}
```

这是合理的，因为桌面组件需要管理一组固定的悬浮窗，不应重复启动多个互相竞争的主实例。

### 4.3 `features`

`features` 定义插件能被怎样唤起。一个插件可以有多个功能，每个功能有唯一 `code`。

```json
{
  "features": [
    {
      "code": "desktop-widget",
      "explain": "Win11桌面组件",
      "cmds": ["桌面组件", "桌面小工具", "DesktopWidget", "Widget"],
      "mainHide": true
    }
  ]
}
```

常用字段：

| 字段 | 说明 |
| --- | --- |
| `code` | 功能编码，必须唯一。`onPluginEnter` 中通过它区分功能 |
| `explain` | 功能说明 |
| `cmds` | 指令集合，可以是字符串或匹配指令对象 |
| `icon` | 功能图标，可覆盖插件默认图标 |
| `mainPush` | 是否向搜索框推送内容 |
| `mainHide` | 触发后是否不主动显示主搜索框 |

`mainHide: true` 适用于“触发后直接执行”的插件，例如：

- `cc-skip`：启动 CMD 后退出插件。
- `desktop-widget`：创建独立桌面窗口后隐藏主面板。

### 4.4 功能指令

功能指令是 `cmds` 中的字符串。用户在 uTools 搜索框直接输入这些词即可启动功能。

```json
{
  "code": "claude-skip-permissions",
  "cmds": ["claude最高权限", "claude跳过权限", "ClaudeSkip", "cc-skip"]
}
```

建议：

- 中文指令尽量短、明确、唯一。
- 中文指令不需要额外配置拼音或首字母，uTools 会自动支持。
- 英文指令建议同时提供短别名。
- 同一仓库内避免多个插件使用过于相似的指令。

### 4.5 匹配指令

匹配指令用于根据用户输入、粘贴内容、文件、图片或当前窗口匹配功能。常见类型：

| 类型 | 作用 |
| --- | --- |
| `regex` | 用正则匹配特定文本，如 URL、手机号、公式 |
| `over` | 匹配任意文本，可设置排除规则和长度 |
| `img` | 匹配图片内容 |
| `files` | 匹配文件或文件夹，可限制扩展名、数量、文件类型 |
| `window` | 匹配当前活动系统窗口 |

文件匹配示例：

```json
{
  "type": "files",
  "label": "图片批量处理",
  "fileType": "file",
  "extensions": ["png", "jpg", "jpeg", "webp"],
  "minLength": 1,
  "maxLength": 100
}
```

正则匹配注意点：

- JSON 字符串中的反斜杠需要转义，例如 `\\d`。
- 不要使用“匹配任意内容”的正则，例如 `/.*/`，这类规则会被忽略或造成干扰。
- 设置合理的 `minLength` 和 `maxLength`，减少误触发。

### 4.6 AI Agent 工具配置

uTools 支持通过 `tools` 将插件能力暴露为 AI Agent 可调用工具。配置后必须在运行时代码中调用 `utools.registerTool` 注册同名工具，否则 Agent 无法调用。

最小无 UI Agent 插件可以只配置：

```json
{
  "logo": "logo.png",
  "preload": "preload.js",
  "tools": {
    "say_hi": {
      "description": "向用户打招呼",
      "inputSchema": {
        "type": "object",
        "additionalProperties": false
      }
    }
  }
}
```

工具名称建议使用小写 `snake_case`。注册时机应在页面初始化阶段，例如 `preload.js` 或与 `onPluginEnter` 同级作用域，不要写在 `onPluginEnter` 内部。

## 5. `preload.js` 开发

`preload.js` 在窗口加载前执行，适合放本地系统能力、Node.js 能力、Electron 渲染进程能力。它是前端页面和本地环境之间的桥。

官方约束：

- `preload.js` 使用 CommonJS，使用 `require` 引入模块。
- 可使用 Node.js 原生模块、自己写的模块和第三方模块。
- `preload.js` 不应打包、压缩或混淆，提交时需要保持源码清晰可读。
- 第三方 Node.js 模块也应保持源码清晰可读。
- Node.js 第三方依赖应放在 `preload.js` 同级目录结构中，不要被前端构建工具打包掉。

典型写法是在 `window` 上挂载服务对象：

```js
const { exec } = require('child_process');

window.localServices = {
  runCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        else resolve({ stdout, stderr });
      });
    });
  }
};
```

前端可直接调用：

```js
await window.localServices.runCommand('echo hello');
```

### 5.1 本仓库 `cc-skip` 的 preload

`cc-skip/preload.js` 暴露了：

```js
window.openClaudeWithSkipPermissions = function () {
  const command = 'start "Claude Code" cmd.exe /k "claude --dangerously-skip-permissions"';
  exec(command, ...);
};
```

这个插件是典型“指令触发 + 本地命令执行”模式：

1. `plugin.json` 定义指令。
2. `index.html` 监听 `utools.onPluginEnter`。
3. 进入指定 `code` 后调用 preload 暴露的方法。
4. 等待很短时间后 `utools.outPlugin()` 退出。

### 5.2 本仓库 `desktop-widget` 的 preload

`desktop-widget/preload.js` 暴露了 `window.widgetServices`：

| 方法 | 用途 | 优先方案 | 回退方案 |
| --- | --- | --- | --- |
| `launchApp(exePath)` | 启动应用 | `utools.shellOpenPath` | `child_process.exec` |
| `openFolder(folderPath)` | 打开文件夹 | `utools.shellOpenPath` | `explorer` |
| `openUrl(url)` | 打开网址 | `utools.shellOpenExternal` | Electron `shell.openExternal` |

这类封装是推荐做法：前端模块只关心“启动快捷方式”，不直接拼接系统命令；系统能力集中在 preload 中，便于审计和替换。

### 5.3 命令执行安全

只要用到 `child_process.exec`，都要格外谨慎：

- 不要把未校验的用户输入直接拼进命令。
- Windows 路径要处理引号，避免空格导致命令错误。
- 尽量优先使用 `utools.shellOpenPath`、`utools.shellOpenExternal` 或 Electron API。
- 对 URL 做协议限制，只允许 `http:`、`https:` 或明确需要的协议。
- 对可执行文件路径限制扩展名，例如 `.exe`、`.lnk`。
- 捕获错误并记录日志，必要时用 `utools.showNotification` 提示用户。

## 6. 生命周期与入口页面

uTools 插件主要通过事件进入业务逻辑。

### 6.1 `utools.onPluginEnter`

当用户通过指令或匹配规则进入插件时触发：

```js
utools.onPluginEnter(({ code, type, payload }) => {
  if (code === 'desktop-widget') {
    // 执行业务
  }
});
```

参数含义：

| 参数 | 说明 |
| --- | --- |
| `code` | 当前匹配到的 `feature.code` |
| `type` | 进入类型，例如功能指令、文件、图片、文本等 |
| `payload` | 匹配载荷，可能是文本、文件数组、图片 Data URL 等 |

如果插件只有一个功能，也建议检查 `code`。这能避免以后添加新功能时产生误触发。

### 6.2 `utools.onPluginOut`

当插件隐藏到后台或完全退出时触发：

```js
utools.onPluginOut((isKill) => {
  if (isKill) {
    // 清理窗口、定时器、资源
  }
});
```

`desktop-widget` 在 `isKill` 为真时关闭所有子窗口，这是多窗口插件必须处理的清理逻辑。

### 6.3 `utools.hideMainWindow` 与 `utools.outPlugin`

常用区别：

- `utools.hideMainWindow()`：隐藏 uTools 主窗口，插件进程仍可继续运行。适用于桌面悬浮窗、后台任务、独立窗口。
- `utools.outPlugin()`：退出当前插件。适用于执行完即结束的工具。

本仓库中：

- `cc-skip` 启动 CMD 后调用 `outPlugin()`。
- `desktop-widget` 创建悬浮窗后调用 `hideMainWindow()`，保留子窗口。

## 7. 窗口开发

uTools 插件默认运行在主窗口中。需要独立窗口时，可使用 `utools.createBrowserWindow`。

```js
const win = utools.createBrowserWindow(
  'widget.html?module=clock',
  {
    show: false,
    width: 260,
    height: 160,
    frame: false,
    transparent: true,
    skipTaskbar: true,
    webPreferences: {
      preload: 'preload.js'
    }
  },
  () => {
    win.showInactive();
  }
);
```

注意：

- URL 是相对路径 HTML。
- `webPreferences.preload` 也是相对路径。
- 返回的窗口大部分能力继承 Electron `BrowserWindow`。
- uTools 官方说明中提到，该窗口不包含 BrowserWindow 和 webContents 的实例事件，因此不要依赖这些事件做核心逻辑。

### 7.1 桌面组件窗口策略

`desktop-widget/index.html` 为每个模块创建一个独立窗口：

| 模块 | 默认尺寸 | 默认位置 |
| --- | --- | --- |
| clock | 260 x 160 | 40, 60 |
| calendar | 280 x 320 | 320, 60 |
| weather | 280 x 240 | 620, 60 |
| todo | 280 x 340 | 40, 260 |
| quick-launch | 320 x 240 | 340, 410 |

窗口关键配置：

- `frame: false`：无系统边框。
- `transparent: true`：透明窗口。
- `skipTaskbar: true`：不出现在任务栏。
- `resizable: true`：允许 JS 调整窗口大小。
- `hasShadow: false`、`backgroundColor: '#00000000'`：配合透明毛玻璃视觉。
- `showInactive()` 与 `setFocusable(false)`：显示但尽量不抢焦点。

窗口布局通过 `utools.db` 持久化：

```js
{
  _id: 'widget-layout',
  modules: {
    clock: { x, y, w, h },
    calendar: { x, y, w, h }
  }
}
```

### 7.2 父子窗口通信

官方支持子窗口通过 `utools.sendToParent(channel, ...args)` 向父窗口发送消息。父窗口可以配合 Electron `ipcRenderer` 监听消息。

本项目中，子窗口点击层级按钮后：

```js
utools.sendToParent('zorder-change', val);
```

父入口窗口收到后对所有模块窗口统一设置：

- `top`：`setAlwaysOnTop(true, 'screen-saver')`
- `normal`：取消置顶并 `moveTop()`
- `bottom`：取消置顶并尝试 `moveBottom()`

## 8. 数据存储

uTools 提供本地 NoSQL 数据库 `utools.db`，可用于轻量持久化。如果用户开启数据同步，数据可同步到 uTools 云端并在多设备间同步。

常用 API：

| API | 用途 |
| --- | --- |
| `utools.db.put(doc)` | 创建或更新文档 |
| `utools.db.get(id)` | 按 `_id` 获取文档，不存在返回 `null` |
| `utools.db.remove(docOrId)` | 删除文档 |
| `utools.db.allDocs(prefixOrIds)` | 获取所有文档、按 ID 前缀筛选，或按 ID 数组查询 |
| `utools.db.promises.*` | 上述 API 的异步版本 |

文档格式：

```js
{
  _id: 'todo-xxx',
  _rev: '...',
  text: '示例待办',
  done: false
}
```

重要规则：

- `_id` 是文档 ID。
- 更新已有文档时必须带上 `_rev`，否则更新会失败。
- 单个文档内容不超过 1MB。
- 多设备同时编辑同一个文档可能冲突，应尽量把数据拆分为多个小文档，而不是全部塞进一个大文档。

### 8.1 本项目数据模型

`desktop-widget` 使用以下文档：

| `_id` / 前缀 | 用途 |
| --- | --- |
| `widget-settings` | 主题、遮罩、透明度、窗口层级 |
| `widget-layout` | 各模块窗口位置与尺寸 |
| `weather-city` | 天气城市和经纬度 |
| `weather-cache` | 天气离线缓存 |
| `todo-*` | 每条待办事项 |
| `todo-bridge` | 待办变化通知日历模块 |
| `calendar-bridge` | 日历选中日期通知待办模块 |
| `ql-*` | 快捷启动项 |

这种设计有两个优点：

- 待办和快捷方式使用多文档，避免一个文档过大，也降低同步冲突概率。
- 设置和布局使用固定文档，读取路径明确。

### 8.2 更新固定文档的推荐写法

```js
function updateWidgetSettings(patch) {
  const existing = utools.db.get('widget-settings') || {};
  const doc = {
    _id: 'widget-settings',
    theme: existing.theme || 'auto',
    tint: existing.tint || 'black',
    zOrder: existing.zOrder || 'bottom',
    ...patch
  };
  if (existing._rev) doc._rev = existing._rev;
  return utools.db.put(doc);
}
```

关键点：先 `get`，再带 `_rev` `put`。

### 8.3 跨窗口数据桥接

`desktop-widget` 既用了 `sendToParent`，也用了数据库桥接。

数据库桥接示例：

- 日历点击日期时写入 `calendar-bridge`。
- 待办模块每 600ms 读取 `calendar-bridge`，发现 `_ts` 变化后更新筛选日期。
- 待办增删改后写入 `todo-bridge`。
- 日历模块轮询 `todo-bridge`，发现变化后重新标记有待办的日期。

这种方式简单稳定，但不是实时事件驱动。适合本项目这种轻量桌面组件。若后续模块增多，可考虑统一封装桥接层，减少散落的轮询逻辑。

## 9. 系统能力

本项目主要用到以下系统 API。

### 9.1 通知

```js
utools.showNotification('桌面组件启动失败');
```

适用于启动失败、保存完成、异常提示。通知可以关联 `feature.code`，用户点击后进入对应功能。

### 9.2 打开文件或文件夹

```js
utools.shellOpenPath('C:\\Users\\Public\\Desktop\\test.txt');
```

用于快捷启动应用、文件夹、文档。优先使用该 API，而不是自己拼 `start` 或 `explorer` 命令。

### 9.3 打开 URL

```js
utools.shellOpenExternal('https://www.u-tools.cn');
```

适用于网址快捷方式。写快捷启动时应校验协议，避免把危险协议直接交给系统执行。

### 9.4 文件选择框

`quick-launch` 添加应用或文件夹时使用：

```js
const picked = await utools.showOpenDialog({
  filters: [{ name: '可执行文件', extensions: ['exe', 'lnk'] }],
  properties: ['openFile']
});
```

注意处理取消选择的情况：返回值可能为空。

## 10. 屏幕与位置

`desktop-widget` 使用 `utools.getPrimaryDisplay()` 获取主显示器工作区，避免默认窗口位置超出屏幕：

```js
const display = utools.getPrimaryDisplay();
const workArea = display.workAreaSize;
```

开发多窗口插件时建议：

- 读取主显示器或鼠标所在显示器。
- 根据工作区尺寸修正默认坐标。
- 保存用户调整后的位置和尺寸。
- 尺寸设置最小值和最大值，避免窗口过小无法操作。

## 11. 前端界面与模块组织

uTools 插件界面就是 Web 页面，因此可以用原生 HTML/CSS/JS，也可以用 Vue、React 等框架。

本项目 `desktop-widget` 使用原生类组织模块：

```js
class WidgetModule {
  render(container) {
    this.container = container;
  }

  destroy() {
    this._destroyed = true;
    this.container = null;
  }
}
```

每个模块继承 `WidgetModule`：

- `ClockModule`：每秒刷新时间，销毁时清理定时器。
- `CalendarModule`：渲染月历，读取 `todo-*` 标记待办日期。
- `WeatherModule`：调用 Open-Meteo，缓存 30 分钟，失败时显示离线缓存。
- `TodoModule`：增删改待办，使用 `todo-*` 文档。
- `QuickLaunchModule`：管理应用、文件夹、网址快捷方式，调用 preload 的 `widgetServices`。

### 11.1 添加新模块

在 `desktop-widget` 中添加新模块的步骤：

1. 创建 `modules/<name>/` 目录。
2. 新增 `<name>.js` 和 `<name>.css`。
3. 在 JS 中继承 `WidgetModule`，实现 `render(container)`。
4. 如使用定时器、事件监听、网络轮询，必须在 `destroy()` 中清理。
5. 在 `widget.html` 中引入 CSS 和 JS。
6. 在 `widget.html` 的 `MODULE_MAP` 中注册模块类、图标和名称。
7. 在 `index.html` 的 `MODULE_CONFIGS` 中添加默认窗口配置。
8. 如果需要持久化，设计独立的 `_id` 前缀。

### 11.2 前端安全

只要把用户输入写入 `innerHTML`，就必须转义。项目中 `TodoModule` 和 `QuickLaunchModule` 已使用 `_escapeHtml` / `esc` 处理文本，这是正确方向。

建议：

- 用户输入优先用 `textContent` 渲染。
- 必须拼 HTML 时统一调用转义函数。
- URL、文件路径、命令参数分别校验。
- 弹窗和临时 DOM 关闭时移除事件监听或整个节点。

## 12. 调试流程

官方推荐的调试方式：

1. 在 uTools 开发者工具中接入项目。
2. 开启“退出到后台立即结束运行”，确保每次进入都加载最新代码。
3. 进入插件后，通过右上角 Logo 菜单打开开发者工具，或按 `Ctrl + Shift + I`。
4. 在 Console 中查看日志。

本项目建议日志前缀：

- `[DesktopWidget]`：主入口、多窗口、层级管理。
- `[Weather]`：天气请求、缓存、定位。
- `[QuickLaunch]`：快捷方式读取、启动失败。

### 12.1 热更新

开发模式下，`plugin.json` 的 `main` 可以通过 `development.main` 指向本地 dev server：

```json
{
  "development": {
    "main": "http://127.0.0.1:5173/index.html"
  }
}
```

适用于 Vite、Webpack 等前端项目。注意：`preload.js` 变更不能自动热更新，仍需重启插件进程；因此建议开启“退出到后台立即结束运行”。

本仓库目前是纯静态结构，无需 dev server。修改后重新进入插件即可验证。

## 13. 打包与发布

### 13.1 离线安装包

uTools 开发者工具可将插件打包为 `.upxs` 离线安装包。离线包适合测试、自己使用或内部分享，不需要上架审核，但安装时用户会看到安全提示。

流程：

1. 选择插件项目。
2. 点击“打包”。
3. 填写版本号。
4. 选择保存路径，生成 `.upxs`。

版本号遵循 SemVer 思路，例如：

- `1.0.0`：首次稳定版。
- `1.0.1`：修复 bug。
- `1.1.0`：新增兼容功能。
- `2.0.0`：不兼容变更。

### 13.2 发布到应用市场

发布前准备：

- 发布插件信息。
- 发布版本信息。
- 插件应用截图。
- 检查 `plugin.json`。
- 检查 `preload.js` 是否清晰可读、未压缩混淆。
- 提供完整用户手册。
- 确认功能定位简洁清楚。

发布流程：

1. 在 uTools 开发者工具中点击“发布”。
2. 确认版本号和发布目录。
3. 填写版本说明、应用介绍、截图。
4. 提交审核。
5. 在“发布历史”中查看审核结果。

## 14. 新插件开发流程

建议按以下顺序开发：

1. 明确插件类型：执行型、界面型、匹配型、多窗口型、Agent 工具型。
2. 创建独立目录，不与现有插件混放。
3. 准备 `logo.png`、`plugin.json`、`index.html`。
4. 先配置一个最小 `features` 指令，确保能被 uTools 唤起。
5. 在 `index.html` 中写 `utools.onPluginEnter`。
6. 如果需要系统能力，再增加 `preload.js`。
7. 如果需要持久化，先设计数据 `_id` 命名。
8. 接入 uTools 开发者工具测试。
9. 增加错误处理和日志。
10. 编写 README 和用户使用说明。
11. 打包 `.upxs` 测试。
12. 准备发布材料。

最小插件模板：

```json
{
  "main": "index.html",
  "logo": "logo.png",
  "preload": "preload.js",
  "features": [
    {
      "code": "my-feature",
      "explain": "我的功能",
      "cmds": ["我的插件"]
    }
  ]
}
```

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的插件</title>
</head>
<body>
  <script>
    utools.onPluginEnter(({ code, type, payload }) => {
      if (code !== 'my-feature') return;
      console.log('进入插件', { code, type, payload });
    });
  </script>
</body>
</html>
```

## 15. 维护现有插件的注意事项

### 15.1 `cc-skip`

当前设计很轻，重点关注：

- `plugin.json` 的 `cmds` 是否和其他插件冲突。
- 用户机器上是否能直接执行 `claude` 命令。
- Windows CMD 命令是否需要补充环境变量路径。
- 启动失败时是否需要用 `utools.showNotification` 提示。
- 如果以后允许用户自定义命令，必须避免命令注入。

可改进方向：

- 检查 `claude` 是否存在。
- 失败时显示通知。
- 支持 PowerShell / Windows Terminal 作为可选启动方式。
- 将命令配置存入 `utools.db`。

### 15.2 `desktop-widget`

当前设计复杂度主要在多窗口和持久化。

重点关注：

- 子窗口创建失败时要记录具体模块。
- 轮询间隔不要过短，避免无意义 CPU 消耗。
- 每个模块的 `destroy()` 必须清理定时器。
- `utools.db.put` 更新固定文档时必须带 `_rev`。
- 网络请求要有缓存和失败降级。
- 用户输入渲染要转义。
- 快捷启动 URL 应校验协议。
- 路径和 URL 操作优先走 uTools/Electron API。

可改进方向：

- 封装 `dbPutWithRev(id, patch)`。
- 封装跨窗口桥接，替代散落的轮询逻辑。
- 为快捷方式增加排序拖拽。
- 为天气城市增加搜索结果选择，而不是只取第一个。
- 为设置增加“重置布局”。

## 16. 开发检查清单

开发完成前逐项检查：

- `plugin.json` 是合法 JSON。
- `main`、`logo`、`preload` 路径均相对于 `plugin.json`。
- 每个 `feature.code` 唯一。
- 指令名称简短、明确、不冲突。
- `mainHide` 只用于触发即执行或独立窗口场景。
- `onPluginEnter` 检查了 `code`。
- 需要退出的插件调用 `utools.outPlugin()`。
- 后台或独立窗口插件正确调用 `utools.hideMainWindow()`。
- `onPluginOut` 中清理窗口、定时器、监听器。
- `preload.js` 未压缩、未混淆。
- 第三方 Node.js 依赖与 `preload.js` 目录结构一致。
- 数据库更新已有文档时带 `_rev`。
- 文档 `_id` 命名有前缀，便于 `allDocs(prefix)` 查询。
- 用户输入写入 HTML 前已转义。
- 命令、路径、URL 都做了必要校验。
- 网络失败有降级或提示。
- 开发者工具中测试过首次启动、重复启动、退出、重启。
- 打包前删除无关开发产物。
- 发布前准备截图、版本说明和用户手册。

## 17. 官方参考链接

`参考文档.md` 中已列出的基础文档：

- [快速开始](https://www.u-tools.cn/docs/developer/basic/getting-started.html)
- [第一个插件应用](https://www.u-tools.cn/docs/developer/basic/first-plugin.html)
- [调试插件应用](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html)
- [打包为离线安装包](https://www.u-tools.cn/docs/developer/basic/offline-plugin.html)
- [发布到应用市场](https://www.u-tools.cn/docs/developer/basic/publish-plugin.html)
- [插件应用目录结构](https://www.u-tools.cn/docs/developer/information/file-structure.html)
- [plugin.json 核心配置文件说明](https://www.u-tools.cn/docs/developer/information/plugin-json.html)
- [认识 preload](https://www.u-tools.cn/docs/developer/information/preload.html)

本项目实际用到并补充阅读的 API 文档：

- [窗口 API](https://www.u-tools.cn/docs/developer/api-reference/utools/window.html)
- [本地数据库 API](https://www.u-tools.cn/docs/developer/api-reference/db/local-db.html)
- [系统 API](https://www.u-tools.cn/docs/developer/utools-api/system.html)
- [屏幕 API](https://www.u-tools.cn/docs/developer/api-reference/utools/screen.html)

