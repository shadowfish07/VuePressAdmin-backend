'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;
  router.get('/api/cookie', controller.cookie.getCookie);
  router.get('/api/user/me', controller.user.me);

  // router.resources("config", "/api/config", controller.config);

  router.patch('/api/config', controller.config.patch);
  router.post('/api/config/init', controller.config.initSite);

  // router.resources("users", "/api/users", controller.users);
};
