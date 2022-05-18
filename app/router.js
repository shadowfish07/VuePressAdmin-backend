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

  router.resources('article', '/api/article', controller.article);
  router.get('/api/article/:id/read_count', controller.article.getReadCount);

  router.post('/api/vuepress/build', controller.vuepress.build);
  router.post(
    '/api/vuepress/re-install-NPM-dependence',
    controller.vuepress.reInstallNPMDependence
  );

  router.post('/api/statistics', controller.statistics.recordAccess);
  router.get(
    '/api/statistics/visit_count',
    controller.statistics.getVisitCount
  );

  router.post('/api/deploy/local', controller.deploy.switchLocalDeploy);

  router.get('/api/shell-task/:id', controller.shellTask.getShellTask);

  // router.resources("users", "/api/users", controller.users);
};
