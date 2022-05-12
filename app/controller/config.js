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
   * @api {patch} /config 更新站点配置
   * @apiName 更新站点配置
   * @apiGroup Config
   * @apiDescription 添加或更新给定的站点配置
   *
   * @apiPermission 管理员
   *
   * @apiHeader content-type application/json
   * @apiBody {json} config 键值对，键为配置项名称，值为配置项值。
   * @apiParamExample {json} config参数实例:
   * { 'hasInit': true, 'siteName': 'cool site' }
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {string} data shell执行taskId
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError 403 站点未初始化
   * @apiError 422 传入参数错误
   * @apiError 422 content-type必须是application/json
   * @apiError 403 没有权限
   * @apiError 400 配置项值应为boolean的传参格式错误
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
   * 返回初始化VuePress的taskId
   * @api {post} /config/init 初始化站点
   * @apiName 初始化站点
   * @apiGroup Config
   * @apiDescription 执行新站点初始化操作，不允许重复执行，只能在站点未初始化时执行。
   *
   * @apiPermission 管理员
   *
   * @apiBody {string} siteName 站点名称
   * @apiBody {string="VuePressTemplate-recoX"} vuePressTemplate 初始化模板类型
   * @apiBody {string="none","github","gitee"} gitPlatform git远程托管平台类型
   * @apiBody {string="new","import"} [gitType=new] 新建或导入git
   * @apiBody {string} [gitURL] git远程托管平台地址
   * @apiBody {string} [gitRepoName] git远程托管平台仓库名称
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {string} data shell执行taskId
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError 422 传入参数错误
   * @apiError 403 没有权限
   * @apiError 403 站点已经初始化
   * @apiError 400 配置项值应为boolean的传参格式错误
   *
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
