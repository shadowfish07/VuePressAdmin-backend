'use strict';
const Service = require('egg').Service;
const fs = require('fs');
const dayjs = require('dayjs');

class ArticleService extends Service {
  /**
   * 新建文件、写入数据库、执行git commit，从而完成文章新建
   *
   * @param title {title} 文章标题，文件名
   * @returns {Promise<number>} 文章id
   */
  async createNewArticle({ title }) {
    const { ctx } = this;

    const filePath = await createNewFile.call(this, title);

    const id = await updateDatabase.call(this, filePath);

    try {
      await gitCommit(filePath, id);
    } catch (err) {
      ctx.logger.error(err);
    }

    return id;

    /**
     * 基于模板创建文件
     *
     * @param title {title} 文章标题，文件名
     * @returns {Promise<string>} 文件路径
     */
    async function createNewFile(title) {
      const documentRoot = this.app.config.vuepress.path + '/docs';
      const suffix = '.md';
      const filePath = ctx.helper.getAvailableFilePath(
        documentRoot,
        title,
        suffix
      );
      const path = require('path');
      let template = fs.readFileSync(
        path.join(process.cwd(), 'templates', 'newArticleTemplate.md'),
        'utf-8'
      );
      template = template
        .replace('${title}', title)
        .replace('${date}', dayjs().format('YYYY-MM-DD'));
      const fse = require('fs-extra');
      fse.outputFile(filePath, template);

      return filePath;
    }

    /**
     * 插入数据库记录
     *
     * @param filePath {string} 文件路径
     * @returns {Promise<number>} 文章id
     */
    async function updateDatabase(filePath) {
      const { id } = await this.app.model.Article.create({
        title,
        filePath,
        readCount: 0,
        lastModifiedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        userId: ctx.userId,
      });
      return id;
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
}

module.exports = ArticleService;
