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
   * 新建文件、写入数据库、执行git commit，从而完成文章新建
   *
   * 默认新增的文章类型是草稿
   *
   * @api POST /article
   * @apiName 新增文章
   */
  async create() {
    this.ctx.validate(createRule);
    const createResult = await this.ctx.service.article.createNewArticle(
      this.ctx.request.body
    );
    if (createResult) return this.ctx.response.returnSuccess(createResult);
  }

  /**
   * 更新文章标题和内容
   *
   * 管理员可以更新任意文章，普通用户只能更新自己写的文章
   * @api PUT /article/:id
   * @apiName 更新文章标题和内容
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