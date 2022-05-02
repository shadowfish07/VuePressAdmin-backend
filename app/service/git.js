'use strict';
const Service = require('egg').Service;
const shell = require('shelljs');
class GitService extends Service {
  /**
   * 检查当前环境是否支持git
   * @returns {boolean} 检查结果
   */
  isGitAvailable() {
    return !!shell.which('git');
  }
}

module.exports = GitService;
