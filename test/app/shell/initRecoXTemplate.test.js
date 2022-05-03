'use strict';
const shell = require('shelljs');
const { app, assert } = require('egg-mock/bootstrap');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
describe('initRecoXTemplate', () => {
  before(() => {
    shell.rm('-rf', app.config.vuepress.path);
  });
  afterEach(() => {
    sinon.restore();
  });
  after(async () => {
    // DANGER: 这里会读取config中配置的vuepress.path值，删除此目录！！！（测试环境下，应当使用config.unittest.js）
    let retryTimes = 0;
    await new Promise((resolve) => {
      const timer = setInterval(() => {
        if (retryTimes > 10 || !fs.existsSync(app.config.vuepress.path)) {
          clearInterval(timer);
          resolve();
        }
        try {
          shell.rm('-rf', app.config.vuepress.path);
          clearInterval(timer);
          resolve();
        } catch (err) {
          console.log(`删除文件失败：${err.message}`);
          retryTimes++;
        }
      }, 100);
    });
  });
  it('should work', async () => {
    const s = sinon.stub().callsFake((args) => {
      if (args !== 'npm install --registry=https://registry.npmmirror.com') {
        shell.exec(args);
      }
    });

    const initRecoXTemplateShell = proxyquire(
      '../../../app/shell/initRecoXTemplate',
      {
        shelljs: {
          exec: s,
        },
      }
    );
    sinon.stub(process, 'send');
    const taskId = uuidv4();
    initRecoXTemplateShell(taskId, app.config.vuepress.path);
    assert(fs.existsSync(app.config.vuepress.path));
  });
});
