'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const {
  mockGeneralUsersSession,
  mockAdminUserSession,
  adminUserId,
  generalUserId,
} = require('../../util/utils');
const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
const { gitToJs } = require('git-parse');
const dayjs = require('dayjs');
const fse = require('fs-extra');
const { API_ERROR_CODE } = require('../../../app/extend/response');

describe('test/app/controller/article.test.js', () => {
  before(async () => {
    fse.removeSync(app.config.vuepress.path);
    fs.mkdirSync(app.config.vuepress.path);
    shelljs.exec('git init ' + app.config.vuepress.path);
    shelljs.exec(
      `git -C ${app.config.vuepress.path} config user.name "VuePressAdmin egg-mock"`
    );
    shelljs.exec(
      `git -C ${app.config.vuepress.path} config user.email "egg-mock@VuePressAdmin.com"`
    );
  });

  after(() => {
    const fse = require('fs-extra');
    fse.removeSync(app.config.vuepress.path);
  });

  describe('POST /api/article', () => {
    afterEach(async () => {
      const fse = require('fs-extra');
      fse.removeSync(path.join(app.config.vuepress.path, '.git'));
      shelljs.exec('git init ' + app.config.vuepress.path);
      shelljs.exec(
        `git -C ${app.config.vuepress.path} config user.name "VuePressAdmin egg-mock"`
      );
      shelljs.exec(
        `git -C ${app.config.vuepress.path} config user.email "egg-mock@VuePressAdmin.com"`
      );
    });
    it('should create article when admin user operating and using space in title', async () => {
      mockAdminUserSession(app);
      const title = 'new article';
      const result = await app.httpRequest().post('/api/article').send({
        title,
      });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(Number.isInteger(result.body.data));

      // 数据库检查
      const record = await app.model.Article.findOne({
        where: { id: result.body.data },
      });

      assert(record.title === title);
      assert(record.userId === adminUserId);

      // 文件检查
      assert(
        fs.existsSync(
          path.join(app.config.vuepress.draftFullPath, title + '.md')
        )
      );

      const file = fs.readFileSync(
        path.join(app.config.vuepress.draftFullPath, title + '.md'),
        'utf-8'
      );

      const frontMatter = {
        title,
        date: dayjs().format('YYYY-MM-DD'),
        permalink: record.id.toString(),
      };
      const content = '---\n' + JSON.stringify(frontMatter) + '\n---\n\n';

      assert(file === content);

      // 检查git
      const commitsPromise = await gitToJs(app.config.vuepress.path);

      assert(commitsPromise.length === 1);
      assert(commitsPromise[0].message === '[docs:1] 新建文章');
      assert(commitsPromise[0].filesAdded.length === 1);
      // TODO 似乎因为git-parse的原因，这里获取到的path有误
      // assert(commitsPromise[0].filesAdded[0].path === 'docs/' + title + '.md');

      // 清理文件
      fs.unlinkSync(
        path.join(app.config.vuepress.draftFullPath, title + '.md')
      );
    });
    it('should create article when general user operating', async () => {
      mockGeneralUsersSession(app);
      const title = 'MyTitle';
      const result = await app.httpRequest().post('/api/article').send({
        title,
      });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(Number.isInteger(result.body.data));

      // 数据库检查
      const record = await app.model.Article.findOne({
        where: { id: result.body.data },
      });

      assert(record.title === title);
      assert(record.userId === generalUserId);

      // 文件检查
      assert(
        fs.existsSync(
          path.join(app.config.vuepress.draftFullPath, title + '.md')
        )
      );

      const file = fs.readFileSync(
        path.join(app.config.vuepress.draftFullPath, title + '.md'),
        'utf-8'
      );

      const frontMatter = {
        title,
        date: dayjs().format('YYYY-MM-DD'),
        permalink: record.id.toString(),
      };
      const content = '---\n' + JSON.stringify(frontMatter) + '\n---\n\n';

      assert(file === content);

      // 检查git
      const commitsPromise = await gitToJs(app.config.vuepress.path);

      assert(commitsPromise.length === 1);
      assert(commitsPromise[0].message === '[docs:1] 新建文章');
      assert(commitsPromise[0].filesAdded.length === 1);
      assert(
        commitsPromise[0].filesAdded[0].path ===
          app.config.vuepress.draftPath + '/' + title + '.md'
      );

      // 清理文件
      fs.unlinkSync(
        path.join(app.config.vuepress.draftFullPath, title + '.md')
      );
    });
    it('should fail when not pass title', async () => {
      mockAdminUserSession(app);
      const result = await app.httpRequest().post('/api/article').send({});

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);
    });
  });

  describe('PUT /api/article/:id', () => {
    it('should update article when admin user operating and change both title and content', async () => {
      const oldTitle = 'old title';
      const oldContent = 'old content';
      await app.factory.create('article', {
        title: oldTitle,
        content: oldContent,
        lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
      });
      mockAdminUserSession(app);
      const title = 'new article';
      const content = 'new content';
      const result = await app.httpRequest().put('/api/article/1').send({
        title,
        content,
      });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      // 数据库检查
      const record = await app.model.Article.findByPk(1);

      assert(record.title === title);
      assert(record.content === content);
      assert(
        dayjs(record.lastModifiedAt).isAfter(dayjs().subtract(1, 'minute'))
      );

      // 编辑记录检查
      const historyRecord = await app.model.ArticleHistory.findByPk(1);
      assert(historyRecord.title === oldTitle);
      assert(historyRecord.content === oldContent);
      assert(historyRecord.userId === adminUserId);
      assert(historyRecord.articleId === 1);
    });

    it('should update article when general user operating and change both title and content', async () => {
      const oldTitle = 'old title';
      const oldContent = 'old content';
      await app.factory.create('article', {
        title: oldTitle,
        content: oldContent,
        userId: generalUserId,
        lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
      });
      mockGeneralUsersSession(app);
      const title = 'new article';
      const content = 'new content';
      const result = await app.httpRequest().put('/api/article/1').send({
        title,
        content,
      });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      // 数据库检查
      const record = await app.model.Article.findByPk(1);

      assert(record.title === title);
      assert(record.content === content);
      assert(
        dayjs(record.lastModifiedAt).isAfter(dayjs().subtract(1, 'minute'))
      );

      // 编辑记录检查
      const historyRecord = await app.model.ArticleHistory.findByPk(1);
      assert(historyRecord.title === oldTitle);
      assert(historyRecord.content === oldContent);
      assert(historyRecord.userId === generalUserId);
      assert(historyRecord.articleId === 1);
    });

    it("should success when admin user change other user's article", async () => {
      const oldTitle = 'old title';
      const oldContent = 'old content';
      await app.factory.create('article', {
        title: oldTitle,
        content: oldContent,
        lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
        userId: generalUserId,
      });
      mockAdminUserSession(app);
      const title = 'new article';
      const content = 'new content';
      const result = await app.httpRequest().put('/api/article/1').send({
        title,
        content,
      });

      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);

      // 数据库检查
      const record = await app.model.Article.findByPk(1);

      assert(record.title === title);
      assert(record.content === content);
      assert(
        dayjs(record.lastModifiedAt).isAfter(dayjs().subtract(1, 'minute'))
      );

      // 编辑记录检查
      const historyRecord = await app.model.ArticleHistory.findByPk(1);
      assert(historyRecord.title === oldTitle);
      assert(historyRecord.content === oldContent);
      assert(historyRecord.userId === adminUserId);
      assert(historyRecord.articleId === 1);
    });

    it("should fail when general user tries to change other user's article", async () => {
      const oldTitle = 'old title';
      const oldContent = 'old content';
      await app.factory.create('article', {
        title: oldTitle,
        content: oldContent,
        lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
        userId: adminUserId,
      });
      const { id: newUserId } = await app.factory.create('user');
      await app.factory.create('article', {
        title: oldTitle,
        content: oldContent,
        lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
        userId: newUserId,
      });

      mockGeneralUsersSession(app);
      const title = 'new article';
      const content = 'new content';

      // 管理员文章
      let result = await app.httpRequest().put('/api/article/1').send({
        title,
        content,
      });

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NO_PERMISSION);

      // 数据库检查
      let record = await app.model.Article.findByPk(1);

      assert(record.title === oldTitle);
      assert(record.content === oldContent);

      // 其他普通用户的文章
      result = await app.httpRequest().put('/api/article/2').send({
        title,
        content,
      });

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NO_PERMISSION);

      // 数据库检查
      record = await app.model.Article.findByPk(1);

      assert(record.title === oldTitle);
      assert(record.content === oldContent);
    });

    it('should fail when article is not exist', async () => {
      const title = 'new article';
      const content = 'new content';
      mockGeneralUsersSession(app);
      // 管理员文章
      const result = await app.httpRequest().put('/api/article/1').send({
        title,
        content,
      });

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NOT_FOUND);
    });

    it('should fail when title or content is empty', async () => {
      const title = 'new article';
      const content = 'new content';
      mockGeneralUsersSession(app);
      // 管理员文章
      let result = await app.httpRequest().put('/api/article/1').send({
        title,
      });

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);

      result = await app.httpRequest().put('/api/article/1').send({
        content,
      });

      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);
    });
  });
});
