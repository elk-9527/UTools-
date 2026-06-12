const { exec } = require('child_process');

/**
 * 桌面组件 preload 脚本
 * 暴露 Node.js 原生能力给前端
 *
 * 注意：此 preload 同时用于：
 *   1. index.html（插件主入口，有 utools API）
 *   2. widget.html（由 createBrowserWindow 创建的独立窗口，同样有 utools API）
 *
 * 对于文件对话框和屏幕信息，推荐直接使用 utools 提供的 API：
 *   - utools.showOpenDialog(options)
 *   - utools.getPrimaryDisplay()
 * 本 preload 仅暴露无法通过 utools API 实现的原生能力（启动应用、打开文件夹等）。
 */
window.widgetServices = {

  /** 启动 Windows 应用程序 */
  launchApp(exePath) {
    return new Promise((resolve, reject) => {
      exec(`start "" "${exePath}"`, { shell: 'cmd.exe' }, (error) => {
        if (error) reject(error.message);
        else resolve(true);
      });
    });
  },

  /** 打开文件夹 */
  openFolder(folderPath) {
    return new Promise((resolve, reject) => {
      exec(`explorer "${folderPath}"`, (error) => {
        if (error) reject(error.message);
        else resolve(true);
      });
    });
  },

  /** 在默认浏览器中打开网址 */
  openUrl(url) {
    return new Promise((resolve, reject) => {
      const { shell } = require('electron');
      shell.openExternal(url)
        .then(() => resolve(true))
        .catch((err) => reject(err.message));
    });
  },

  /** 获取主显示器工作区尺寸 */
  getScreenSize() {
    const { screen } = require('electron');
    const primary = screen.getPrimaryDisplay();
    const { width, height } = primary.workAreaSize;
    return { width, height };
  }
};
