const { app } = require('egg-mock/bootstrap');
const factories = require('./factories');

before(async () => {
  factories(app);
  await require('./util/init')();
});

afterEach(async () => {
  await require('./util/init')();
});
