'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  /**
   * @api {get} /user/me 获取当前登录用户个人信息
   * @apiName 获取当前登录用户个人信息
   * @apiGroup User
   * @apiDescription 返回当前用户个人信息
   * @apiVersion 0.1.0
   * @apiPermission 普通用户
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiUse UserInfoSuccessData
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   */
  async me() {
    this.ctx.response.returnSuccess(
      await this.ctx.service.user.getCurrentUser()
    );
  }
}

module.exports = UserController;
