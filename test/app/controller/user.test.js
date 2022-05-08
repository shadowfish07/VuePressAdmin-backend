'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const { mockAdminUserSession } = require('../../util/utils');

describe('test/app/controller/user.test.js', () => {
  describe('GET /api/user/me', () => {
    it('should get user info', async () => {
      mockAdminUserSession(app);

      const result = await app.httpRequest().get('/api/user/me');

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data.id === 1);
      assert(result.body.data.username === 'admin');
      assert(result.body.data.role === 'admin');
      assert(result.body.data.avatar);
      assert(result.body.data.createdAt);
      assert(result.body.data.updatedAt);
      assert(!result.body.data.password);
    });

    it('should fail when no cookie', async () => {
      const result = await app.httpRequest().get('/api/user/me');

      assert(result.status === 401);
      assert(!result.body.success);
    });
  });
});
