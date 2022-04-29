'use strict';
const Service = require('egg').Service;

class ConfigService extends Service {
  /**
   * 添加或更新给定的站点配置
   * @param config {object} 键值对，键为配置项名称，值为配置项值。e.g: { 'hasInit': true, 'siteName': 'cool site' }
   * @returns {Promise<void>}
   */
  async patch(config) {
    for (const [key, value] of Object.entries(config)) {
      await this.ctx.helper.updateOrCreate(
        this.ctx.model.Config,
        { key },
        { key, value }
      );
    }
  }
}

module.exports = ConfigService;
