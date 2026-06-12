[Skip to content](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html#VPContent)

On this page

# 调试插件应用 [​](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html\#%E8%B0%83%E8%AF%95%E6%8F%92%E4%BB%B6%E5%BA%94%E7%94%A8)

## 每次进入插件应用加载最新代码 [​](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html\#%E6%AF%8F%E6%AC%A1%E8%BF%9B%E5%85%A5%E6%8F%92%E4%BB%B6%E5%BA%94%E7%94%A8%E5%8A%A0%E8%BD%BD%E6%9C%80%E6%96%B0%E4%BB%A3%E7%A0%81)

在项目的应用开发界面，点击右上角设置图标弹出的菜单中选择开启 **退出到后台立即结束运行**

![退出到后台立即结束运行](https://www.u-tools.cn/docs/assets/debug-hotreload.DUBY_IZP.png)退出到后台立即结束运行

## 使用开发者调试工具 [​](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html\#%E4%BD%BF%E7%94%A8%E5%BC%80%E5%8F%91%E8%80%85%E8%B0%83%E8%AF%95%E5%B7%A5%E5%85%B7)

进入开发中的插件应用后，点击右上角应用 Logo - 点击 **开发者工具** 或者按快捷键 `Ctrl` \+ `Shift` \+ `I` 打开

![devtools.png](https://www.u-tools.cn/docs/assets/developer_devtools.BkAuR5CM.png)菜单启动开发者工具

## 进阶(代码热更新) [​](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html\#%E8%BF%9B%E9%98%B6-%E4%BB%A3%E7%A0%81%E7%83%AD%E6%9B%B4%E6%96%B0)

在开发模式下，入口文件是支持 URL 协议的，可配合 Vite、Webpack 等工具，在开发阶段进行热更新。

### Vite [​](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html\#vite)

Vite 默认为各种框架提供了热更新的集成，所以只需要默认启动项目既可使用。

1. 启动项目

shell

```
npm run dev
```

2. `plugin.json`增加`development`配置, 端口需要与 webpack-dev-server 开启的端口一致

json

```
{
  "development": {
    "main": "http://127.0.0.1:5173/index.html"
  }
}
```

3. 进入 uTools 开发工具, 点击接入开发后观察效果

### Webpack [​](https://www.u-tools.cn/docs/developer/basic/debug-plugin.html\#webpack)

1. 添加 Webpack HMR 模块热替换插件

shell

```
npm install webpack-dev-server --save-dev
```

2. 入口`index.js`文件增加监听代码

```
if (module.hot) {
    module.hot.accept();
}
```

3. 启动 webpack-dev-server

json

```
//package.json script
"scripts": {
    "serve": "webpack serve",
  }
```

shell

```
npm run serve
```