'use strict';
const Service = require('egg').Service;

class ConfigService extends Service {
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
