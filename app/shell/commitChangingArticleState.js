'use strict';
if (process.argv[2] === '--DO-RUN--') {
  const [taskId, vuepressPath, articleId, oldPath, newPath] =
    process.argv.slice(3);
  shell(taskId, vuepressPath, articleId, oldPath, newPath);
}

function shell(taskId, vuepressPath, articleId, oldPath, newPath) {
  const shell = require('shelljs');
  shell.config.fatal = true;

  try {
    shell.echo(
      `准备执行shell命令“git commit 更新文章状态”。taskId: ${taskId}, vuepressPath: ${vuepressPath}, articleId: ${articleId}, oldPath: ${oldPath}, newPath: ${newPath}`
    );
    shell.config.verbose = true;
    shell.cd(vuepressPath);

    shell.exec(`git add "${oldPath}"`);
    shell.exec(`git add "${newPath}"`);
    shell.exec(`git commit -m "[docs:${articleId}] 更新文章状态"`);
  } catch (error) {
    process.send({ taskId, msg: error.toString() });
  }
}

module.exports = shell;
