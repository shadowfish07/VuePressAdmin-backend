/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys =
    appInfo.name + '8kYnNQCeXJr3vAkKJhbyGNtvMVwj8NvqyeKPQ9HJPpQdLkP2t';

  // add your middleware config here
  config.middleware = ['log', 'auth', 'checkSiteInit', 'errorHandler'];

  config.auth = {
    ignore(ctx) {
      if (
        (ctx.request.url.startsWith('/api/cookie') &&
          ctx.request.method === 'GET') ||
        (ctx.request.url.startsWith('/api/statistics') &&
          ctx.request.method === 'POST') ||
        (/\/api\/article\/\d+\/read_count/.test(ctx.request.url) &&
          ctx.request.method === 'GET')
      ) {
        return true;
      }
      return false;
    },
  };

  config.checkSiteInit = {
    ignore(ctx) {
      if (
        ctx.request.url.startsWith('/api/config/init') &&
        ctx.request.method === 'POST'
      ) {
        return true;
      } else if (
        ctx.request.url.startsWith('/api/cookie') &&
        ctx.request.method === 'GET'
      ) {
        return true;
      }
      return false;
    },
  };

  const rootPath = process.cwd() + '/vuepress';

  exports.vuepress = {
    path: rootPath,
    docsPath: 'docs',
    draftPath: '_draft',
    docsFullPath: rootPath + '/docs',
    draftFullPath: rootPath + '/_draft',
  };

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.sequelize = {
    dialect: 'sqlite',
    storage: 'database/database.sqlite',
  };

  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
