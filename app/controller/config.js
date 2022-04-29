'use strict';

const Controller = require('egg').Controller;
class ConfigController extends Controller {
  /**
   * 添加或更新给定的站点配置
   * @api PATCH /config
   * @apiName 更新站点配置
   * @apiParam {json} 键值对，键为配置项名称，值为配置项值。e.g: { 'hasInit': true, 'siteName': 'cool site' }
   */
  async patch() {
    const { ctx } = this;
    if (ctx.request.header['content-type'] !== 'application/json') {
      return ctx.response.returnFail('content-type必须是application/json', 422);
    }
    await ctx.service.config.patch(ctx.request.body);
    return ctx.response.returnSuccess();
  }
}

module.exports = ConfigController;
