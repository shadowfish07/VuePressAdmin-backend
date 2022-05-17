'use strict';

const { API_ERROR_CODE } = require('../extend/response');
const Controller = require('egg').Controller;

class VuepressController extends Controller {
  /**
   * @api {post} /api/vuepress/build 执行VuePress build
   * @apiName 执行VuePress_build
   * @apiGroup VuePress
   * @apiDescription 执行VuePress的build命令
   *
   * @apiPermission 管理员
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {string} data shell执行taskId
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0201 没有权限
   * @apiError (错误码) A0202 站点未初始化
   */
  async build() {
    const { ctx } = this;

    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail(
        '你没有权限',
        API_ERROR_CODE.NO_PERMISSION
      );
    }

    return ctx.response.returnSuccess(await ctx.service.vuepress.build());
  }

  /**
   * @api {post} /api/vuepress/re-install-NPM-dependence 重新安装NPM依赖
   * @apiName 重新安装NPM依赖
   * @apiGroup VuePress
   * @apiDescription 可以在出现各种奇怪问题时尝试执行
   *
   * @apiPermission 管理员
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {string} data shell执行taskId
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0201 没有权限
   */
  async reInstallNPMDependence() {
    const { ctx } = this;
    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail(
        '你没有权限',
        API_ERROR_CODE.NO_PERMISSION
      );
    }

    return ctx.response.returnSuccess(
      await ctx.service.vuepress.reInstallNPMDependence()
    );
  }
}

module.exports = VuepressController;
