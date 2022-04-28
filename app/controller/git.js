'use strict';

const Controller = require('egg').Controller;

class GitController extends Controller {
  async initRepository() {
    await this.ctx.service.git.initRepository();
  }
}

module.exports = GitController;
