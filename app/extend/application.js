'use strict';

/**
 * 调度不允许并发执行的shell任务
 */
class SyncShell {
  /**
   *
   * @param app {Egg.Application}
   */
  constructor(app) {
    this.app = app;
    /**
     * 当前正在执行的不允许并发执行的shell
     */
    this.runningSyncShell = null;
    /**
     * 不允许并发执行的shell排队队列
     */
    this.syncShellQueue = [];
  }

  /**
   * 触发shell任务执行结束时间，由shell任务在执行结束时执行
   *
   * 会将当前正在执行的shell任务置空，并将排队的shell任务队列中的第一个shell任务设置为当前正在执行的shell任务，执行其readyToGo回调，然后执行其run方法
   * @returns {Promise<void>}
   */
  async emitShellEnd() {
    this.app.logger.info(`sync shell ${this.runningSyncShell.info.taskId} end`);
    this.runningSyncShell = null;
    if (this.syncShellQueue.length > 0) {
      const shell = this.syncShellQueue.shift();
      this.runningSyncShell = shell;
      this.app.logger.info(`sync shell ${shell.info.taskId} start`);
      await this.runningSyncShell.readyToGo();
      await shell.run();
    }
  }

  /**
   * 添加shell任务到排队队列
   * @param shell {object} shell任务，必须包含1.info属性，且info属性必须包含taskId属性，2.readyToGo回调，3.run方法
   * @returns {Promise<void>}
   */
  async pushShell(shell) {
    if (this.runningSyncShell) {
      this.app.logger.info(
        `${this.runningSyncShell.info.taskId} 加入shell执行队列，当前已有${this.syncShellQueue.length}个shell在执行`
      );

      this.syncShellQueue.push(shell);
    } else {
      this.runningSyncShell = shell;
      await this.runningSyncShell.readyToGo();
      await shell.run();
    }
  }

  /**
   * 强制清空队列信息，初始化队列
   *
   * @returns {Promise<void>}
   */
  async forceReset() {
    this.runningSyncShell = null;
    this.syncShellQueue = [];
  }
}

// module.exports = {
//   // syncShell: new SyncShell(this),
// };

module.exports = SyncShell;
