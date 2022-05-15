'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const { mockAdminUserSession } = require('../../util/utils');
const { API_ERROR_CODE } = require('../../../app/extend/response');

describe('test/app/middleware/checkSiteInit.test.js', () => {
  describe('checkSiteInit', () => {
    it('should return 403 when site is not init', async () => {
      await app.model.Config.update(
        { key: 'hasInit', value: 0 },
        {
          where: {
            key: 'hasInit',
          },
        }
      );
      mockAdminUserSession(app);
      const result = await app.httpRequest().get('/api/user/me');

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SITE_NOT_INIT);
    });
    it('should return 200 when site is init', async () => {
      mockAdminUserSession(app);
      const result = await app.httpRequest().get('/api/user/me');

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
    });
    it('should pass when request POST /config/init', async () => {
      mockAdminUserSession(app);
      const result = await app.httpRequest().post('/api/config/init');

      assert(result.status === 200);
      assert(result.body.errorCode !== API_ERROR_CODE.SITE_NOT_INIT);
    });
    it('should pass when request GET /cookie', async () => {
      const result = await app.httpRequest().get('/api/cookie');

      assert(result.status === 200);
      assert(result.body.errorCode !== API_ERROR_CODE.SITE_NOT_INIT);
    });
  });
});
