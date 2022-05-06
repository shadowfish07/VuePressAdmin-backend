'use strict';
if (process.argv[2] === '--DO-RUN--') {
  shell(process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
}

function shell(taskId, vuepressPath, filePath, articleId) {
  const shell = require('shelljs');
  shell.config.fatal = true;

  try {
    shell.echo(
      `准备执行shell命令“git commit 文章”。taskId: ${taskId}, vuepressPath: ${vuepressPath}, filePath: ${filePath}`
    );
    shell.config.verbose = true;
    shell.cd(vuepressPath);

    // 判断是否是新建文章（通过判断文件是否被tracked）
    const isNewArticle =
      shell.exec(`git ls-files "${filePath}"`).toString() === '';

    shell.exec(`git add "${filePath}"`);
    shell.exec(
      `git commit -m "[docs:${articleId}] ${
        isNewArticle ? '新建' : '更新'
      }文章"`
    );
  } catch (error) {
    process.send({ taskId, msg: error.toString() });
  }
}

module.exports = shell;
