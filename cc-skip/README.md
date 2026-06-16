# Claude Code 快速启动器

一个 uTools 指令触发型插件，用于在 Windows CMD 窗口中快速启动 Claude Code 最高权限模式。

## 功能

触发插件后会打开新的 CMD 窗口，并执行：

```cmd
claude --dangerously-skip-permissions
```

随后插件自动退出，不长期占用 uTools 主窗口。

## 触发指令

| 指令 | 说明 |
| --- | --- |
| `claude最高权限` | 中文关键词 |
| `claude跳过权限` | 中文关键词 |
| `ClaudeSkip` | 英文关键词 |
| `cc-skip` | 短别名 |

## 目录结构

```text
cc-skip/
├── README.md
├── index.html
├── plugin.json
├── preload.js
├── logo.png
└── Claude Code 快速启动器.upx
```

## 关键文件

- `plugin.json`：定义插件入口、图标、preload 和触发指令。
- `index.html`：监听 `utools.onPluginEnter`，进入指定功能后调用 preload 方法。
- `preload.js`：使用 Node.js `child_process.exec` 打开 CMD 并执行 Claude Code 命令。
- `logo.png`：插件图标。

## 开发与调试

1. 打开 uTools 开发者工具。
2. 选择 `cc-skip/plugin.json` 接入开发。
3. 在 uTools 搜索框输入任一触发指令。
4. 确认 CMD 窗口正常打开并执行命令。

如果修改了 `preload.js`，建议在开发者工具中开启“退出到后台立即结束运行”，确保重新进入插件时加载最新代码。

## 注意事项

- 本插件依赖系统命令行中可直接访问 `claude` 命令。
- 如果用户环境变量中没有 Claude Code CLI，需要先配置 CLI 路径。
- 后续如支持用户自定义命令，必须避免将未校验输入直接拼接到 `exec` 命令中。

