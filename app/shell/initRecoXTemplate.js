'use strict';
if (process.argv[2] === '--DO-RUN--') shell(process.argv[3], process.argv[4]);

function shell(taskId, vuepressPath) {
  const shell = require('shelljs');
  shell.config.fatal = true;

  try {
    shell.echo(
      `准备执行shell命令“使用模板VuePressTemplate-recoX初始化VuePress”。taskId: ${taskId}, vuepressPath: ${vuepressPath}`
    );
    shell.config.verbose = true;
    shell.exec(
      `git clone --progress https://github.com/shadowfish07/VuePressTemplate-recoX.git --depth=1 ${vuepressPath}`
    );
    shell.rm('-rf', `${vuepressPath}/.git`);
    shell.cd(vuepressPath);
    shell.exec('git init');
    shell.exec('git add .');
    shell.exec("git commit -m '初始化'");
    shell.exec('npm install --registry=https://registry.npmmirror.com');
  } catch (error) {
    process.send({ taskId, msg: error.toString() });
  }
}

module.exports = shell;
