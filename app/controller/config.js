'use strict';

const Controller = require('egg').Controller;

const initSite = {
  siteName: 'string',
  gitPlatform: {
    type: 'enum',
    values: ['none', 'github', 'gitee'],
    required: true,
  },
  gitType: {
    type: 'enum',
    values: ['new', 'import'],
    required: false,
  },
  gitURL: { type: 'string', required: false },
  gitRepoName: { type: 'string', required: false },
  gitToken: { type: 'string', required: false },
  vuePressTemplate: {
    type: 'enum',
    values: ['VuePressTemplate-recoX'],
    required: true,
  },
};

class ConfigController extends Controller {
  /**
   * 添加或更新给定的站点配置
   * @api PATCH /config
   * @apiName 更新站点配置
   * @permission admin
   * @apiParam {json} 键值对，键为配置项名称，值为配置项值。e.g: { 'hasInit': true, 'siteName': 'cool site' }
   */
  async patch() {
    const { ctx } = this;
    if (ctx.request.header['content-type'] !== 'application/json') {
      return ctx.response.returnFail('content-type必须是application/json', 422);
    }
    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail('你没有权限', 403);
    }
    const patchResult = await ctx.service.config.patch(ctx.request.body);
    if (patchResult) return ctx.response.returnSuccess();
  }

  /**
   * TODO 支持远程仓库连接
   *
   * 执行新站点初始化操作，不允许重复执行。
   *
   * 返回初始化VuePress的taskId
   * @api POST /config/init
   * @apiName 初始化站点
   * @permission admin
   * @apiParam {string} vuePressTemplate 初始化模板类型，目前支持VuePressTemplate-recoX
   */
  async initSite() {
    const { ctx } = this;
    ctx.validate(initSite);

    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail('你没有权限', 403);
    }

    if (await ctx.service.config.hasSiteInit()) {
      ctx.logger.info('站点已经初始化');
      return ctx.response.returnFail('站点已经初始化', 403);
    }

    const patchResult = await ctx.service.config.patch({
      ...ctx.request.body,
      hasInit: true,
    });

    if (!patchResult) {
      return;
    }

    const vuepressInitResult = await ctx.service.config.vuepressInit({
      type: ctx.request.body.vuePressTemplate,
    });

    if (vuepressInitResult) {
      return ctx.response.returnSuccess(vuepressInitResult);
    }
  }
}

module.exports = ConfigController;
