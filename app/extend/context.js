'use strict';
module.exports = {
  /**
   * 启动新线程执行异步shell任务
   * @param shellTaskFilename {string} shell任务文件名，文件名应是app/shell/目录下的文件，不包含路径名
   * @param [args] {array} shell任务执行参数
   * @param [callback] {function} 完成最终数据库写入后执行的回调函数，传入第一个参数isFailed标记任务是否成功
   * @param [afterFork] {function} 在子进程创建后执行的回调函数，传入第一个参数forked是创建的ChildProcess对象
   * @returns {Promise<string>} 返回taskId
   */
  async startShellTask(
    shellTaskFilename,
    args = [],
    callback = null,
    afterFork = null
  ) {
    const fs = require('fs');
    const dayjs = require('dayjs');
    const { v4: uuidv4 } = require('uuid');
    const taskId = uuidv4();
    const shellOutputPath = process.cwd() + `/shellOutput/${taskId}.log`;
    const IN_LINE = 0;
    const RUNNING = 1;
    const FINISHED = 2;
    const FAILED = 3;
    let isFailed = false;

    let task;

    const writerStream = fs.createWriteStream(shellOutputPath);
    this.logger.info(
      `[${taskId}] start shell task: ${shellTaskFilename},log path: ${shellOutputPath}`
    );

    if (isSync(shellTaskFilename)) {
      task = await this.model.ShellTask.create({
        taskId,
        taskName: getTaskName(shellTaskFilename),
        state: IN_LINE,
        userId: this.session.userId,
      });
      // 加入同步任务队列
      await this.app.syncShell.pushShell({
        run: forkShell.bind(this),
        info: task,
        readyToGo: () => {},
      });
    } else {
      await forkShell.apply(this);
    }

    return taskId;
    /**
     * 获取shell任务名称
     * @param shellTaskFilename  {string} shell任务文件名，文件名应是app/shell/目录下的文件，不包含路径名
     * @returns {string} shell任务名称
     */
    function getTaskName(shellTaskFilename) {
      switch (shellTaskFilename) {
        case 'initRecoXTemplate':
          return '使用模板VuePressTemplate-recoX初始化VuePress';
        case 'commitArticle':
          return 'git commit 文章';
        case 'buildVuePress':
          return 'build VuePress';
        case 'reInstallNPMDependence':
          return '重新安装npm依赖';
        case 'runCaddyFileServer':
          return '启动Caddy文件服务器';
        default:
          return shellTaskFilename;
      }
    }

    /**
     * 判断shell任务是否是同步任务
     * @param shellTaskFilename {string} shell任务文件名，文件名应是app/shell/目录下的文件，不包含路径名
     * @returns {boolean} true表示是同步任务，false表示是异步任务
     */
    function isSync(shellTaskFilename) {
      switch (shellTaskFilename) {
        case 'initRecoXTemplate':
          return true;
        case 'commitArticle':
          return true;
        default:
          return false;
      }
    }

    /**
     * 执行shell任务
     * @returns {Promise<void>}
     */
    async function forkShell() {
      const startTime = dayjs();
      task = await this.helper.updateOrCreate(
        this.model.ShellTask,
        { taskId },
        {
          taskId,
          taskName: getTaskName(shellTaskFilename),
          state: RUNNING,
          userId: this.session.userId,
        }
      );

      const { fork } = require('child_process');

      const forked = fork(
        `app/shell/${shellTaskFilename}.js`,
        ['--DO-RUN--', taskId, this.app.config.vuepress.path, ...args],
        {
          silent: true,
        }
      );
      forked.on('message', async ({ msg }) => {
        this.logger.error(`{${taskId}} 执行shell子线程时出现异常：${msg}`);
        writerStream.write(
          `[${dayjs().format('YYYY-MM-DD HH:mm:SSS')}] ${msg}`,
          'utf8'
        );
        isFailed = true;
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
        writerStream.end(
          `\n[${dayjs().format('YYYY-MM-DD HH:mm:SSS')}] Shell Finished`,
          'utf8'
        );
        const timeConsumed = dayjs().diff(startTime);
        this.logger.info(`[${taskId}] shell 任务结束，耗时：${timeConsumed}ms`);

        fs.readFile(
          shellOutputPath,
          { encoding: 'utf8' },
          async (err, data) => {
            await task.update({
              state: isFailed ? FAILED : FINISHED,
              log: data,
              timeConsumed,
            });
            this.logger.info(`[${taskId}] 日志已写入数据库并更新任务状态`);

            if (err || !data) {
              this.logger.error(
                `[${taskId}] 日志读取失败，不执行日志文件删除操作`
              );
            } else {
              fs.unlinkSync(shellOutputPath);
              this.logger.info(`[${taskId}] 日志文件已删除`);
            }

            if (callback) {
              callback(isFailed);
            }

            if (isSync(shellTaskFilename)) {
              await this.app.syncShell.emitShellEnd();
            }
          }
        );
      });
    }
  },
};
