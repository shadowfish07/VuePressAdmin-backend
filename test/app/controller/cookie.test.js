'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/cookie.test.js', () => {
  describe('GET /api/cookie', () => {
    it('should fail when no param is sent', async () => {
      const result = await app.httpRequest().get('/api/cookie');
      assert(result.status === 422);
      assert(!result.body.success);
      assert(!result.header['set-cookie']);
    });

    it('should success when correctly login to default admin user', async () => {
      const result = await app
        .httpRequest()
        .get('/api/cookie?username=admin&password=admin');
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.header['set-cookie'][0].includes('EGG_SESS'));
      assert(result.body.data.id === 1);
      assert(result.body.data.username === 'admin');
      assert(result.body.data.role === 'admin');
      assert(result.body.data.avatar);
      assert(result.body.data.createdAt);
      assert(result.body.data.updatedAt);
      assert(!result.body.data.password);
    });

    it('should fail when username or password is not correct', async () => {
      const result = await app
        .httpRequest()
        .get('/api/cookie?username=not_exist&password=admin');
      assert(result.status === 400);
      assert(!result.body.success);
      assert(!result.header['set-cookie']);
    });
  });
});
