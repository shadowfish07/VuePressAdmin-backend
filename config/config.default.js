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
  config.middleware = ['auth', 'errorHandler'];

  config.auth = {
    ignore(ctx) {
      if (
        ctx.request.url.startsWith('/api/cookie') &&
        ctx.request.method === 'GET'
      ) {
        return true;
      }
      return false;
    },
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

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
