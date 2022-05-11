'use strict';
const Service = require('egg').Service;
class DeployService extends Service {
  /**
   * 切换是否开启本地部署
   *
   * 开启后，启动caddy文件服务器
   *
   * 如果是关闭，则会关闭caddy已开启的文件服务器
   *
   * 如果传入配置和已有配置相同，则不做操作
   *
   * @param enable 是否开启
   * @returns {Promise<string>} 成功开启则返回taskId，成功停止则返回stopped，没有变化则返回do nothing
   */
  async switchLocalDeploy({ enable }) {
    const enableLocalDeploy = await this.app.model.Config.findOne({
      where: {
        key: 'enable_local_deploy',
      },
    });

    if (
      enableLocalDeploy !== null &&
      this.ctx.helper.transferToBoolean(enableLocalDeploy.value) ===
        this.ctx.helper.transferToBoolean(enable)
    ) {
      this.ctx.logger.info('enable_local_deploy is already ' + enable);
      return 'do nothing';
    }

    await this.ctx.helper.updateOrCreate(
      this.app.model.Config,
      {
        key: 'enable_local_deploy',
      },
      {
        key: 'enable_local_deploy',
        value: enable,
      }
    );

    if (!enable) {
      stopCaddy.apply(this);
      return 'stopped';
    }

    return await startCaddy.apply(this);

    async function startCaddy() {
      stopCaddy.apply(this);
      return await this.ctx.startShellTask(
        'runCaddyFileServer',
        undefined,
        undefined,
        (forked) => {
          this.app.caddyProcess = forked;
        }
      );
    }

    function stopCaddy() {
      if (this.app.caddyProcess) {
        this.ctx.logger.info('stopping caddy file server');
        this.app.caddyProcess.kill();
        this.app.caddyProcess = null;
      }
    }
  }
}

module.exports = DeployService;
