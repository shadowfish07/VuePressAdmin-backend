'use strict';

const Controller = require('egg').Controller;
class ConfigController extends Controller {
  /**
   * 添加或更新给定的站点配置
   * @api PATCH /config
   * @apiName 更新站点配置
   * @permission admin
   * @apiParam {json} 键值对，键为配置项名称，值为配置项值。e.g: { 'hasInit': true, 'siteName': 'cool site' }
   */
  async patch() {
    const { ctx } = this;
    if (ctx.request.header['content-type'] !== 'application/json') {
      return ctx.response.returnFail('content-type必须是application/json', 422);
    }
    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail('你没有权限', 403);
    }
    await ctx.service.config.patch(ctx.request.body);
    return ctx.response.returnSuccess();
  }
}

module.exports = ConfigController;
