'use strict';
if (process.argv[2] === '--DO-RUN--') {
  shell(process.argv[3], process.argv[4]);
}

function shell(taskId, vuepressPath) {
  const shell = require('shelljs');
  shell.config.fatal = true;

  try {
    shell.echo(
      `准备执行shell命令“build VuePress”。taskId: ${taskId}, vuepressPath: ${vuepressPath}`
    );
    shell.config.verbose = true;
    shell.cd(vuepressPath);

    const oldNodeEnv = process.env.NODE_ENV;

    // 需要设置NODE_ENV为production，否则会报错
    process.env.NODE_ENV = 'production';
    shell.exec('npm run docs:build');
    process.env.NODE_ENV = oldNodeEnv;
  } catch (error) {
    process.send({ taskId, msg: error.toString() });
  }
}

module.exports = shell;
