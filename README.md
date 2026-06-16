# UTools 插件合集

个人 uTools 插件开发与维护仓库。仓库中每个插件作为独立项目维护，根目录只放项目总览、通用开发文档和参考资料。

## 项目列表

| 项目 | 目录 | 状态 | 说明 |
| --- | --- | --- | --- |
| Claude Code 快速启动器 | `cc-skip/` | 已完成 | 在 CMD 中快速启动 `claude --dangerously-skip-permissions` |
| Win11 桌面组件 | `Win11 桌面组件/desktop-widget/` | 开发中 | 天气、时钟、日历、待办、快捷启动等桌面悬浮组件 |

## 仓库结构

```text
UTools/
├── README.md
├── 参考文档.md
├── UTools插件开发文档.md
├── cc-skip/
│   ├── README.md
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

## 文档

- `UTools插件开发文档.md`：项目根目录下的完整 uTools 插件开发文档，包含官方参考、配置说明、preload、生命周期、多窗口、数据存储、调试、打包发布和本仓库实践。
- `参考文档.md`：官方开发参考链接集合。
- `cc-skip/README.md`：Claude Code 快速启动器的独立项目说明。
- `Win11 桌面组件/README.md`：Win11 桌面组件的独立项目说明。

## 通用开发流程

1. 安装 uTools 与 uTools 开发者工具。
2. 打开 uTools 开发者工具。
3. 选择某个插件项目目录下的 `plugin.json` 接入开发。
4. 在 uTools 搜索框输入对应指令触发插件。
5. 修改代码后重新进入插件验证；涉及 `preload.js` 时建议开启“退出到后台立即结束运行”。
6. 确认无误后使用 uTools 开发者工具打包为 `.upxs`。

## 插件入口

### Claude Code 快速启动器

目录：`cc-skip/`

触发指令：

- `claude最高权限`
- `claude跳过权限`
- `ClaudeSkip`
- `cc-skip`

工作方式：触发后打开新的 CMD 窗口并执行 `claude --dangerously-skip-permissions`，随后退出插件。

### Win11 桌面组件

目录：`Win11 桌面组件/desktop-widget/`

触发指令：

- `桌面组件`
- `桌面小工具`
- `DesktopWidget`
- `Widget`

工作方式：触发后隐藏 uTools 主窗口，并创建多个独立透明桌面悬浮窗。

## 开发环境

- 平台：uTools
- 前端：HTML / CSS / JavaScript
- 本地能力：`preload.js` + Node.js / Electron / uTools API
- 主要兼容平台：Windows

