'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  /**
   * @api {get} /user/me 获取当前登录用户个人信息
   * @apiName 获取当前登录用户个人信息
   * @apiGroup User
   * @apiDescription 返回当前用户个人信息
   *
   * @apiPermission 普通用户
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiUse UserInfoSuccessData
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0202 站点未初始化
   */
  async me() {
    this.ctx.response.returnSuccess(
      await this.ctx.service.user.getCurrentUser()
    );
  }
}

module.exports = UserController;
