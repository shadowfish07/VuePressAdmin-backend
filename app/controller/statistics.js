'use strict';

const Controller = require('egg').Controller;

const recordAccessRule = {
  hostname: { type: 'string', required: true, allowEmpty: false },
  path: { type: 'string', required: true, allowEmpty: false },
  ip: { type: 'string', required: true, allowEmpty: false },
  articleId: { type: 'number', required: false },
};

class StatisticsController extends Controller {
  /**
   * @api {post} /api/statistics 访问记录
   * @apiName recordAccess
   * @apiGroup Statistics
   * @apiDescription 调用该接口记录一次访问。如果站点配置fullVisitHistoryRecord=true，则会详细记录访问信息。
   *
   * @apiBody {String} hostname 域名
   * @apiBody {String} path 访问路径
   * @apiBody {String} ip 访问者IP
   * @apiBody {Number} [articleId] 文章ID，如果是文章页面，则填写文章ID。
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {null} data 无
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0202 站点未初始化
   */
  async recordAccess() {
    this.ctx.validate(recordAccessRule);
    await this.ctx.service.statistics.recordAccess(this.ctx.request.body);
    return this.ctx.response.returnSuccess();
  }
}

module.exports = StatisticsController;
