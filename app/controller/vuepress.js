'use strict';

const Controller = require('egg').Controller;

class VuepressController extends Controller {
  /**
   * 执行VuePress的build命令
   *
   * 仅管理员可执行
   *
   * @api POST /vuepress/build
   * @apiName 执行build
   * @permission admin
   */
  async build() {
    const { ctx } = this;

    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail('你没有权限', 403);
    }

    return ctx.response.returnSuccess(await ctx.service.vuepress.build());
  }

  async reInstallNPMDependence() {
    const { ctx } = this;
    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail('你没有权限', 403);
    }

    return ctx.response.returnSuccess(
      await ctx.service.vuepress.reInstallNPMDependence()
    );
  }
}

module.exports = VuepressController;
