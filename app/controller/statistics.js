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

  /**
   * @api {get} /api/statistics/visit_count 获取全站访问次数
   * @apiName getVisitCount
   * @apiGroup Statistics
   * @apiDescription 获取全站访问次数，按小时分组
   *
   * @apiPermission 普通用户
   *
   * @apiQuery {Number} [year] 查询年份，不填则返回所有数据
   * @apiQuery {Number} [month] 仅year指定时有效，查询月份，不填则返回当年所有数据
   * @apiQuery {Number} [day] 仅month指定时有效，查询天，不填则返回当月所有数据
   * @apiQuery {Boolean} [detail] 是否返回详细数据，默认false
   *
   * @apiSuccess (Success 200 详细数据-detail:true) {Boolean} success 是否成功
   * @apiUse VisitCountDetail
   * @apiSuccess (Success 200 详细数据-detail:true) {string} errorCode 错误码
   * @apiSuccess (Success 200 详细数据-detail:true) {string} errorMessage 错误信息
   * @apiSuccess (Success 200 详细数据-detail:true) {string} traceId 请求id
   *
   * @apiSuccess (Success 200 仅数值-默认) {Boolean} success 是否成功
   * @apiUse VisitCount
   * @apiSuccess (Success 200 仅数值-默认) {string} errorCode 错误码
   * @apiSuccess (Success 200 仅数值-默认) {string} errorMessage 错误信息
   * @apiSuccess (Success 200 仅数值-默认) {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0202 站点未初始化
   */
  async getVisitCount() {
    return this.ctx.response.returnSuccess(
      await this.ctx.service.statistics.getVisitCount(this.ctx.request.query)
    );
  }
}

module.exports = StatisticsController;
