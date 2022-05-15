'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const {
  mockAdminUserSession,
  mockGeneralUsersSession,
} = require('../../util/utils');
const sinon = require('sinon');
const childProcess = require('child_process');
const FakeChildProcess = require('../../util/FakeChildProcess');
const shell = require('shelljs');
const { API_ERROR_CODE } = require('../../../app/extend/response');

describe('test/app/controller/config.test.js', () => {
  before(async () => {
    shell.rm('-rf', app.config.vuepress.path);
  });

  beforeEach(() => {
    mockAdminUserSession(app);
  });

  describe('PATCH /api/config', () => {
    it('should success when change exist key', async () => {
      const result = await app
        .httpRequest()
        .patch('/api/config')
        .set('content-type', 'application/json')
        .send({
          hasInit: true,
        });

      assert(result.statusCode === 200);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      const config = await app.model.Config.findOne({
        where: {
          key: 'hasInit',
        },
      });
      assert(config.value === '1');
    });

    it('should success when edit key that need boolean value', async () => {
      async function sendAndTest(value, success) {
        const result = await app
          .httpRequest()
          .patch('/api/config')
          .set('content-type', 'application/json')
          .send({
            testBoolean: value,
          });

        assert(result.statusCode === 200);

        assert(result.body.success === success);

        assert(
          result.body.errorCode === success
            ? API_ERROR_CODE.SUCCESS
            : API_ERROR_CODE.PARAM_INVALID
        );

        if (!success) {
          return;
        }

        const config = await app.model.Config.findOne({
          where: {
            key: 'testBoolean',
          },
        });
        assert(
          config.value === app.mockContext().helper.transferToBoolean(value)
            ? '1'
            : '0'
        );
      }

      await sendAndTest(true, true);
      await sendAndTest(false, true);
      await sendAndTest(1, true);
      await sendAndTest(0, true);
      await sendAndTest('1', true);
      await sendAndTest('0', true);
      await sendAndTest('true', true);
      await sendAndTest('false', true);
      await sendAndTest('yes', false);
    });

    it('should success when add new key and change them', async () => {
      const { Op } = app.Sequelize;
      let result = await app
        .httpRequest()
        .patch('/api/config')
        .set('content-type', 'application/json')
        .send({
          newKey: "i'm value",
          anotherKey: 'another value',
        });

      assert(result.statusCode === 200);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      let config = await app.model.Config.findAll({
        where: {
          key: {
            [Op.or]: ['newKey', 'anotherKey'],
          },
        },
      });
      assert(config.length === 2);
      assert(
        config.find((item) => item.key === 'newKey').value === "i'm value"
      );
      assert(
        config.find((item) => item.key === 'anotherKey').value ===
          'another value'
      );

      // 编辑

      result = await app
        .httpRequest()
        .patch('/api/config')
        .set('content-type', 'application/json')
        .send({
          newKey: 'new value',
          anotherKey: 'another new value',
        });

      assert(result.statusCode === 200);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      config = await app.model.Config.findAll({
        where: {
          key: {
            [Op.or]: ['newKey', 'anotherKey'],
          },
        },
      });
      assert(config.length === 2);
      assert(
        config.find((item) => item.key === 'newKey').value === 'new value'
      );
      assert(
        config.find((item) => item.key === 'anotherKey').value ===
          'another new value'
      );
    });

    it('should fail when content-type is not application/json', async () => {
      const result = await app
        .httpRequest()
        .patch('/api/config')
        .set('content-type', 'text/plain')
        .send(
          JSON.stringify({
            newKey: "i'm value",
            anotherKey: 'another value',
          })
        );

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.CONTENT_TYPE_NOT_SUPPORT);
    });
  });

  describe('POST /api/config/init', () => {
    const RUNNING = 1;
    let fakeChildProcess;
    beforeEach(async () => {
      await app.model.Config.update(
        { key: 'hasInit', value: 0 },
        {
          where: {
            key: 'hasInit',
          },
        }
      );
      fakeChildProcess = new FakeChildProcess();
      sinon.mock(childProcess).expects('fork').returns(fakeChildProcess);
    });
    afterEach(() => {
      sinon.restore();
      const fs = require('fs');
      if (fs.existsSync(app.config.vuepress.path)) {
        fs.rmdirSync(app.config.vuepress.path);
      }
    });
    it('should success when site is not init and not using remote repo', async () => {
      const siteName = 'test';
      const gitPlatform = 'none';
      const vuePressTemplate = 'VuePressTemplate-recoX';
      const result = await app
        .httpRequest()
        .post('/api/config/init')
        .set('content-type', 'application/json')
        .send({
          siteName,
          gitPlatform,
          vuePressTemplate,
        });

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data);

      const task = await app.model.ShellTask.findOne({
        where: {
          taskId: result.body.data,
        },
      });

      assert(result.body.data);
      assert(task.state === RUNNING);
      assert(task.userId === 1);
      assert(task.taskName === '使用模板VuePressTemplate-recoX初始化VuePress');

      fakeChildProcess.emitStdout('end');

      const hasInit = await app.model.Config.findOne({
        where: {
          key: 'hasInit',
        },
      });

      assert(hasInit.value === '1');

      const dbSiteName = await app.model.Config.findOne({
        where: {
          key: 'siteName',
        },
      });

      assert(dbSiteName.value === siteName);

      const dbGitPlatform = await app.model.Config.findOne({
        where: {
          key: 'gitPlatform',
        },
      });

      assert(dbGitPlatform.value === gitPlatform);

      const dbVuePressTemplate = await app.model.Config.findOne({
        where: {
          key: 'vuePressTemplate',
        },
      });

      assert(dbVuePressTemplate.value === vuePressTemplate);
    });
    it('should fail when site is init', async () => {
      await app.model.Config.update(
        {
          value: 1,
        },
        {
          where: {
            key: 'hasInit',
          },
        }
      );
      const siteName = 'test';
      const gitPlatform = 'none';
      const vuePressTemplate = 'VuePressTemplate-recoX';
      const result = await app
        .httpRequest()
        .post('/api/config/init')
        .set('content-type', 'application/json')
        .send({
          siteName,
          gitPlatform,
          vuePressTemplate,
        });

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.BAD_REQUEST);
    });
    it('should fail when vuepress dir is exist', async () => {
      const fs = require('fs');
      fs.mkdirSync(app.config.vuepress.path);
      const siteName = 'test';
      const gitPlatform = 'none';
      const vuePressTemplate = 'VuePressTemplate-recoX';
      const result = await app
        .httpRequest()
        .post('/api/config/init')
        .set('content-type', 'application/json')
        .send({
          siteName,
          gitPlatform,
          vuePressTemplate,
        });

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.BAD_REQUEST);
    });
    it('should fail when gitPlatform is not support', async () => {
      const siteName = 'test';
      const gitPlatform = 'notSupport';
      const vuePressTemplate = 'VuePressTemplate-recoX';
      const result = await app
        .httpRequest()
        .post('/api/config/init')
        .set('content-type', 'application/json')
        .send({
          siteName,
          gitPlatform,
          vuePressTemplate,
        });

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);
    });
    it('should fail when vuepress template is not support', async () => {
      const siteName = 'test';
      const gitPlatform = 'none';
      const vuePressTemplate = 'notSupport';
      const result = await app
        .httpRequest()
        .post('/api/config/init')
        .set('content-type', 'application/json')
        .send({
          siteName,
          gitPlatform,
          vuePressTemplate,
        });

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);
    });
    it('should fail when siteName is empty', async () => {
      const siteName = '';
      const gitPlatform = 'none';
      const vuePressTemplate = 'VuePressTemplate-recoX';
      const result = await app
        .httpRequest()
        .post('/api/config/init')
        .set('content-type', 'application/json')
        .send({
          siteName,
          gitPlatform,
          vuePressTemplate,
        });

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);
    });
    it('should fail when user is not admin', async () => {
      mockGeneralUsersSession(app);
      const siteName = 'test';
      const gitPlatform = 'none';
      const vuePressTemplate = 'VuePressTemplate-recoX';
      const result = await app
        .httpRequest()
        .post('/api/config/init')
        .set('content-type', 'application/json')
        .send({
          siteName,
          gitPlatform,
          vuePressTemplate,
        });

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.NO_PERMISSION);
    });
  });
});
