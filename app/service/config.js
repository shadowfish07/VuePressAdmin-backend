'use strict';
const Service = require('egg').Service;

class ConfigService extends Service {
  /**
   * 添加或更新给定的一个或多个站点配置
   *
   * 对于value是Boolean值的配置，则尝试执行布尔转换，统一转换为true/false，若转换失败则拒绝执行，直接返回错误信息
   * @param config {object} 键值对，键为配置项名称，值为配置项值。e.g: { 'hasInit': true, 'siteName': 'cool site' }
   * @permission admin
   * @returns {Promise<void>}
   */
  async patch(config) {
    if (this.ctx.session.role !== 'admin') {
      this.ctx.logger.info('用户无权限执行此操作');
      return this.ctx.response.returnFail('你没有权限', 403);
    }

    // 校验、转换Boolean配置

    for (const [key, value] of Object.entries(config)) {
      if (isBooleanValue(key)) {
        try {
          config[key] = this.ctx.helper.transferToBoolean(value);
        } catch (err) {
          this.ctx.logger.info(`配置项${key}的值${value}不能转换为布尔值`);
          return this.ctx.response.returnFail('配置项值格式错误', 400);
        }
      }
    }

    // 执行

    for (const [key, value] of Object.entries(config)) {
      await this.ctx.helper.updateOrCreate(
        this.ctx.model.Config,
        { key },
        { key, value }
      );
    }

    function isBooleanValue(key) {
      switch (key) {
        case 'hasInit':
          return true;
        default:
          return false;
      }
    }
  }

  /**
   * 站点是否已初始化（通过config-hasInit判断）
   * @returns {Promise<boolean>} 是否已初始化
   */
  async hasSiteInit() {
    const config = await this.ctx.model.Config.findOne({ key: 'hasInit' });
    return !!config.value;
  }

  /**
   * 启动新线程异步初始化vuepress目录，若已存在vuepress则不初始化
   * @param type {string} 初始化模板类型，目前支持VuePressTemplate-recoX
   * @permission admin
   * @returns {Promise<void>}
   */
  async vuepressInit({ type }) {
    const fs = require('fs');
    if (this.ctx.session.role !== 'admin') {
      this.ctx.logger.info('用户无权限执行此操作');
      return this.ctx.response.returnFail('你没有权限', 403);
    }
    if (fs.existsSync('vuepress')) {
      this.ctx.logger.info('vuepress已存在，不初始化');
      return this.ctx.response.returnFail('已存在vuepress目录，拒绝执行初始化');
    }

    switch (type) {
      case 'VuePressTemplate-recoX':
        this.ctx.logger.info('执行初始化，模板：' + type);
        await this.ctx.startShellTask('initRecoXTemplate');
        break;
      default:
        this.ctx.logger.warn('未知的vuepress初始化模板类型');
        return this.ctx.response.returnFail('未知的vuepress初始化模板类型');
    }

    return this.ctx.response.returnSuccess();
  }
}

module.exports = ConfigService;
