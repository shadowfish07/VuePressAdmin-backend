'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {
  async me() {
    this.ctx.response.returnSuccess(
      await this.ctx.service.user.getCurrentUser()
    );
  }
}

module.exports = UserController;
