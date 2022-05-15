'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const {
  mockAdminUserSession,
  generalUserId,
  mockGeneralUsersSession,
} = require('../../util/utils');
const { API_ERROR_CODE } = require('../../../app/extend/response');

describe('test/app/controller/shellTask.test.js', () => {
  describe('GET /api/shell-task/:id', () => {
    let adminUserShellTask;
    let generalUserShellTask;
    beforeEach(async () => {
      adminUserShellTask = await app.factory.create('shellTask');
      generalUserShellTask = await app.factory.create('shellTask', {
        userId: generalUserId,
      });
    });

    function check(expect, real) {
      assert(expect.id === real.id);
      assert(expect.taskId === real.taskId);
      assert(expect.taskName === real.taskName);
      assert(expect.state === real.state);
      assert(expect.log === real.log);
      assert(expect.timeConsumed === real.timeConsumed);
      assert(expect.userId === real.userId);
    }

    it('should success when admin operating query shell task created by admin user by id', async () => {
      mockAdminUserSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${adminUserShellTask.id}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      check(adminUserShellTask, result.body.data);
    });

    it('should success when admin operating query shell task created by admin user by taskId', async () => {
      mockAdminUserSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${adminUserShellTask.taskId}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      check(adminUserShellTask, result.body.data);
    });

    it('should success when admin operating query shell task created by general user by id', async () => {
      mockAdminUserSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${generalUserShellTask.id}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      check(generalUserShellTask, result.body.data);
    });

    it('should success when admin operating query shell task created by general user by taskId', async () => {
      mockAdminUserSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${generalUserShellTask.taskId}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      check(generalUserShellTask, result.body.data);
    });

    it('should success when general operating query shell task created by self by id', async () => {
      mockGeneralUsersSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${generalUserShellTask.id}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      check(generalUserShellTask, result.body.data);
    });

    it('should success when general operating query shell task created by self by taskId', async () => {
      mockGeneralUsersSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${generalUserShellTask.taskId}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      check(generalUserShellTask, result.body.data);
    });

    it('should fail when general operating query shell task created by other user by id', async () => {
      mockGeneralUsersSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${adminUserShellTask.id}`)
        .send();

      assert(result.statusCode === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NO_PERMISSION);
    });

    it('should success when general operating query shell task created by other user by taskId', async () => {
      mockGeneralUsersSession(app);
      const result = await app
        .httpRequest()
        .get(`/api/shell-task/${adminUserShellTask.taskId}`)
        .send();

      assert(result.statusCode === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NO_PERMISSION);
    });

    it('should fail when shell task is not exist', async () => {
      mockAdminUserSession(app);
      const result = await app
        .httpRequest()
        .get('/api/shell-task/123456789')
        .send();

      assert(result.statusCode === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NOT_FOUND);
    });
  });
});
