'use strict';
exports.sequelize = {
  dialect: 'sqlite',
  storage: ':memory:',
};

const rootPath = process.cwd() + '/vuepress-test';

exports.vuepress = {
  path: rootPath,
  docsPath: 'docs',
  draftPath: '_draft',
  docsFullPath: rootPath + '/docs',
  draftFullPath: rootPath + '/_draft',
};
