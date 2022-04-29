'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  /**
   * 返回当前用户个人信息
   * @api GET /user/me
   * @apiName 获取个人信息
   */
  async me() {
    this.ctx.response.returnSuccess(
      await this.ctx.service.user.getCurrentUser()
    );
  }
}

module.exports = UserController;
