'use strict';

const { API_ERROR_CODE } = require('../extend/response');
const Controller = require('egg').Controller;

class CookieController extends Controller {
  /**
   * @api {get} /api/cookie 登录
   * @apiName 登录
   * @apiGroup Cookie
   * @apiDescription 返回登录态cookie，同时返回用户个人信息
   *
   * @apiPermission 普通用户
   *
   * @apiBody {String} username 用户名
   * @apiBody {String} password 密码
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiUse UserInfoSuccessData
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0100 用户名或密码错误
   * @apiError (错误码) A0101 传入参数错误
   * @apiError (错误码) A0200 需要登录
   */
  async getCookie() {
    const { ctx } = this;
    if (!ctx.request.query.username || !ctx.request.query.password) {
      ctx.logger.info('缺少必须参数');
      return ctx.response.returnFail(
        '请求参数错误',
        API_ERROR_CODE.PARAM_INVALID
      );
    }
    await ctx.service.user.login(ctx.request.query);
  }
}

module.exports = CookieController;
