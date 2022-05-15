'use strict';

const { API_ERROR_CODE } = require('../extend/response');
const Controller = require('egg').Controller;

const switchLocalDeployRule = {
  enable: {
    type: 'boolean',
    required: true,
  },
};

class DeployController extends Controller {
  /**
   * @api {post} /deploy/local 开关本地部署服务
   * @apiName 开关本地部署服务
   * @apiGroup Deploy
   * @apiDescription 开启后，会启动caddy服务，作为VuePress build内容的文件服务器
   *
   * @apiPermission 管理员
   *
   * @apiBody {boolean} enable 是否开启本地部署服务
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {string} data 成功开启则返回shell执行taskId，成功停止则返回stopped，没有变化则返回do nothing
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0101 传入参数错误
   * @apiError (错误码) A0102 content-type必须是application/json
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0201 没有权限
   * @apiError (错误码) A0202 站点未初始化
   */
  async switchLocalDeploy() {
    const { ctx } = this;
    if (ctx.request.header['content-type'] !== 'application/json') {
      return ctx.response.returnFail(
        'content-type必须是application/json',
        API_ERROR_CODE.CONTENT_TYPE_NOT_SUPPORT
      );
    }

    ctx.validate(switchLocalDeployRule);

    if (ctx.session.role !== 'admin') {
      ctx.logger.info('用户无权限执行此操作');
      return ctx.response.returnFail(
        '你没有权限',
        API_ERROR_CODE.NO_PERMISSION
      );
    }

    const result = await ctx.service.deploy.switchLocalDeploy(ctx.request.body);
    if (result) return ctx.response.returnSuccess(result);
  }
}

module.exports = DeployController;
