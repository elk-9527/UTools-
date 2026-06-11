# UTools 插件合集

个人的 uTools 插件开发和维护仓库。每个插件一个独立文件夹。

## 插件列表

### cc-skip — Claude Code 快速启动器

在 CMD 窗口中快速启动 **Claude Code 最高权限模式**（`--dangerously-skip-permissions`）。

| 触发方式 | 说明 |
|---------|------|
| `claude最高权限` | 中文关键词 |
| `claude跳过权限` | 中文关键词 |
| `ClaudeSkip` | 英文关键词 |
| `cc-skip` | 快捷键 |

> **工作原理**：输入关键词后，插件自动打开一个新的 CMD 窗口并执行 `claude --dangerously-skip-permissions`，随即退出自身，不占用系统资源。

**文件结构**：
```
cc-skip/
├── index.html      # 插件入口，监听 uTools 事件
├── plugin.json     # 核心配置文件
├── preload.js      # Node.js 预加载脚本，执行 CMD 启动逻辑
└── logo.png        # 插件图标
```

## 使用方式

1. 将对应插件文件夹复制到 uTools 开发者目录
2. 在 uTools 中按 `Ctrl + Space` 调出面板
3. 输入关键词即可触发

## 开发环境

- **平台**：uTools
- **运行环境**：Node.js（preload）
- **兼容性**：Windows

## 更新日志

### [cc-skip] v1.0.0 — 2026-06-11
- 🎉 首次发布
- 支持 4 种关键词触发方式
- 自动打开 CMD 窗口执行 Claude Code 最高权限模式
