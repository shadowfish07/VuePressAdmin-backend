'use strict';
const shell = require('shelljs');
const { app, assert } = require('egg-mock/bootstrap');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
describe('shells', () => {
  before(() => {
    shell.rm('-rf', app.config.vuepress.path);
  });
  afterEach(() => {
    // sinon.restore();
  });
  after(() => {
    // DANGER: 这里会读取config中配置的vuepress.path值，删除此目录！！！（测试环境下，应当使用config.unittest.js）
    try {
      shell.rm('-rf', app.config.vuepress.path);
    } catch (err) {
      // windows 下会EBUSY失败，不知原因
      console.log('删除vuepress目录失败' + err);
    }
  });
  it('should work when init,build and reInstallDependence', async function () {
    this.timeout(0);
    // 初始化
    const initRecoXTemplateShell = require('../../../app/shell/initRecoXTemplate');
    const initTaskId = uuidv4();
    initRecoXTemplateShell(initTaskId, app.config.vuepress.path);
    assert(fs.existsSync(app.config.vuepress.path));
    assert(fs.existsSync(path.join(app.config.vuepress.path, 'node_modules')));

    // 重新安装npm依赖
    const reInstallDependenceShell = require('../../../app/shell/reInstallNPMDependence');
    const reInstallDependenceTaskId = uuidv4();
    reInstallDependenceShell(
      reInstallDependenceTaskId,
      app.config.vuepress.path
    );

    // 构建
    const buildVuePressShell = require('../../../app/shell/buildVuePress');
    const buildTaskId = uuidv4();
    buildVuePressShell(buildTaskId, app.config.vuepress.path);
    // 此处会出现nodejs.ClusterClientNoResponseError，似乎是Egg.js的问题
    assert(
      fs.existsSync(
        path.join(app.config.vuepress.path, 'docs', '.vuepress', 'dist')
      )
    );
  });
});
