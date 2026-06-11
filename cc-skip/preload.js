const { exec } = require('child_process');

/**
 * 打开CMD窗口并自动输入 claude --dangerously-skip-permissions
 * 使用 start cmd.exe /k 来打开新窗口并保持不关闭
 */
window.openClaudeWithSkipPermissions = function () {
  const command = 'start "Claude Code" cmd.exe /k "claude --dangerously-skip-permissions"';
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('执行失败:', error.message);
      return;
    }
    if (stderr) {
      console.error('stderr:', stderr);
      return;
    }
  });
};
