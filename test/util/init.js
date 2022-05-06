'use strict';
const { app } = require('egg-mock/bootstrap');
module.exports = async () => {
  await app.model.sync({ force: true });
  await app.model.User.create({
    username: 'admin',
    password: 'admin',
    role: 'admin',
    avatar: 'https://doge.shadowfish0.top/%E7%94%B7%E5%A4%B4%E5%83%8F.png',
  });
  await app.model.User.create({
    username: 'general user',
    password: 'general user',
    role: 'general',
    avatar: 'https://doge.shadowfish0.top/%E7%94%B7%E5%A4%B4%E5%83%8F.png',
  });
  await app.model.Config.create({ key: 'hasInit', value: 0 });
};
