'use strict';

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
   * @api {post} /article 新增文章
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
   * @api PUT /article/:id
   * @apiName 更新文章标题和内容
   * @api {put} /article/:id 更新文章标题和内容
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
   * @apiError (错误码) A0201 没有权限
   * @apiError (错误码) A0202 站点未初始化
   * @apiError (错误码) A0300 文章不存在
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
}

module.exports = ArticleController;
