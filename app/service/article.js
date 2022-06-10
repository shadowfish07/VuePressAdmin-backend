'use strict';
const Service = require('egg').Service;
const dayjs = require('dayjs');
const NotExistError = require('../Error/NotExistError');
const ParamsError = require('../Error/ParamsError');
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
   * @param body {object} request body
   * @param body.title {string} 文章标题，文件名
   * @returns {Promise<number>} 文章id
   */
  async createNewArticle ({ title }) {
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
    function getFilePath (title) {
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
    async function createNewFile (title, filePath, id) {
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
    async function updateDatabase (filePath) {
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
    async function gitCommit (filePath, articleId) {
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
   * @param body {object} request body
   * @param body.id {number} 文章id
   * @param body.content {string} 文章内容
   * @param body.title {string} 文章标题
   * @returns {Promise<boolean>} 是否更新成功
   */
  async updateContent ({ id, content, title }) {
    try {
      if (!(await this.canEditArticle(id))) {
        return this.ctx.response.returnFail(
          '无权限修改文章',
          API_ERROR_CODE.NO_PERMISSION
        );
      }
    } catch (err) {
      if (err instanceof NotExistError) {
        return this.ctx.response.returnFail(
          '文章不存在或已删除',
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

    // TODO 更新文件

    return true;
  }

  /**
   * 检查当前用户是否有权限修改文章内容/标题，发布文章
   *
   * 已删除的文章不能修改
   *
   * 管理员或文章原作者有权限
   *
   * @param id {number} 文章id
   * @returns {Promise<boolean>} 是否有权限
   * @throws {NotExistError} 文章不存在或已删除
   */
  async canEditArticle (id) {
    const article = await this.app.model.Article.findByPk(id);
    if (!article) throw new NotExistError('文章不存在或已删除');
    if (this.ctx.session.role === 'admin') {
      return true;
    }
    return article.userId === this.ctx.userId;
  }

  /**
   * 获取指定文章阅读量
   *
   * @param id {number} 文章id
   * @returns {Promise<number|boolean>} 文章存在则返回阅读量，否则返回false
   */
  async getReadCount (id) {
    const { readCount } =
      (await this.app.model.Article.findByPk(id, {
        attributes: ['readCount'],
      })) ?? {};

    if (readCount === undefined) {
      return this.ctx.response.returnFail(
        '文章不存在或已删除',
        API_ERROR_CODE.NOT_FOUND
      );
    }
    return readCount;
  }

  /**
   * 获取文章数量
   * @param query {object} request query
   * @param [query.filter=publish_and_draft] {string} 筛选条件，支持publish_and_draft, publish, draft,deleted。若为其他值，返回0
   * @returns {number} 文章数量
   */
  async getArticleCount ({ filter = 'publish_and_draft' }) {
    const { Op } = require('sequelize');

    if (filter === 'deleted') {
      return await this.app.model.Article.count({
        where: {
          deletedAt: {
            [Op.not]: null,
          },
        },
        paranoid: false,
      });
    }

    if (filter === 'draft') {
      return await this.app.model.Article.count({
        where: {
          isDraft: 1,
        },
      });
    }

    if (filter === 'publish') {
      return await this.app.model.Article.count({
        where: {
          isDraft: 0,
        },
      });
    }

    if (filter === 'publish_and_draft') {
      return await this.app.model.Article.count();
    }

    return 0;
  }

  /**
   * 获取文章数量
   * @param query {object} request query
   * @param [query.state=0,1,2,3] {number} 筛选条件。0：已发布+草稿，1：已发布，2：草稿，3：已删除。其他值视为0
   * @returns {number} 文章数量
   */
  async getArticleList ({ currentPage = 1, pageSize = 10, state = 0 }) {
    const { Op, fn, col } = require('sequelize');

    currentPage = parseInt(currentPage, 10);
    pageSize = parseInt(pageSize, 10);
    state = parseInt(state, 10);

    if (isNaN(currentPage) || isNaN(pageSize)) {
      throw new ParamsError('参数错误');
    }

    if ([0, 1, 2, 3].includes(state) === -1) {
      state = 0;
    }

    const paranoid = state !== 3;
    const where = {};

    if (state === 3) {
      where.deletedAt = {
        [Op.not]: null,
      };
    } else if (state === 1) {
      where.isDraft = 0;
    } else if (state === 2) {
      where.isDraft = 1;
    }

    const offset = (currentPage - 1) * pageSize;
    const { count, rows } = await this.app.model.Article.findAndCountAll({
      offset,
      limit: pageSize,
      where,
      paranoid,
      attributes: [
        'title',
        'readCount',
        'createdAt',
        'lastModifiedAt',
        'userId',
        'id',
        'permalink',
        [
          fn('IIF', col('deleted_at'), 2, fn('IIF', col('is_draft'), 0, 1)),
          'state',
        ],
      ],
      include: [
        {
          model: this.app.model.User,
          as: 'author',
          attributes: ['id', 'username'],
        },
      ],
    });

    return {
      total: count,
      pageSize,
      current: currentPage,
      list: rows,
    };
  }

  /**
   * 发布文章，已发布的文章直接返回成功
   *
   * @param {number} id 文章ID
   * @returns {Promise<boolean>} 是否发布成功
   */
  async publishArticle (id) {
    const { ctx } = this;
    try {
      if (!(await this.canEditArticle(id))) {
        return this.ctx.response.returnFail(
          '无权限发布文章',
          API_ERROR_CODE.NO_PERMISSION
        );
      }
    } catch (err) {
      if (err instanceof NotExistError) {
        return this.ctx.response.returnFail(
          '文章不存在或已删除',
          API_ERROR_CODE.NOT_FOUND
        );
      }
      throw err;
    }

    const article = await this.app.model.Article.findByPk(id);

    if (!article.isDraft) {
      return this.ctx.response.returnSuccess();
    }

    const filePath = getFilePath.call(this, article.title);

    const fs = require('fs-extra');

    fs.moveSync(article.filePath, filePath);

    await gitCommit(id, article.filePath, filePath);

    article.filePath = filePath;

    article.isDraft = 0;

    await article.save();

    return true;

    /**
     * 获取可用文件路径
     *
     * @param title {string} 文章标题
     * @returns {string} 文件路径
     */
    function getFilePath (title) {
      const documentRoot = this.app.config.vuepress.docsFullPath;
      const suffix = '.md';
      return ctx.helper.getAvailableFilePath(documentRoot, title, suffix);
    }

    /**
     * 执行git commit，等待shell执行完毕
     *
     * @param oldPath {string} 文件移动前路径
     * @param newPath {string} 文件移动后路径
     * @param articleId {number} 文章id
     * @returns {Promise<unknown>}
     */
    async function gitCommit (articleId, oldPath, newPath) {
      return new Promise(async (resolve, reject) => {
        await ctx.startShellTask(
          'commitChangingArticleState',
          [articleId, oldPath, newPath],
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
}

module.exports = ArticleService;
