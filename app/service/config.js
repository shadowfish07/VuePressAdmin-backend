'use strict';
const { API_ERROR_CODE } = require('../extend/response');
const Service = require('egg').Service;

class ConfigService extends Service {
  /**
   * 添加或更新给定的一个或多个站点配置
   *
   * 对于value是Boolean值的配置，则尝试执行布尔转换，统一转换为true/false，若转换失败则拒绝执行，直接返回错误信息
   * @param config {object} 键值对，键为配置项名称，值为配置项值。e.g: { 'hasInit': true, 'siteName': 'cool site' }
   * @permission admin
   * @returns {Promise<boolean>} 是否成功
   */
  async patch(config) {
    if (this.ctx.session.role !== 'admin') {
      this.ctx.logger.info('用户无权限执行此操作');
      return this.ctx.response.returnFail(
        '你没有权限',
        API_ERROR_CODE.NO_PERMISSION
      );
    }

    // 校验、转换Boolean配置

    for (const [key, value] of Object.entries(config)) {
      if (isBooleanValue(key)) {
        try {
          config[key] = this.ctx.helper.transferToBoolean(value);
        } catch (err) {
          this.ctx.logger.info(`配置项${key}的值${value}不能转换为布尔值`);
          return this.ctx.response.returnFail(
            '配置项值格式错误',
            API_ERROR_CODE.BAD_REQUEST
          );
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

    return true;

    function isBooleanValue(key) {
      switch (key) {
        case 'hasInit':
          return true;
        case 'testBoolean':
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
    const config = await this.ctx.model.Config.findOne({
      where: { key: 'hasInit' },
    });
    return this.ctx.helper.transferToBoolean(config.value);
  }

  /**
   * 启动新线程异步初始化vuepress目录，若已存在vuepress则不初始化
   * @param obj {object} 初始化参数
   * @param obj.type {string} 初始化模板类型，目前支持VuePressTemplate-recoX
   * @permission admin
   * @returns {Promise<boolean|string>} 成功则返回taskId,失败则返回false
   */
  async vuepressInit({ type }) {
    const fs = require('fs');
    if (this.ctx.session.role !== 'admin') {
      this.ctx.logger.info('用户无权限执行此操作');
      return this.ctx.response.returnFail(
        '你没有权限',
        API_ERROR_CODE.NO_PERMISSION
      );
    }
    if (fs.existsSync(this.app.config.vuepress.path)) {
      this.ctx.logger.info('vuepress已存在，不初始化');
      return this.ctx.response.returnFail(
        '已存在vuepress目录，拒绝执行初始化',
        API_ERROR_CODE.BAD_REQUEST
      );
    }

    let taskId;

    switch (type) {
      case 'VuePressTemplate-recoX':
        this.ctx.logger.info('执行初始化，模板：' + type);
        taskId = await this.ctx.startShellTask('initRecoXTemplate');
        break;
      default:
        this.ctx.logger.warn('未知的vuepress初始化模板类型');
        return this.ctx.response.returnFail(
          '未知的vuepress初始化模板类型',
          API_ERROR_CODE.PARAM_INVALID
        );
    }

    return taskId;
  }
}

module.exports = ConfigService;
