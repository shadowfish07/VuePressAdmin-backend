'use strict';

const { API_ERROR_CODE } = require('../extend/response');
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
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0101 传入参数错误
   * @apiError (错误码) A0102 content-type必须是application/json
   * @apiError (错误码) A0201 没有权限
   * @apiError (错误码) A0202 站点未初始化
   */
  async patch() {
    const { ctx } = this;
    if (ctx.request.header['content-type'] !== 'application/json') {
      return ctx.response.returnFail(
        'content-type必须是application/json',
        API_ERROR_CODE.CONTENT_TYPE_NOT_SUPPORT
      );
    }
    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail(
        '你没有权限',
        API_ERROR_CODE.NO_PERMISSION
      );
    }
    const patchResult = await ctx.service.config.patch(ctx.request.body);
    if (patchResult) return ctx.response.returnSuccess();
  }

  /**
   * TODO 支持远程仓库连接
   *
   * 返回初始化VuePress的taskId
   * @api {post} /api/config/init 初始化站点
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
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0100 站点已初始化
   * @apiError (错误码) A0101 传入参数错误
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0201 没有权限
   *
   */
  async initSite() {
    const { ctx } = this;
    ctx.validate(initSite);

    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail(
        '你没有权限',
        API_ERROR_CODE.NO_PERMISSION
      );
    }

    if (await ctx.service.config.hasSiteInit()) {
      ctx.logger.info('站点已经初始化');
      return ctx.response.returnFail(
        '站点已经初始化',
        API_ERROR_CODE.BAD_REQUEST
      );
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
