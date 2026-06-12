[Skip to content](https://www.u-tools.cn/docs/developer/information/preload.html#VPContent)

On this page

# 认识 `preload` [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E8%AE%A4%E8%AF%86-preload)

当你在 `plugin.json` 文件配置了 `preload` 字段，指定的 js 文件将被预加载，该 js 文件可以调用 Node.js API 的本地原生能力和 Electron 渲染进程 API。

## 为什么需要 `preload` [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E4%B8%BA%E4%BB%80%E4%B9%88%E9%9C%80%E8%A6%81-preload)

在传统的 web 开发中，为了保持用户运行环境的安全，JavaScript 被做了很强的沙箱限制，比如不能访问本地文件，不能访问跨域网络资源，不能访问本地存储等。

uTools 基于 Electron 构建，通过 preload 机制，在渲染线程中，释放了沙箱限制，使得用户可以通过调用 Node.js 的 API 来访问本地文件、跨域网络资源、本地存储等。

## `preload` 的定义 [​](https://www.u-tools.cn/docs/developer/information/preload.html\#preload-%E7%9A%84%E5%AE%9A%E4%B9%89)

`preload` 是完全独立于前端项目的一个特殊文件，它应当与 `plugin.json` 位于同一目录或其子目录下，保证可以在打包插件应用时可以被一起打包。

`preload` js 文件遵循 `CommonJS` 规范，因此你可以使用 `require` 来引入 Node.js 模块，此部分可以参考 [Node.js 文档](https://nodejs.org/api/modules.html)。

## 前端使用 `preload` [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E5%89%8D%E7%AB%AF%E4%BD%BF%E7%94%A8-preload)

只需给 `window` 对象自定义一个属性，前端就可直接访问该属性。

preload.jsApp.jsx

js

```
const fs = require("fs");

window.customApis = {
  readFile: (path) => {
    return fs.readFileSync(path, "utf8");
  },
};
```

jsx

```
import { useEffect, useState } from "react";
export default function App() {
  const [file, setFile] = useState("");
  useEffect(() => {
    window.customApis.readFile("/path/to/README.md").then((data) => {
      setFile(data);
    }
  }, []);

  return (
    <div>
      <pre>{file}</pre>
    <div>
  )
}
```

## `preload` js 规范 [​](https://www.u-tools.cn/docs/developer/information/preload.html\#preload-js-%E8%A7%84%E8%8C%83)

由于 `preload` js 文件可使用本地原生能力，为了防止开发者滥用各种读写文件、网络等能力，uTools 规定：

- `preload` js 文件代码不能进行打包/压缩/混淆等操作，要保证每一行代码清晰可读。
- 引入的第三方模块也必须清晰可读，在提交时将源码一同提交，同样不允许压缩/混淆。

# 使用 Node.js [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E4%BD%BF%E7%94%A8-node-js)

`preload` js 文件遵循 `CommonJS` 规范，通过 `require` 引入 Node.js (16.x 版本) 模块

可以引入 Node.js 所有原生模块，开发者自己编写的 Node.js 模块以及第三方 Node.js 模块。

## 引入 Node.js 原生模块 [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E5%BC%95%E5%85%A5-node-js-%E5%8E%9F%E7%94%9F%E6%A8%A1%E5%9D%97)

preload.js

js

```
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execSync } = require("node:child_process");

window.services = {
  readFile: (filename) => {
    return fs.readFileSync(filename, { encoding: "utf-8" });
  },
  getFolder: (filepath) => {
    return path.dirname(filepath);
  },
  getOSInfo: () => {
    return { arch: os.arch(), cpus: os.cpus(), release: os.release() };
  },
  execCommand: (command) => {
    execSync(command);
  },
};
```

## 引入自己编写的模块 [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E5%BC%95%E5%85%A5%E8%87%AA%E5%B7%B1%E7%BC%96%E5%86%99%E7%9A%84%E6%A8%A1%E5%9D%97)

preload.jslibs/writeText.js

js

```
const writeText = require("./libs/writeText.js");

window.services = {
  writeText,
};
```

js

```
const fs = require("fs");
const path = require("path");

module.exports = function writeText(text, filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, text);
    return true;
  }
  return false;
};
```

## 引入第三方模块 [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E5%BC%95%E5%85%A5%E7%AC%AC%E4%B8%89%E6%96%B9%E6%A8%A1%E5%9D%97)

### 通过 `npm` 安装 [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E9%80%9A%E8%BF%87-npm-%E5%AE%89%E8%A3%85)

在 `preload.js` 同级目录下，保证存在一个独立的 `package.json`，并且设置 `type` 为 `commons`。

json

```
{
  "type": "commonjs"
  "dependencies": {}
}
```

在 `preload.js` 同级目录下，执行 `npm install` 安装第三方模块，保证 `node_modules` 目录存在。

以下是通过 `npm` 引入 `colord` 的示例:

bash

```
npm install colord
```

preload.js

js

```
const { getFormat, colord } = require("colord");

window.services = {
  colord: {
    darken(text) {
      const fmt = getFormat(text);
      if (!fmt) {
        return [null, "请输入一个有效的颜色值，比如 #000 或 rgb(0,0,0)"];
      } else {
        const darkColor = colord(text).darken(0.1);
        return [darkColor, null];
      }
    },
  },
};
```

### 通过源码引入 [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E9%80%9A%E8%BF%87%E6%BA%90%E7%A0%81%E5%BC%95%E5%85%A5)

在 `preload.js` 同级目录下，下载源码，并使用 `require` 引入。

比如从 `github` 下载 `nodemailer`：

bash

```
git clone https://github.com/nodemailer/nodemailer.git
```

preload.js

js

```
const nodemailer = require("./nodemailer");
const _setImmediate = setImmediate;
process.once("loaded", function () {
  global.setImmediate = _setImmediate;
});
const sendMail = () => {
  let transporter = require("./nodemailer").createTransport({
    host: "smtp.qq.com",
    port: 465,
    secure: true,
    auth: {
      user: "aaa@qq.com",
      pass: "xxx",
    },
  });
  let mailOptions = {
    from: "aaa@qq.com",
    to: "bbb@gmail.com",
    subject: "Sending Email using Node.js",
    text: "That was easy!",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
window.services = {
  sendMail: () => {
    return sendMail();
  },
};
```

## 引入 Electron 渲染进程 API [​](https://www.u-tools.cn/docs/developer/information/preload.html\#%E5%BC%95%E5%85%A5-electron-%E6%B8%B2%E6%9F%93%E8%BF%9B%E7%A8%8B-api)

preload.js

js

```
const { clipboard, nativeImage } = require("electron");

window.services = {
  copyImage: (imageFilePath) => {
    clipboard.writeImage(nativeImage.createFromPath(imageFilePath))
  },
};
```