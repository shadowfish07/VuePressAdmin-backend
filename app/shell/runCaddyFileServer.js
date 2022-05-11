'use strict';
if (process.argv[2] === '--DO-RUN--') {
  shell(process.argv[3], process.argv[4]);
}

function shell(taskId, vuepressPath) {
  const shell = require('shelljs');
  shell.config.fatal = true;

  try {
    shell.echo(
      `准备执行shell命令“启动Caddy文件服务器”。taskId: ${taskId}, vuepressPath: ${vuepressPath}`
    );
    shell.config.verbose = true;
    const path = require('path');
    shell.cd(path.join(vuepressPath, 'docs', '.vuepress', 'dist'));

    shell.exec('caddy file-server --listen :8080');
  } catch (error) {
    process.send({ taskId, msg: error.toString() });
  }
}

module.exports = shell;
