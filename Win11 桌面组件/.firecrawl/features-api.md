[Skip to content](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html#VPContent)

On this page

# 动态指令 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E5%8A%A8%E6%80%81%E6%8C%87%E4%BB%A4)

很多时候，插件应用中会提供一些功能供用户进行个性化设置（例如：网页快开插件应用），这部分配置无法在 `plugin.json` 事先定义好，所以我们提供了以下方法对插件应用功能进行动态增减。

## `utools.getFeatures([codes])` [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#utools-getfeatures-codes)

获取插件应用动态创建的功能。

### 类型定义 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89)

ts

```
function getFeatures(codes?: string[]): Feature[];
```

- `codes` 要获取的功能编码集合

`Feature` 类型定义

ts

```
interface Feature {
  code: string;
  explain?: string;
  icon?: string;
  platform?: string | string[];
  mainHide?: boolean;
  mainPush?: boolean;
  cmds: Cmd[];
}
```

#### 字段说明 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E5%AD%97%E6%AE%B5%E8%AF%B4%E6%98%8E)

- `code`
  - 功能编码，进入插件应用会将该编码带入，根据不同编码实现功能区分执行。（可参考 plugin.json 中 feature.code）
- `explain`
  - 功能描述（可参考 plugin.json 中 feature.explain）
- `icon`
  - 功能图标（可参考 plugin.json 中 feature.icon）
- `platform`
  - 指定功能可用平台（可参考 plugin.json 中 feature.platform）
- `mainHide`
  - 若配置为`true`，打开此功能不主动显示搜索框。（可参考 plugin.json 中 feature.mainHide）
- `mainPush`
  - 是否向搜索框推送内容。（可参考 plugin.json 中 feature.mainPush）
- `cmds`
  - 指令集合（可参考 plugin.json 中 feature.cmds）

### 示例代码 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81)

js

```
// 获取所有动态功能
const features = utools.getFeatures();
console.log(features);
// 获取特定 code
const features = utools.getFeatures(["code-1", "code-2"]);
console.log(features);
```

## `utools.setFeature(feature)` [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#utools-setfeature-feature)

为本插件应用动态新增某个功能。

### 类型定义 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-1)

ts

```
function setFeature(feature: Feature): void;
```

- `feature` 类型参考 [`Feature` 类型定义](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html#def-feature)

### 示例代码 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-1)

js

```
utools.setFeature({
  code: Date.now().toString(),
  explain: "测试动态功能",
  // "icon": "res/xxx.png",
  // "icon": "data:image/png;base64,xxx...",
  // "platform": ["win32", "darwin", "linux"]
  cmds: ["测试"],
});
```

## `utools.removeFeature(code)` [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#utools-removefeature-code)

动态删除本插件应用的某个功能。

### 类型定义 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-2)

ts

```
function removeFeature(code: string): Boolean;
```

- `code` 要删除的功能编码

### 示例代码 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-2)

js

```
utools.removeFeature("code");
```

## `utools.redirectHotKeySetting(cmdLabel[, autocopy])` [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#utools-redirecthotkeysetting-cmdlabel-autocopy)

跳转(前往) uTools 设置界面，引导用户配置指令全局快捷键

### 类型定义 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-3)

ts

```
function redirectHotKeySetting(cmdLabel: string, autocopy?: boolean): void;
```

- `cmdLabel` 指令名称
- `autocopy` 是否自动复制（默认为 `false`），如果设置为 `true``cmdLabel` 应设置为「匹配指令」名称

### 示例代码 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-3)

js

```
utools.redirectHotKeySetting("剪贴板");
utools.redirectHotKeySetting("问 AI", true);
```

## `utools.redirectAiModelsSetting()` [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#utools-redirectaimodelssetting)

跳转(前往) uTools 自定义 AI 模型设置界面，可引导用户自定义 AI 模型，一次配置全平台通用

### 类型定义 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%B1%BB%E5%9E%8B%E5%AE%9A%E4%B9%89-4)

ts

```
function redirectAiModelsSetting(): void;
```

### 示例代码 [​](https://www.u-tools.cn/docs/developer/api-reference/utools/features.html\#%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81-4)

js

```
utools.redirectAiModelsSetting();
```