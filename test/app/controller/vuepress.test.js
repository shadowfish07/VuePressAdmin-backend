'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const sinon = require('sinon');
const childProcess = require('child_process');
const FakeChildProcess = require('../../util/FakeChildProcess');
const {
  mockAdminUserSession,
  mockGeneralUsersSession,
} = require('../../util/utils');

describe('test/app/controller/vuepress.test.js', () => {
  describe('POST /api/vuepress/build', () => {
    // 不执行实际shell
    let fakeChildProcess;
    beforeEach(() => {
      fakeChildProcess = new FakeChildProcess();
      sinon.mock(childProcess).expects('fork').returns(fakeChildProcess);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should return taskId when admin user operating', async () => {
      mockAdminUserSession(app);
      const result = await app.httpRequest().post('/api/vuepress/build').send();

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data);
    });
    it('should fail when general user operating', async () => {
      mockGeneralUsersSession(app);
      const result = await app.httpRequest().post('/api/vuepress/build').send();

      assert(result.status === 403);
      assert(!result.body.success);
      assert(result.body.errorMessage === '你没有权限');
    });
  });
  describe('POST /api/vuepress/re-install-NPM-dependence', () => {
    // 不执行实际shell
    let fakeChildProcess;
    beforeEach(() => {
      fakeChildProcess = new FakeChildProcess();
      sinon.mock(childProcess).expects('fork').returns(fakeChildProcess);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should return taskId when admin user operating', async () => {
      mockAdminUserSession(app);
      const result = await app
        .httpRequest()
        .post('/api/vuepress/re-install-NPM-dependence')
        .send();

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data);
    });
    it('should fail when general user operating', async () => {
      mockGeneralUsersSession(app);
      const result = await app
        .httpRequest()
        .post('/api/vuepress/re-install-NPM-dependence')
        .send();

      assert(result.status === 403);
      assert(!result.body.success);
      assert(result.body.errorMessage === '你没有权限');
    });
  });
});
