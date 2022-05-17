'use strict';

const Controller = require('egg').Controller;

class ShellTaskController extends Controller {
  /**
   * @api {get} /api/shell-task/:id 获取指定shell任务执行情况
   * @apiName getShellTask
   * @apiGroup ShellTask
   * @apiDescription 管理员可以查看任意任务，普通用户只能看到自己触发的任务
   *
   * @apiPermission 普通用户
   *
   * @apiParam {String} id shell任务id，整数id和uuid字符串id均可
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiUse ShellTaskData
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0201 没有权限
   * @apiError (错误码) A0202 站点未初始化
   * @apiError (错误码) A0300 找不到指定的shell任务
   */
  async getShellTask() {
    const { ctx } = this;
    const result = await ctx.service.shellTask.getShellTask(ctx.params);
    if (result) ctx.response.returnSuccess(result);
  }
}

module.exports = ShellTaskController;
