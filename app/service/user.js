'use strict';
const Service = require('egg').Service;

class UserService extends Service {
  async login({ username, password }) {
    const user = await this.ctx.model.User.findOne({
      where: {
        username,
        password,
      },
    });
    if (!user) {
      return this.ctx.response.returnFail('用户名或密码错误');
    }
    this.ctx.session.userId = user.id;
    return this.ctx.response.returnSuccess(user);
  }

  async getCurrentUser() {
    return await this.ctx.model.User.findOne({
      where: {
        id: this.ctx.session.userId,
      },
      attributes: { exclude: ['password'] },
    });
  }
}

module.exports = UserService;
