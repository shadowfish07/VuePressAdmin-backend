'use strict';

const Controller = require('egg').Controller;

const loginRule = {
  username: { type: 'string' },
  password: { type: 'string' },
};

class CookieController extends Controller {
  async getCookie() {
    const { ctx } = this;
    ctx.validate(loginRule);
    await ctx.service.user.login(ctx.request.body);
  }
}

module.exports = CookieController;
