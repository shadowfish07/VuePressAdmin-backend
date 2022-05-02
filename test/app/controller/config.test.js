'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const { mockAdminUserSession } = require('../../util/utils');

describe('test/app/controller/config.test.js', () => {
  before(async () => {
    await require('../../util/init')();
  });

  beforeEach(() => {
    mockAdminUserSession(app);
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
        });

      assert(result.statusCode === 200);

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
            hasInit: value,
          });

        assert(result.statusCode === (success ? 200 : 400));

        if (!success) {
          return;
        }

        const config = await app.model.Config.findOne({
          where: {
            key: 'hasInit',
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
