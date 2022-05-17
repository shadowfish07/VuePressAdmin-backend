'use strict';
const Service = require('egg').Service;
const dayjs = require('dayjs');
const NotExistError = require('../Error/NotExistError');
const { API_ERROR_CODE } = require('../extend/response');

class ArticleService extends Service {
  /**
   * 新建文件、写入数据库、执行git commit，从而完成文章新建
   *
   * 默认文件名为：文章标题.md
   *
   * 默认新增的文章类型是草稿
   *
   * 默认永久链接为文章id
   *
   * @param title {string} 文章标题，文件名
   * @returns {Promise<number>} 文章id
   */
  async createNewArticle({ title }) {
    const { ctx } = this;

    const filePath = getFilePath.call(this, title);

    const id = await updateDatabase.call(this, filePath);

    await createNewFile.call(this, title, filePath, id);

    try {
      await gitCommit(filePath, id);
    } catch (err) {
      ctx.logger.error(err);
    }

    return id;

    /**
     * 获取可用文件路径
     *
     * @param title {string} 文章标题
     * @returns {string} 文件路径
     */
    function getFilePath(title) {
      const documentRoot = this.app.config.vuepress.draftFullPath;
      const suffix = '.md';
      return ctx.helper.getAvailableFilePath(documentRoot, title, suffix);
    }

    /**
     * 基于模板创建文件
     *
     * @param title {string} 文章标题，文件名
     * @param filePath {string} 文件路径
     * @param id {number} 文章id
     */
    async function createNewFile(title, filePath, id) {
      const fse = require('fs-extra');

      const frontMatter = {
        meta: [{ id }],
        title,
        date: dayjs().format('YYYY-MM-DD'),
        permalink: id.toString(),
      };
      const content = '---\n' + JSON.stringify(frontMatter) + '\n---\n\n';
      fse.outputFile(filePath, content);
    }

    /**
     * 插入数据库记录
     *
     * 默认插入的文章状态为草稿
     *
     * @param filePath {string} 文件路径
     * @returns {Promise<number>} 文章id
     */
    async function updateDatabase(filePath) {
      const record = await this.app.model.Article.create({
        title,
        filePath,
        userId: ctx.userId,
        isDraft: 1,
      });
      record.permalink = record.id.toString();
      await record.save();
      return record.id;
    }

    /**
     * 执行git commit，等待shell执行完毕
     *
     * @param filePath {string} 文件路径
     * @param articleId {number} 文章id
     * @returns {Promise<unknown>}
     */
    async function gitCommit(filePath, articleId) {
      return new Promise(async (resolve, reject) => {
        await ctx.startShellTask(
          'commitArticle',
          [filePath, articleId],
          (isFailed) => {
            if (!isFailed) {
              resolve();
            } else {
              reject(new Error('Git commit failed'));
            }
          }
        );
      });
    }
  }

  /**
   * 更新文章内容和标题，会进行权限判断
   *
   * 管理员或文章原作者有权限
   * @param id {number} 文章id
   * @param content {string} 文章内容
   * @param title {string} 文章标题
   * @returns {Promise<boolean>} 是否更新成功
   */
  async updateContent({ id, content, title }) {
    try {
      if (!(await this.canUpdateContent(id))) {
        return this.ctx.response.returnFail(
          '无权限修改文章',
          API_ERROR_CODE.NO_PERMISSION
        );
      }
    } catch (err) {
      if (err instanceof NotExistError) {
        return this.ctx.response.returnFail(
          '文章不存在',
          API_ERROR_CODE.NOT_FOUND
        );
      }
      throw err;
    }

    const article = await this.app.model.Article.findByPk(id);

    await this.app.model.ArticleHistory.create({
      articleId: id,
      userId: this.ctx.userId,
      content: article.content,
      title: article.title,
    });

    article.content = content;
    article.title = title;
    article.lastModifiedAt = dayjs().utc();

    await article.save();

    return true;
  }

  /**
   * 检查当前用户是否有权限修改文章内容/标题
   *
   * 管理员或文章原作者有权限
   *
   * @param id {number} 文章id
   * @returns {Promise<boolean>}
   * @throws {NotExistError} 文章不存在
   */
  async canUpdateContent(id) {
    if (this.ctx.session.role === 'admin') {
      return true;
    }

    const article = await this.app.model.Article.findByPk(id);
    if (!article) throw new NotExistError('文章不存在');
    return article.userId === this.ctx.userId;
  }

  /**
   * 获取指定文章阅读量
   *
   * @param id {number} 文章id
   * @returns {Promise<number|boolean>} 文章存在则返回阅读量，否则返回false
   */
  async getReadCount(id) {
    const { readCount } =
      (await this.app.model.Article.findByPk(id, {
        attributes: ['readCount'],
      })) ?? {};

    if (readCount === undefined) {
      return this.ctx.response.returnFail(
        '文章不存在',
        API_ERROR_CODE.NOT_FOUND
      );
    }
    return readCount;
  }
}

module.exports = ArticleService;
