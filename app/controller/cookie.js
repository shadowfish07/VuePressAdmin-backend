'use strict';

const Controller = require('egg').Controller;

class CookieController extends Controller {
  /**
   * 返回登录态cookie，同时返回用户个人信息
   * @api GET /cookie
   * @apiName 登录
   * @apiParam {String} username 用户名
   * @apiParam {String} password 密码
   */
  async getCookie() {
    const { ctx } = this;
    if (!ctx.request.query.username || !ctx.request.query.password) {
      ctx.logger.info('缺少必须参数');
      return ctx.response.returnFail('请求参数错误', 422);
    }
    await ctx.service.user.login(ctx.request.query);
  }
}

module.exports = CookieController;
