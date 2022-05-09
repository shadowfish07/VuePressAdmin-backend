'use strict';
if (process.argv[2] === '--DO-RUN--') {
  shell(process.argv[3], process.argv[4]);
}

function shell(taskId, vuepressPath) {
  const shell = require('shelljs');
  shell.config.fatal = true;

  try {
    shell.echo(
      `准备执行shell命令“重新安装npm依赖”。taskId: ${taskId}, vuepressPath: ${vuepressPath}`
    );
    shell.config.verbose = true;
    shell.cd(vuepressPath);

    const fs = require('fs');
    if (fs.existsSync('node_modules')) {
      shell.rm('-rf', 'node_modules');
    }
    if (fs.existsSync('package-lock.json')) {
      shell.rm('-rf', 'package-lock.json');
    }
    shell.exec('npm install');
  } catch (error) {
    process.send({ taskId, msg: error.toString() });
  }
}

module.exports = shell;
