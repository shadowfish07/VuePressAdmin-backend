'use strict';
const Service = require('egg').Service;
const shell = require('shelljs');
class GitService extends Service {
  isGitAvailable() {
    return shell.which('git');
  }

  async initRepository() {
    if (!this.isGitAvailable()) {
      this.ctx.response.returnFail('git not available');
      return false;
    }

    const fs = require('fs');

    if (!fs.existsSync('./vuepress')) {
      this.ctx.logger.info('创建vuepress目录');
      fs.mkdirSync('./vuepress');
    }

    await this.ctx.startShellTask('initGitRepository');

    this.ctx.response.returnSuccess();
    return true;
  }
}

module.exports = GitService;
