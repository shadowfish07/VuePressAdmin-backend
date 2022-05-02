'use strict';
exports.sequelize = {
  dialect: 'sqlite',
  storage: ':memory:',
};

exports.vuepress = {
  path: process.cwd() + '/vuepress-test',
};
