'use strict';

const Controller = require('egg').Controller;

class CookieController extends Controller {
  /**
   * @api {get} /cookie 登录
   * @apiName 登录
   * @apiGroup Cookie
   * @apiDescription 返回登录态cookie，同时返回用户个人信息
   * @apiVersion 0.1.0
   * @apiPermission 普通用户
   *
   * @apiBody {String} username 用户名
   * @apiBody {String} password 密码
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiUse UserInfoSuccessData
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError 422 传入参数错误
   * @apiError 400 用户名或密码错误
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
