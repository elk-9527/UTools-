[Skip to content](https://www.u-tools.cn/docs/developer/basic/first-plugin.html#VPContent)

On this page

# 第一个插件应用 [​](https://www.u-tools.cn/docs/developer/basic/first-plugin.html\#%E7%AC%AC%E4%B8%80%E4%B8%AA%E6%8F%92%E4%BB%B6%E5%BA%94%E7%94%A8)

现在，开始创建你的第一个插件应用

### 打开 uTools 开发者工具 [​](https://www.u-tools.cn/docs/developer/basic/first-plugin.html\#%E6%89%93%E5%BC%80-utools-%E5%BC%80%E5%8F%91%E8%80%85%E5%B7%A5%E5%85%B7)

![开发者工具主界面](https://www.u-tools.cn/docs/assets/started-1.DjXGhi6G.png)开发者工具主界面

### 新建项目 [​](https://www.u-tools.cn/docs/developer/basic/first-plugin.html\#%E6%96%B0%E5%BB%BA%E9%A1%B9%E7%9B%AE)

点击开发者工具左下侧 `新建项目` 按钮，即可弹出新建项目相关的配置界面。

![新建项目界面](https://www.u-tools.cn/docs/assets/started-2.BxuLdzPJ.png)新建项目界面

根据表单的字段要求，分别填写对应内容。

勾选 "同意 uTools 开发者协议" ，点击右下角的确定，完成创建。

![填写应用信息](https://www.u-tools.cn/docs/assets/started-3.Dc__dU90.png)填写应用信息

- **插件应用名称**: 为了保证插件能够 **被 [Web 端的插件应用市场](https://www.u-tools.cn/plugins/) 正确收录**，请尽量： **不使用特殊的符号，比如操作系统不支持的文件名符号以及 emoji 等**
- **插件应用描述**：可以帮助其他用户快速的了解应用包含的功能，尽量简洁且清晰
- **运行平台**：支持的操作系统平台。(uTools 是跨平台的)
- **开发者名称**：插件应用市场会显示该应用开发者名称
- **插件应用所属团队**：创建属于团队的私有插件应用

TIP

如需创建团队，请前往 [团队版](https://www.u-tools.cn/team/)

### 创建工程文件夹 [​](https://www.u-tools.cn/docs/developer/basic/first-plugin.html\#%E5%88%9B%E5%BB%BA%E5%B7%A5%E7%A8%8B%E6%96%87%E4%BB%B6%E5%A4%B9)

- 通过 `uTools 开发者工具` “新建React+Vite工程” / “新建Vue+Vite工程” 按钮，根据步骤自动创建。
- 或手动创建工程文件夹

TIP

文件夹的名字可以是任意的，但是我们尽量保证跟插件应用有一定关联性以及尽量使用英文。 比如你的第一个插件应用名字可能是“第一个插件”，文件夹名字可以是“my-first-plugin”。

### 工程文件夹下的文件 [​](https://www.u-tools.cn/docs/developer/basic/first-plugin.html\#%E5%B7%A5%E7%A8%8B%E6%96%87%E4%BB%B6%E5%A4%B9%E4%B8%8B%E7%9A%84%E6%96%87%E4%BB%B6)

在工程文件夹下，将会存放许多文件，有些文件是必不可少的，请参考 [官方推荐的文件目录结构](https://www.u-tools.cn/docs/developer/information/file-structure.html)。

我们应该先把 logo 文件以及页面对应的 html 入口文件放入工程文件夹下，然后添加必不可少的`plugin.json` 文件。

plugin.json

js

```
{
  "logo": "logo.png",
  "main": "index.html",
  "features": [\
    {\
      "code": "test",\
      "cmds": [\
        "第一个插件"\
      ],\
      "explain": "第一个插件"\
    }\
  ]
}
```

TIP

关于 `plugin.json` 更多信息，请查看 [配置文件介绍](https://www.u-tools.cn/docs/developer/information/plugin-json.html)。

## 开始编写插件应用 [​](https://www.u-tools.cn/docs/developer/basic/first-plugin.html\#%E5%BC%80%E5%A7%8B%E7%BC%96%E5%86%99%E6%8F%92%E4%BB%B6%E5%BA%94%E7%94%A8)

要让你的插件应用展示任何内容，必须借助刚刚提前创建好的 “index.html” 文件，因为 uTools 插件应用本身借助了 Web 网页的界面来实现了界面的绘制，这对有 Web 开发经验的开发者来说，是相对简单易上手的方式。

现在，为你的插件应用输出最基础的内容，一行 `hello world` 。

index.html

html

```
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的第一个插件应用</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
```

TIP

在深入编写插件应用的过程中，你可能会慢慢运用到 uTools 提供的各种 api，比如：

- [交互事件](https://www.u-tools.cn/docs/developer/api-reference/utools/events.html)
- [数据存储](https://www.u-tools.cn/docs/developer/api-reference/db/db-storage.html)
- [系统相关](https://www.u-tools.cn/docs/developer/api-reference/utools/system.html)

或者你需要自己定制更强大的系统交互能力，那么可以考虑为你的项目加入 [`preload.js`](https://www.u-tools.cn/docs/developer/information/preload-js/preload-js.html)，并尝试在其中使用 [`nodejs api`](https://www.u-tools.cn/docs/developer/information/preload-js/nodejs.html)。

## 接入开发 [​](https://www.u-tools.cn/docs/developer/basic/first-plugin.html\#%E6%8E%A5%E5%85%A5%E5%BC%80%E5%8F%91)

将项目与创建的工程文件夹关联，需要选择 `plugin.json` 配置文件。

点击项目的应用开发界面的 **选择工程「plugin.json」文件夹** ，选择工程文件夹下的 `plugin.json` 配置文件

![未选择plugin.json](https://www.u-tools.cn/docs/assets/started-4.B34bILpV.png)未选择 plugin.json