'use strict';
const Service = require('egg').Service;
class VuepressService extends Service {
  /**
   * 开启异步线程执行VuePress build
   *
   * @returns {Promise<string>} taskId
   */
  async build() {
    return await this.ctx.startShellTask('buildVuePress');
  }

  async reInstallNPMDependence() {
    return await this.ctx.startShellTask('reInstallNPMDependence');
  }
}

module.exports = VuepressService;
