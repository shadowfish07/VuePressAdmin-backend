'use strict';
module.exports = {
  /**
   * 启动新线程执行异步shell任务
   * @param shellTaskFilename {string} shell任务文件名，文件名应是app/shell/目录下的文件，不包含路径名
   * @returns {Promise<void>}
   */
  async startShellTask(shellTaskFilename) {
    const fs = require('fs');
    const dayjs = require('dayjs');
    const { v4: uuidv4 } = require('uuid');
    const taskId = uuidv4();
    const shellOutputPath = process.cwd() + `/shellOutput/${taskId}.log`;
    const RUNNING = 1;
    const FINISHED = 2;
    const FAILED = 3;

    const task = await this.model.ShellTask.create({
      taskId,
      taskName: getTaskName(shellTaskFilename),
      state: RUNNING,
      userId: this.session.userId,
    });

    const writerStream = fs.createWriteStream(shellOutputPath);
    const { fork } = require('child_process');
    const forked = fork(`app/shell/${shellTaskFilename}.js`, [taskId], {
      silent: true,
    });
    forked.on('message', async ({ msg }) => {
      this.logger.error(`{${taskId}} 执行shell子线程时出现异常：${msg}`, msg);
      writerStream.write(
        `[${dayjs().format('YYYY-MM-DD HH:mm:SSS')}] ${msg}`,
        'utf8'
      );
      await task.update({ state: FAILED });
    });
    forked.stdout.on('data', (data) => {
      writerStream.write(
        `[${dayjs().format('YYYY-MM-DD HH:mm:SSS')}] ${data.toString()}`,
        'utf8'
      );
    });
    forked.stderr.on('data', (data) => {
      writerStream.write(
        `[${dayjs().format('YYYY-MM-DD HH:mm:SSS')}] ${data.toString()}`,
        'utf8'
      );
    });
    forked.stdout.on('end', async () => {
      writerStream.write(
        `[${dayjs().format('YYYY-MM-DD HH:mm:SSS')}] Shell Finished`,
        'utf8'
      );
      writerStream.end();
      this.logger.info(`[${taskId}] shell 任务结束`);

      await task.update({
        state: FINISHED,
        log: fs.readFileSync(shellOutputPath, 'utf8'),
      });
      this.logger.info(`[${taskId}] 日志已写入数据库并更新任务状态`);

      fs.unlinkSync(shellOutputPath);
      this.logger.info(`[${taskId}] 日志文件已删除`);
    });

    /**
     * 获取shell任务名称
     * @param shellTaskFilename  {string} shell任务文件名，文件名应是app/shell/目录下的文件，不包含路径名
     * @returns {string} shell任务名称
     */
    function getTaskName(shellTaskFilename) {
      switch (shellTaskFilename) {
        case 'initGitRepository':
          return '初始化git仓库';
        default:
          return shellTaskFilename;
      }
    }
  },
};
