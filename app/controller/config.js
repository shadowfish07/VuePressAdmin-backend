'use strict';

const Controller = require('egg').Controller;
class ConfigController extends Controller {
  async patch() {
    const { ctx } = this;
    await ctx.service.config.patch(ctx.request.body);
    return ctx.response.returnSuccess();
  }
}

module.exports = ConfigController;
