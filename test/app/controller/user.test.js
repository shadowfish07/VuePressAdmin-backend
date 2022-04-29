'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/user.test.js', () => {
  let cookies;
  before(async () => {
    await require('../../util/init')();
    const result = await app
      .httpRequest()
      .get('/api/cookie?username=admin&password=admin');
    cookies = result.header['set-cookie'][0];
  });

  describe('GET /api/user/me', () => {
    it('should get user info', async () => {
      const result = await app
        .httpRequest()
        .get('/api/user/me')
        .set('Cookie', cookies);

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
