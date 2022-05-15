'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const sinon = require('sinon');
const shelljs = require('shelljs');
const {
  mockAdminUserSession,
  mockGeneralUsersSession,
} = require('../../util/utils');
const fs = require('fs');
const path = require('path');
const { API_ERROR_CODE } = require('../../../app/extend/response');

describe('test/app/controller/deploy.test.js', () => {
  describe('POST /api/deploy/local', async () => {
    const hasCaddy = shelljs.which('caddy');
    const doNothingReturnData = 'do nothing';
    const stoppedReturnData = 'stopped';
    beforeEach(() => {
      // 如果本机不存在caddy环境就mock掉caddy的启动
      if (!hasCaddy) {
        console.log('本机不存在caddy环境，mock掉caddy的启动');
        sinon.stub(shelljs, 'exec').returns(true);
      }
    });
    afterEach(() => {
      sinon.restore();
      if (fs.existsSync(path.join(process.cwd(), 'Caddyfile'))) {
        fs.unlinkSync(path.join(process.cwd(), 'Caddyfile'));
      }
      if (app.caddyProcess) {
        app.caddyProcess.kill();
        app.caddyProcess = null;
      }
    });
    it('should success when admin operating and set it true at the first time', async () => {
      mockAdminUserSession(app);
      const result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: true,
        });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      assert(
        result.body.data !== doNothingReturnData &&
          result.body.data !== stoppedReturnData
      );

      const record = await app.model.Config.findOne({
        where: {
          key: 'enable_local_deploy',
        },
      });

      assert(record.value === '1');

      assert(app.caddyProcess);
    });
    it('should success and do nothing when admin operating, set it true and old enable_local_deploy is true', async () => {
      mockAdminUserSession(app);

      await app.model.Config.create({ key: 'enable_local_deploy', value: '1' });

      const result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: true,
        });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      assert(result.body.data === doNothingReturnData);

      const record = await app.model.Config.findOne({
        where: {
          key: 'enable_local_deploy',
        },
      });

      assert(record.value === '1');
    });
    it('should success when admin operating, set it true and old enable_local_deploy is false', async () => {
      mockAdminUserSession(app);

      await app.model.Config.create({ key: 'enable_local_deploy', value: 0 });

      const result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: true,
        });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      assert(
        result.body.data !== doNothingReturnData &&
          result.body.data !== stoppedReturnData
      );

      const record = await app.model.Config.findOne({
        where: {
          key: 'enable_local_deploy',
        },
      });

      assert(record.value === '1');
      assert(app.caddyProcess);
    });
    it('should success when admin operating and set it false at the first time', async () => {
      mockAdminUserSession(app);

      const result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: false,
        });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      assert(result.body.data === stoppedReturnData);

      const record = await app.model.Config.findOne({
        where: {
          key: 'enable_local_deploy',
        },
      });

      assert(record.value === '0');
      assert(!app.caddyProcess);
    });
    it('should success when admin operating, set it false and old enable_local_deploy is false', async () => {
      mockAdminUserSession(app);

      await app.model.Config.create({ key: 'enable_local_deploy', value: '0' });

      const result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: false,
        });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      assert(result.body.data === doNothingReturnData);

      const record = await app.model.Config.findOne({
        where: {
          key: 'enable_local_deploy',
        },
      });

      assert(record.value === '0');
    });
    it('should success when admin operating, set it false and old enable_local_deploy is true', async () => {
      mockAdminUserSession(app);

      await app.model.Config.create({ key: 'enable_local_deploy', value: '1' });

      const result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: false,
        });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      const record = await app.model.Config.findOne({
        where: {
          key: 'enable_local_deploy',
        },
      });

      assert(record.value === '0');
      assert(!app.caddyProcess);
    });
    it('should fail when general user operating', async () => {
      mockGeneralUsersSession(app);
      const result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: true,
        });

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NO_PERMISSION);
    });
    it('should fail when param format is invalid', async () => {
      mockAdminUserSession(app);
      let result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'application/json')
        .send({
          enable: 233,
        });

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);

      result = await app
        .httpRequest()
        .post('/api/deploy/local')
        .set('content-type', 'form/data')
        .send(
          JSON.stringify({
            enable: true,
          })
        );

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.CONTENT_TYPE_NOT_SUPPORT);
    });
  });
});
