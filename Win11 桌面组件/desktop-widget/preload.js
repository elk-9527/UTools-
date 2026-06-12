const { exec } = require('child_process');
const { shell } = require('electron');

/**
 * 桌面组件 preload 脚本
 * 暴露 Node.js 原生能力给前端
 *
 * 部分功能优先使用 uTools 内置 API（更可靠），
 * Node.js exec 作为回退方案。
 */
window.widgetServices = {

  /** 启动 Windows 应用程序 */
  launchApp(exePath) {
    return new Promise((resolve, reject) => {
      // 优先用 utools.shellOpenPath
      try {
        if (window.utools && utools.shellOpenPath) {
          utools.shellOpenPath(exePath);
          resolve(true);
          return;
        }
      } catch(e) {}
      // 回退 Node.js
      exec(`start "" "${exePath}"`, { shell: 'cmd.exe' }, (error) => {
        if (error) reject(error.message);
        else resolve(true);
      });
    });
  },

  /** 打开文件夹 */
  openFolder(folderPath) {
    return new Promise((resolve, reject) => {
      try {
        if (window.utools && utools.shellOpenPath) {
          utools.shellOpenPath(folderPath);
          resolve(true);
          return;
        }
      } catch(e) {}
      exec(`explorer "${folderPath}"`, (error) => {
        if (error) reject(error.message);
        else resolve(true);
      });
    });
  },

  /** 在默认浏览器中打开网址 */
  openUrl(url) {
    return new Promise((resolve, reject) => {
      try {
        if (window.utools && utools.shellOpenExternal) {
          utools.shellOpenExternal(url);
          resolve(true);
          return;
        }
      } catch(e) {}
      shell.openExternal(url)
        .then(() => resolve(true))
        .catch((err) => reject(err.message));
    });
  }
};
