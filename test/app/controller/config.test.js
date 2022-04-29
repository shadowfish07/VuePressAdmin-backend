'use strict';

const { app, assert } = require('egg-mock/bootstrap');

describe('test/app/controller/config.test.js', () => {
  let cookies;
  before(async () => {
    await require('../../util/init')();
    const result = await app
      .httpRequest()
      .get('/api/cookie?username=admin&password=admin');
    cookies = result.header['set-cookie'][0];
  });

  afterEach(async () => {
    await require('../../util/init')();
  });

  describe('PATCH /api/config', () => {
    it('should success when change exist key', async () => {
      const result = await app
        .httpRequest()
        .patch('/api/config')
        .set('content-type', 'application/json')
        .send({
          hasInit: true,
        })
        .set('Cookie', cookies);

      assert(result.statusCode === 200);

      const config = await app.model.Config.findOne({
        where: {
          key: 'hasInit',
        },
      });
      assert(config.value === '1');
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
        })
        .set('Cookie', cookies);

      assert(result.statusCode === 200);

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
        })
        .set('Cookie', cookies);

      assert(result.statusCode === 200);

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
  });
});
