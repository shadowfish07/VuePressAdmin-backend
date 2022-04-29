'use strict';

const Controller = require('egg').Controller;
class ConfigController extends Controller {
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
