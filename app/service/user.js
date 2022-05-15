'use strict';
const { API_ERROR_CODE } = require('../extend/response');
const Service = require('egg').Service;

class UserService extends Service {
  /**
   * 尝试登录，成功则返回用户信息
   * @param username {string} 用户名
   * @param password {string} 密码
   * @returns {Promise<boolean>} 若成功，设置接口返回值data为用户信息，否则设置接口返回400
   */
  async login({ username, password }) {
    const user = await this.ctx.model.User.findOne({
      where: {
        username,
        password,
      },
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return this.ctx.response.returnFail(
        '用户名或密码错误',
        API_ERROR_CODE.BAD_REQUEST
      );
    }
    this.ctx.session.userId = user.id;
    this.ctx.session.role = user.role;
    return this.ctx.response.returnSuccess(user);
  }

  /**
   * 返回当前用户信息
   * @returns {Promise<User|null>}
   */
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
