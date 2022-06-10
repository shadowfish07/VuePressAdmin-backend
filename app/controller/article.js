'use strict';

const { API_ERROR_CODE } = require('../extend/response');

const Controller = require('egg').Controller;
const createRule = {
  title: { type: 'string', required: true },
};
const updateContentRule = {
  content: { type: 'string', required: true },
  title: { type: 'string', required: true },
};
class ArticleController extends Controller {
  /**
   * @api {post} /api/article 新增文章
   * @apiName 新增文章
   * @apiGroup Article
   * @apiDescription 默认新增的文章类型是草稿。新建文件、写入数据库、执行git commit，从而完成文章新建
   *
   * @apiPermission 普通用户
   *
   * @apiBody {string} title 文章标题
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {number} data 文章ID
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0101 传入参数错误
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0202 站点未初始化
   */
  async create() {
    this.ctx.validate(createRule);
    const createResult = await this.ctx.service.article.createNewArticle(
      this.ctx.request.body
    );
    if (createResult) return this.ctx.response.returnSuccess(createResult);
  }

  /**
   * @api {put} /api/article/:id 更新文章标题和内容
   * @apiName 更新文章标题和内容
   * @apiGroup Article
   * @apiDescription 管理员可以更新任意文章，普通用户只能更新自己写的文章
   *
   * @apiPermission 普通用户
   *
   * @apiParam {number} id 文章ID
   * @apiBody {string} title 文章标题
   * @apiBody {string} content 文章内容
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {number} data 文章ID
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0101 传入参数错误
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0201 没有权限
   * @apiError (错误码) A0202 站点未初始化
   * @apiError (错误码) A0300 文章不存在或已删除
   */
  async update() {
    this.ctx.validate(updateContentRule);
    const updateContentResult = await this.ctx.service.article.updateContent({
      id: this.ctx.params.id,
      ...this.ctx.request.body,
    });
    if (updateContentResult) {
      return this.ctx.response.returnSuccess(updateContentResult);
    }
  }

  /**
   * @api {GET} /api/article/:id/read_count 获取指定文章的阅读数
   * @apiName getArticleReadCount
   * @apiGroup Article
   *
   * @apiParam {number} id 文章ID
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {number} data 文章阅读数
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0202 站点未初始化
   * @apiError (错误码) A0300 文章不存在或已删除
   */
  async getReadCount() {
    const result = await this.ctx.service.article.getReadCount(
      this.ctx.params.id
    );

    if (result !== false) {
      return this.ctx.response.returnSuccess(result);
    }
  }

  /**
   * @api {GET} /api/article/count 获取文章总数
   * @apiName getArticleReadCount
   * @apiGroup Article
   *
   * @apiDescription 过滤条件不支持时，返回0
   *
   * @apiPermission 普通用户
   *
   * @apiQuery {string="publish_and_draft","publish","draft","deleted"} filter=publish_and_draft 过滤条件
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {number} data 文章数
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0202 站点未初始化
   */
  async getArticleCount() {
    return this.ctx.response.returnSuccess(
      await this.service.article.getArticleCount(this.ctx.request.query)
    );
  }

  /**
   * @api {GET} /api/article 获取文章列表
   * @apiName getArticles
   * @apiGroup Article
   *
   * @apiDescription
   *
   * @apiPermission 普通用户
   *
   * @apiQuery {number} [currentPage=1] 查询页码，默认1
   * @apiQuery {number} [pageSize=10] 每页条数，默认10
   * @apiQuery {number=0,1,2,3} [query.state] 筛选条件。0：已发布+草稿，1：已发布，2：草稿，3：已删除。其他值视为0
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiUse ArticleList
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0202 站点未初始化
   */
  async index() {
    try {
      const result = await this.ctx.service.article.getArticleList(
        this.ctx.request.query
      );
      return this.ctx.response.returnSuccess(result);
    } catch (error) {
      return this.ctx.response.returnFail(
        error.message,
        API_ERROR_CODE.PARAM_INVALID
      );
    }
  }

  /**
   * @api {POST} /api/article/:id/publish 发布文章
   * @apiName changeArticleState
   * @apiGroup Article
   *
   * @apiDescription 若已发布，也返回成功。若已删除，则失败。普通用户只能发布自己的文章，管理员可以发布所有文章。
   *
   * @apiPermission 普通用户
   *
   * @apiParam {number} id 文章ID
   *
   * @apiSuccess {Boolean} success 是否成功
   * @apiSuccess {null} data 无
   * @apiSuccess {string} errorCode 错误码
   * @apiSuccess {string} errorMessage 错误信息
   * @apiSuccess {string} traceId 请求id
   *
   * @apiError (错误码) A0200 需要登录
   * @apiError (错误码) A0201 没有权限
   * @apiError (错误码) A0202 站点未初始化
   * @apiError (错误码) A0300 文章不存在或已删除
   */
  async publishArticle() {
    const result = await this.ctx.service.article.publishArticle(
      this.ctx.params.id
    );
    if (result) {
      this.ctx.response.returnSuccess();
    }
  }
}

module.exports = ArticleController;
