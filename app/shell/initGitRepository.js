'use strict';
const shell = require('shelljs');
shell.config.fatal = true;
const taskId = process.argv[2];

try {
  shell.echo(`准备执行shell命令“初始化git仓库”。taskId: ${taskId}`);
  shell.config.verbose = true;
  shell.cd('vuepress');
  shell.exec('git init');
} catch (error) {
  process.send({ taskId, msg: error.toString() });
}
