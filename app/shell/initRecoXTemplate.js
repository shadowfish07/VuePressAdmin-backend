'use strict';
const shell = require('shelljs');
shell.config.fatal = true;
const taskId = process.argv[2];
const vuepressPath = process.argv[3];

try {
  shell.echo(
    `准备执行shell命令“使用模板VuePressTemplate-recoX初始化VuePress”。taskId: ${taskId}, vuepressPath: ${vuepressPath}`
  );
  shell.config.verbose = true;
  shell.exec(
    `git clone --progress https://github.com/shadowfish07/VuePressTemplate-recoX.git ${vuepressPath}`
  );
  shell.cd(vuepressPath);
  shell.exec('git remote rm origin ');
  shell.exec('npm install --registry=https://registry.npmmirror.com');
} catch (error) {
  process.send({ taskId, msg: error.toString() });
}
