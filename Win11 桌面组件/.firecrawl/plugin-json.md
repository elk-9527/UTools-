[Skip to content](https://www.u-tools.cn/docs/developer/information/plugin-json.html#VPContent)

On this page

# plugin.json 核心配置文件说明 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#plugin-json-%E6%A0%B8%E5%BF%83%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E8%AF%B4%E6%98%8E)

`plugin.json` 是插件应用的核心配置文件，用于定义插件的运行入口、功能指令、匹配指令，以及插件应用与 uTools 的集成方式。每个插件应用都必须包含一个 `plugin.json` 文件。

## 配置文件格式 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)

plugin.json 文件是一个标准的 JSON 文件，它的结构如下：

json

```
{
  "main": "index.html",
  "logo": "logo.png",
  "preload": "preload.js",
  "features": [\
    {\
      "code": "hello",\
      "explain": "hello world",\
      "cmds": ["hello", "你好"]\
    }\
  ]
}
```

## 基础字段说明 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E5%9F%BA%E7%A1%80%E5%AD%97%E6%AE%B5%E8%AF%B4%E6%98%8E)

### `main` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#main)

> 类型：`string`
>
> 必填：是

必须指定为相对于 `plugin.json` 的 **相对路径**，且文件类型必须为 `.html`

### `logo` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#logo)

> 类型：`string`
>
> 必填：是

插件应用 Logo 文件，必须指定为相对于 `plugin.json` 的 **相对路径**

### `preload` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#preload)

> 类型：`string`
>
> 必填：否

指定一个将在窗口加载前执行的预加载脚本（.js 文件）。该脚本运行在独立的预加载环境，可使用 **Node.js 原生能力** 与 **Electron 渲染进程 API**。

## 插件应用设置字段说明 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E6%8F%92%E4%BB%B6%E5%BA%94%E7%94%A8%E8%AE%BE%E7%BD%AE%E5%AD%97%E6%AE%B5%E8%AF%B4%E6%98%8E)

### `pluginSetting` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#pluginsetting)

> 类型：`object`
>
> 必填：否

插件应用设置，可以配置一些插件应用在基座中的默认行为或者样式。

### `pluginSetting.single` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#pluginsetting-single)

> 类型：`boolean`
>
> 必填：否
>
> 默认值：`true`

用于控制插件应用是否以单例模式运行。默认为 `true` 。（若无特殊需求，可不配置该字段）

### `pluginSetting.height` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#pluginsetting-height)

> 类型：`number`
>
> 必填：否
>
> 默认值：`544`

配置插件应用初始高度，可以通过 api `utools.setExpendHeight` 动态修改。（若无特殊需求，可不配置该字段）

## 插件应用功能字段说明 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E6%8F%92%E4%BB%B6%E5%BA%94%E7%94%A8%E5%8A%9F%E8%83%BD%E5%AD%97%E6%AE%B5%E8%AF%B4%E6%98%8E)

### `features` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#features)

> 类型：`Array<object>`
>
> 必填：是
>
> 最小长度：`1`

features 定义插件应用的指令集合，一个插件应用可定义多个功能，一个功能可配置多条指令。

features 的每个元素都是一个 feature 对象，对象中包含以下字段：

### `feature.code` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#feature-code)

> 类型：`string`
>
> 必填：是

功能编码，且必须唯一。用户进入插件应用时，uTools 会将该编码传入应用，用于区分不同功能并执行对应的逻辑。

### `feature.explain` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#feature-explain)

> 类型：`string`
>
> 必填：否

功能描述

### `feature.icon` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#feature-icon)

> 类型：`string`
>
> 必填：否

功能图标文件，支持 `.png`、`.jpg`、`.svg` 格式。指定为相对于 `plugin.json` 的 **相对路径**。（可选配置）

### `feature.mainPush` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#feature-mainpush)

> 类型：`boolean`
>
> 必填：否

是否向搜索框推送内容。（若无特殊需求，可不配置该字段）

### `feature.mainHide` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#feature-mainhide)

> 类型：`boolean`
>
> 必填：否

当配置为 `true` 时，触发该功能的指令将不会主动显示主搜索框。适用于需要直接执行功能的场景，例如：指令触发后立即创建独立窗口，或直接将输入/粘贴文本发送到系统窗口等。（若无特殊需求，可不配置该字段）

### `feature.cmds` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#feature-cmds)

> 类型：`Array<string|object>`
>
> 必填：是
>
> 最小长度：`1`

配置该功能的指令集合，指令分「功能指令」和「匹配指令」

## 功能指令 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E5%8A%9F%E8%83%BD%E6%8C%87%E4%BB%A4)

功能指令用于在 uTools 搜索框直接搜索并打开插件应用功能。

**要求**:

- 功能指令名称必须 **简短、明确、唯一**；禁止无意义、重复或模糊名称。
- 中文指令无需额外配置拼音或首字母，uTools 会自动支持拼音和首字母搜索。

示例：

plugin.json

json

```
{
  "features": [\
    {\
      "code": "foo",\
      "cmds": ["测试"]\
    }\
  ]
}
```

## 匹配指令 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E5%8C%B9%E9%85%8D%E6%8C%87%E4%BB%A4)

在 uTools 搜索框输入特定文本或粘贴图片、文件（或文件夹）时，匹配出可处理该内容的指令。

### `regex` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#regex)

正则匹配特定文本

plugin.json

json

```
{
  "features": [\
    {\
      "code": "regex",\
      "cmds": [\
        {\
          // 类型标记（必须）\
          "type": "regex",\
          // 指令名称（必须）\
          "label": "打开网址",\
          // 正则表达式字符串\
          // 注意: 正则表达式存如果在斜杠 "\" 需要多加一个，"\\"\
          // 注意：“任意匹配的正则” 会被 uTools 忽视，例如：/.*/ 、/(.)+/、/[\s\S]*/ ...\
          "match": "/^https?:\\/\\/[^\\s/$.?#]\\S+$|^[a-z0-9][-a-z0-9]{0,62}(\\.[a-z0-9][-a-z0-9]{0,62}){1,10}(:[0-9]{1,5})?$/i",\
          // 最少字符数 (可选)\
          "minLength": 1,\
          // 最多字符数 (可选)\
          "maxLength": 1000\
        }\
      ]\
    }\
  ]
}
```

### `over` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#over)

匹配任意文本

plugin.json

json

```
{
  "features": [\
    {\
      "code": "over",\
      "cmds": [\
        {\
          // 类型标记（必须）\
          "type": "over",\
          // 指令名称（必须）\
          "label": "百度一下",\
          // 排除的正则表达式字符串 (任意文本中排除的部分) (可选)\
          "exclude": "/\\n/",\
          // 最少字符数 (可选)\
          "minLength": 1,\
          // 最多字符数 (默认最多为 10000) (可选)\
          "maxLength": 500\
        }\
      ]\
    }\
  ]
}
```

### `img` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#img)

匹配图像

plugin.json

json

```
{
  "features": [\
    {\
      "code": "img",\
      "cmds": [\
        {\
          // 类型标记（必须）\
          "type": "img",\
          // 指令名称（必须）\
          "label": "图像保存为文件"\
        }\
      ]\
    }\
  ]
}
```

### `files` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#files)

匹配文件(夹)

plugin.json

json

```
{
  "features": [\
    {\
      "code": "files",\
      "cmds": [\
        {\
          // 类型标记（必须）\
          "type": "files",\
          // 指令名称（必须）\
          "label": "图片批量处理",\
          // 文件类型 - "file"、"directory" (可选)\
          "fileType": "file",\
          // 文件扩展名 (可选)\
          "extensions": ["png", "jpg", "jpeg", "svg", "webp", "tiff", "avif", "heic", "bmp", "gif"],\
          // 匹配文件(夹)名称的正则表达式字符串，与 extensions 二选一 (可选)\
          "match": "/\\.(?:jpg|jpeg|png|svg|webp|tiff|avif|heic|bmp)$/i",\
          // 最少文件数 (可选)\
          "minLength": 1,\
          // 最多文件数 (可选)\
          "maxLength": 100\
        }\
      ]\
    }\
  ]
}
```

### `window` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#window)

匹配当前活动的系统窗口

plugin.json

json

```
{
  "features": [\
    {\
      "code": "window",\
      "cmds": [\
        {\
          // 类型标记（必须）\
          "type": "window",\
          // 指令名称（必须）\
          "label": "窗口置顶",\
          // 窗口匹配规则\
          "match": {\
            // 应用名称（必须）\
            "app": ["xxx.app", "xxx.exe"],\
            // 匹配窗口标题的正则表达式字符串 (可选)\
            "title": "/xxx/",\
            // 窗口类 (Windows 专有) (可选)\
            "class": ["xxx"]\
          }\
        }\
      ]\
    }\
  ]
}
```

WARNING

正则表达式存如果在斜杠 "" 需要多加一个，"\\"

## 插件应用为 AI Agent 提供能力 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E6%8F%92%E4%BB%B6%E5%BA%94%E7%94%A8%E4%B8%BA-ai-agent-%E6%8F%90%E4%BE%9B%E8%83%BD%E5%8A%9B)

通过配置 `tools`，可以将插件应用能力以标准化工具的形式暴露给 AI Agent（如 OpenClaw、Claude Code 等），使其在执行过程中能够自主决策并调用相应能力完成任务。

> ⚠️ **重要约束**
>
> 配置 `tools` 后，必须在运行时代码中通过 `utools.registerTool` 完成注册，否则 AI Agent 无法实际调用该工具。
>
> js
>
> ```
> utools.registerTool('say_hi', async () => { return 'hi' })
> ```

### `tools` [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#tools)

> 类型：`object`
>
> 必填：否

用于向 AI Agent 暴露可调用的工具集合，每个工具以键值对形式定义。 键名必须为小写 `snake_case`，用于唯一标识工具，示例：`say_hi`、`video_convert`。

### 工具对象字段 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#%E5%B7%A5%E5%85%B7%E5%AF%B9%E8%B1%A1%E5%AD%97%E6%AE%B5)

- **description** (`string`)：工具功能说明，便于 AI 理解和调用。
- **inputSchema** (`object`)：JSON Schema 定义工具输入参数结构，遵循 JSON Schema 使用指南。必须为有效对象，不能为 `null`。

无参数工具推荐使用 `{ "type": "object", "additionalProperties": false }`（仅允许空对象）或 `{ "type": "object" }`（允许任意对象）。
- **outputSchema** (`object`, 可选)：JSON Schema 定义工具输出结果结构，遵循 JSON Schema 使用指南。

### `tools` 配置示例 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#tools-%E9%85%8D%E7%BD%AE%E7%A4%BA%E4%BE%8B)

json

```
"tools" : {
  "say_hi": {
    "description": "向用户打个招呼",
    "inputSchema": { "type": "object", "additionalProperties": false }
  },
  "video_convert": {
    "description": "视频格式转换",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "inputPath": {
          "type": "string",
          "description": "输入视频文件绝对路径"
        },
        "format": {
          "type": "string",
          "enum": ["mp4", "mkv", "mov", "webm", "avi", "flv", "wmv"],
          "description": "目标视频格式"
        }
      },
      "required": ["inputPath", "format"]
    },
    "outputSchema": {
      "type": "object",
      "properties": {
        "outputPath": {
          "type": "string",
          "description": "输出视频文件绝对路径"
        }
      },
      "required": ["outputPath"]
    }
  }
}
```

### AI Agent 专用（无 UI 模式） [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#ai-agent-%E4%B8%93%E7%94%A8-%E6%97%A0-ui-%E6%A8%A1%E5%BC%8F)

当插件应用仅给 AI Agent 使用，可采用最小配置模式：

- 无需配置：`main`、`features`（不提供界面能力）
- 必需配置：`logo`、`preload`、`tools`

## plugin.json 配置完整示例 [​](https://www.u-tools.cn/docs/developer/information/plugin-json.html\#plugin-json-%E9%85%8D%E7%BD%AE%E5%AE%8C%E6%95%B4%E7%A4%BA%E4%BE%8B)

json

```
 {
  "main": "index.html",
  "logo": "logo.png",
  "preload": "preload.js",
  "features": [\
    {\
      "code": "test-text",\
      "explain": "功能指令 —— 可搜索打开的指令示例",\
      "cmds": ["功能指令"]\
    },\
    {\
      "code": "test-regex",\
      "explain": "匹配指令 —— 正则匹配示例",\
      "cmds": [\
        {\
          "type": "regex",\
          "label": "打开链接",\
          "match": "/^(?:(http|https|ftp):\/\/)?((?:[\\w-]+\\.)+[a-z0-9]+)((?:\/[^\/?#]*)+)?(\\?[^#]+)?(#.+)?$/i",\
          "minLength": 7,\
          "maxLength": 2000\
        },\
        {\
          "type": "regex",\
          "label": "身份证号查询",\
          "match": "/^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}(\\d|X)$/",\
          "minLength": 18,\
          "maxLength": 18\
        },\
        {\
          "type": "regex",\
          "label": "手机号查询",\
          "match": "/^1[3456789]\\d{9}$/",\
          "minLength": 11,\
          "maxLength": 11\
        },\
        {\
          "type": "regex",\
          "label": "手机号查询",\
          "match": "/^1[3456789]\\d{9}$/",\
          "minLength": 11,\
          "maxLength": 11\
        },\
        {\
          "type": "regex",\
          "match": "/^\\(*[+-]?(?:\\d{1,15}|\\d{1,3}(?:,\\d\\d\\d){1,4})(?:\\.\\d{1,15})?%?\\)*(?:\\s*[+*/^%-]\\s*\\(*[+-]?(?:\\d{1,15}|\\d{1,3}(?:,\\d\\d\\d){1,4})(?:\\.\\d{1,15})?%?\\)*)+$/",\
          "label": "公式计算",\
          "maxLength": 1000\
        }\
      ]\
    },\
    {\
      "code": "test-files",\
      "explain": "匹配指令 —— 文件(夹)匹配示例",\
      "cmds": [\
        {\
          "type": "files",\
          "label": "任意文件重命名"\
        },\
        {\
          "type": "files",\
          "fileType": "file",\
          "extensions": ["png", "jpg", "jpeg", "svg", "webp", "tiff", "avif", "heic", "bmp", "gif"],\
          "label": "图片批量处理"\
        },\
        {\
          "type": "files",\
          "fileType": "directory",\
          "label": "读取文件夹内所有文件",\
          "maxLength": 1\
        },\
        {\
          "type": "files",\
          "fileType": "file",\
          "extensions": ["pdf", "md", "doc", "docx", "xls", "xlsx", "txt"],\
          "label": "AI 文档处理",\
          "maxLength": 50\
        },\
        {\
          "type": "files",\
          "fileType": "file",\
          "extensions": ["mp4", "webm", "avi", "flv", "mkv", "mov", "wmv"],\
          "label": "视频批量处理"\
        }\
      ]\
    },\
    {\
      "code": "test-img",\
      "explain": "匹配指令 —— 图像匹配示例",\
      "cmds": [\
        {\
          "type": "img",\
          "label": "OCR 文字识别"\
        },\
        {\
          "type": "img",\
          "label": "保存为图片文件"\
        }\
      ]\
    },\
    {\
      "code": "test-over",\
      "explain": "匹配指令 —— 任意文本匹配示例",\
      "cmds": [\
        {\
          "type": "over",\
          "label": "问问 AI"\
        },\
        {\
          "type": "over",\
          "label": "Google 搜索",\
          "exclude": "/\\n/",\
          "minLength": 1,\
          "maxLength": 500\
        }\
      ]\
    },\
    {\
      "code": "test-window",\
      "explain": "匹配指令 —— 当前活动应用窗口匹配示例",\
      "cmds": [\
        {\
          "type": "window",\
          "match": {\
            "app": ["explorer.exe", "SearchApp.exe", "SearchHost.exe", "FESearchHost.exe", "prevhost.exe"],\
            "class": ["CabinetWClass", "ExploreWClass"]\
          },\
          "label": "终端中打开当前目录"\
        },\
        {\
          "type": "window",\
          "match": {\
            "app": ["chrome.exe", "firefox.exe", "msedge.exe", "Safari.app", "Google Chrome.app", "Microsoft Edge.app"],\
            "title": "/^(?:GitHub - )?[A-Za-z0-9][A-Za-z0-9-]+\\//"\
          },\
          "label": "Github Clone"\
        }\
      ]\
    }\
  ]
}
```