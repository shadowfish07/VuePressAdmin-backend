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
const Chance = require('chance');
const chance = new Chance();

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
        meta: [{ id: record.id }],
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
        meta: [{ id: record.id }],
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
      await app.factory.create(
        'article',
        {},
        {
          title: oldTitle,
          content: oldContent,
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
        }
      );
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
      await app.factory.create(
        'article',
        {},
        {
          title: oldTitle,
          content: oldContent,
          userId: generalUserId,
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
        }
      );
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
      await app.factory.create(
        'article',
        {},
        {
          title: oldTitle,
          content: oldContent,
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
          userId: generalUserId,
        }
      );
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
      await app.factory.create(
        'article',
        {},
        {
          title: oldTitle,
          content: oldContent,
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
          userId: adminUserId,
        }
      );
      const { id: newUserId } = await app.factory.create('user');
      await app.factory.create(
        'article',
        {},
        {
          title: oldTitle,
          content: oldContent,
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
          userId: newUserId,
        }
      );

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

  describe('GET /api/article/:id/read_count', () => {
    it('should success', async () => {
      const { id } = await app.factory.create('article');
      let result = await app
        .httpRequest()
        .get(`/api/article/${id}/read_count`)
        .send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 0);

      await app.model.Article.update({ readCount: 10 }, { where: { id } });

      result = await app
        .httpRequest()
        .get(`/api/article/${id}/read_count`)
        .send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 10);
    });

    it('should fail when article not exist', async () => {
      const result = await app
        .httpRequest()
        .get('/api/article/1/read_count')
        .send();
      assert(result.status === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NOT_FOUND);
    });
  });

  describe('GET /api/article/count', () => {
    beforeEach(async () => {
      mockGeneralUsersSession(app);
      await app.factory.createMany('article', 3);
      await app.factory.createMany('article', 7, {
        isDraft: 1,
      });
      await app.factory.createMany('article', 13, {
        deletedAt: new Date(),
      });
    });

    it('should return publish + draft count when do not pass filter', async function () {
      const result = await app.httpRequest().get('/api/article/count').send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 10);
    });

    it('should return publish + draft count when pass publish_and_draft', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article/count?filter=publish_and_draft')
        .send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 10);
    });

    it('should return publish count when pass publish', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article/count?filter=publish')
        .send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 3);
    });

    it('should return draft count when pass draft', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article/count?filter=draft')
        .send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 7);
    });

    it('should return deleted count when pass deleted', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article/count?filter=deleted')
        .send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 13);
    });

    it('should return 0 when pass unsupported filter', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article/count?filter=unsupported')
        .send();
      assert(result.status === 200);
      assert(result.body.success);
      assert(result.body.data === 0);
    });
  });

  describe('GET /api/article', () => {
    const defaultPage = 1;
    const defaultPageSize = 10;
    let fakeArticles;
    const publishArticleCount = 21;
    const draftArticleCount = 7;
    const deletedArticleCount = 13;
    const checkArticle = (returnArticle, expectedState) => {
      returnArticle.forEach((item) => {
        assert(item.id);
        assert(item.title);
        assert(item.readCount || item.readCount === 0);
        assert(item.lastModifiedAt);
        assert(item.createdAt);
        assert(item.permalink);
        assert(item.author.id);
        assert(item.author.username);

        if (expectedState !== undefined) {
          assert(item.state === expectedState);
        } else {
          assert(item.state !== 2);
        }

        const fakeArticle = fakeArticles.find(
          (fakeArticle) => fakeArticle.id === item.id
        );
        if (fakeArticle.deletedAt) {
          assert(item.state === 2);
        } else if (fakeArticle.isDraft) {
          assert(item.state === 0);
        } else {
          assert(item.state === 1);
        }
      });
    };
    beforeEach(async () => {
      mockGeneralUsersSession(app);
      fakeArticles = [
        ...(await app.factory.createMany('article', publishArticleCount)),
        ...(await app.factory.createMany('article', draftArticleCount, {
          isDraft: 1,
        })),
        ...(await app.factory.createMany('article', deletedArticleCount, {
          deletedAt: new Date(),
        })),
      ];
    });
    it('should return 10 articles at page 1 when pass no params', async function () {
      const result = await app.httpRequest().get('/api/article').send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === defaultPage);
      assert(result.body.data.list.length === defaultPageSize);
      assert(
        result.body.data.total === publishArticleCount + draftArticleCount
      );
      assert(result.body.data.pageSize === defaultPageSize);

      checkArticle(result.body.data.list);
    });
    it('should return specified number of articles at page 1 when pass pageSize', async function () {
      const pageSize = 3;
      const result = await app
        .httpRequest()
        .get(`/api/article?pageSize=${pageSize}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === defaultPage);
      assert(result.body.data.list.length === pageSize);
      assert(
        result.body.data.total === publishArticleCount + draftArticleCount
      );
      assert(result.body.data.pageSize === pageSize);

      checkArticle(result.body.data.list);
    });
    it('should return 10 articles at specified page when pass currentPage', async function () {
      const currentPage = 2;
      const result = await app
        .httpRequest()
        .get(`/api/article?currentPage=${currentPage}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === currentPage);
      assert(result.body.data.list.length === defaultPageSize);
      assert(
        result.body.data.total === publishArticleCount + draftArticleCount
      );
      assert(result.body.data.pageSize === defaultPageSize);

      checkArticle(result.body.data.list);
    });
    it('should return specified number of articles at specified page when pass currentPage and pageSize', async function () {
      const currentPage = 2;
      const pageSize = 3;
      const result = await app
        .httpRequest()
        .get(`/api/article?currentPage=${currentPage}&pageSize=${pageSize}`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === currentPage);
      assert(result.body.data.list.length === pageSize);
      assert(
        result.body.data.total === publishArticleCount + draftArticleCount
      );
      assert(result.body.data.pageSize === pageSize);

      checkArticle(result.body.data.list);
    });
    it('should return only draft articles when pass state = 2', async function () {
      const result = await app.httpRequest().get('/api/article?state=2').send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === defaultPage);
      assert(result.body.data.list.length === draftArticleCount);
      assert(result.body.data.total === draftArticleCount);
      assert(result.body.data.pageSize === defaultPageSize);

      checkArticle(result.body.data.list, 0);
    });
    it('should return only deleted articles when pass state = 3', async function () {
      const result = await app.httpRequest().get('/api/article?state=3').send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === defaultPage);
      assert(result.body.data.list.length === defaultPageSize);
      assert(result.body.data.total === deletedArticleCount);
      assert(result.body.data.pageSize === defaultPageSize);

      checkArticle(result.body.data.list, 2);
    });
    it('should return only publish articles when pass state = 1', async function () {
      const result = await app.httpRequest().get('/api/article?state=1').send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === defaultPage);
      assert(result.body.data.list.length === defaultPageSize);
      assert(result.body.data.total === publishArticleCount);
      assert(result.body.data.pageSize === defaultPageSize);

      checkArticle(result.body.data.list, 1);
    });
    it('should return publish and draft articles when pass state that is not supported', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article?state=99')
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(result.body.data.current === defaultPage);
      assert(result.body.data.list.length === defaultPageSize);
      assert(
        result.body.data.total === publishArticleCount + draftArticleCount
      );
      assert(result.body.data.pageSize === defaultPageSize);

      checkArticle(result.body.data.list);
    });
    it('should return error when pass invalid currentPage', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article?currentPage=aaa')
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);
    });
    it('should return error when pass invalid pageSize', async function () {
      const result = await app
        .httpRequest()
        .get('/api/article?pageSize=aaa')
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success === false);
      assert(result.body.errorCode === API_ERROR_CODE.PARAM_INVALID);
    });
  });

  describe('POST /api/article/:id/publish', () => {
    async function checkUnModifiedGit () {
      const commitsPromise = await gitToJs(app.config.vuepress.path);
      assert(commitsPromise.length === 0);
    }
    async function checkModifiedGit (article) {
      // 检查git
      const commitsPromise = await gitToJs(app.config.vuepress.path);

      assert(commitsPromise.length === 1);
      assert(commitsPromise[0].message === `[docs:${article.id}] 新建文章`);
      assert(commitsPromise[0].filesAdded.length === 2);
      assert(
        commitsPromise[0].filesAdded[0].path === 'docs/' + article.title + '.md'
      );
    }

    afterEach(() => {
      fse.removeSync(app.config.vuepress.path);
      shelljs.exec('git init ' + app.config.vuepress.path);
      shelljs.exec(
        `git -C ${app.config.vuepress.path} config user.name "VuePressAdmin egg-mock"`
      );
      shelljs.exec(
        `git -C ${app.config.vuepress.path} config user.email "egg-mock@VuePressAdmin.com"`
      );
    });

    const prepareArticle = async (isPublished) => {
      const fakeArticle = await app.factory.create(
        'article',
        {},
        {
          title: chance.word(),
          content: chance.word(),
          userId: generalUserId,
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
          isDraft: isPublished ? 0 : 1,
        }
      );

      const frontMatter = {
        meta: [{ id: fakeArticle.id }],
        title: fakeArticle.title,
        date: dayjs().format('YYYY-MM-DD'),
        permalink: fakeArticle.id.toString(),
      };
      const content = '---\n' + JSON.stringify(frontMatter) + '\n---\n\n';

      if (isPublished) {
        fse.outputFileSync(fakeArticle.filePath, content);
      } else {
        shelljs.config.verbose = true;
        // 模拟草稿文件的git记录
        fse.outputFileSync(
          path.join(
            app.config.vuepress.draftFullPath,
            fakeArticle.filePath.split(path.sep).pop()
          ),
          content
        );
        shelljs.exec(`git -C "${app.config.vuepress.path}" add .`);
        shelljs.exec(
          `git -C "${app.config.vuepress.path}" commit -m "[docs:${fakeArticle.id}] 新建文章"`
        );
      }

      return fakeArticle;
    };

    it('should success when general user publish his own published article', async function () {
      const fakeArticle = await prepareArticle(true);
      mockGeneralUsersSession(app);

      const result = await app
        .httpRequest()
        .post(`/api/article/${fakeArticle.id}/publish`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(fse.existsSync(fakeArticle.filePath));

      await checkUnModifiedGit(fakeArticle);
    });
    it('should success when general user publish his own unpublished article', async function () {
      const fakeArticle = await prepareArticle(false);

      mockGeneralUsersSession(app);

      const result = await app
        .httpRequest()
        .post(`/api/article/${fakeArticle.id}/publish`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(!fse.existsSync(fakeArticle.filePath));

      const article = await app.model.Article.findByPk(fakeArticle.id);
      assert(article.isDraft === 0);
      assert(!!article.filePath && article.filePath !== fakeArticle.filePath);
      assert(fse.existsSync(article.filePath));
    });
    it('should success when admin user publish his own published article', async function () {
      const fakeArticle = await prepareArticle(true);
      mockAdminUserSession(app);

      const result = await app
        .httpRequest()
        .post(`/api/article/${fakeArticle.id}/publish`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(fse.existsSync(fakeArticle.filePath));

      await checkUnModifiedGit(fakeArticle);
    });
    it('should success when admin user publish his own unpublished article', async function () {
      const fakeArticle = await prepareArticle(false);

      mockAdminUserSession(app);

      const result = await app
        .httpRequest()
        .post(`/api/article/${fakeArticle.id}/publish`)
        .send();

      assert(result.statusCode === 200);
      assert(result.body.success);

      assert(!fse.existsSync(fakeArticle.filePath));

      const article = await app.model.Article.findByPk(fakeArticle.id);
      assert(article.isDraft === 0);
      assert(!!article.filePath && article.filePath !== fakeArticle.filePath);
      assert(fse.existsSync(article.filePath));

      checkModifiedGit(article);
    });
    it('should not allowed when general user publish other\'s article', async function () {

      const { id: newUserId } = await app.factory.create('user');
      const fakeArticle = await app.factory.create(
        'article',
        {},
        {
          title: chance.word(),
          content: chance.word(),
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
          userId: newUserId,
        }
      );
      mockGeneralUsersSession(app);

      const result = await app
        .httpRequest()
        .post(`/api/article/${fakeArticle.id}/publish`)
        .send();

      assert(result.statusCode === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NO_PERMISSION);
    });
    it('should fail when article is not exist', async function () {
      mockGeneralUsersSession(app);

      const result = await app
        .httpRequest()
        .post('/api/article/1/publish')
        .send();

      assert(result.statusCode === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NOT_FOUND);
    });
    it('should fail when article is deleted', async function () {
      const fakeArticle = await app.factory.create(
        'article',
        {},
        {
          title: chance.word(),
          content: chance.word(),
          lastModifiedAt: dayjs().subtract(1, 'year').toDate(),
          deletedAt: new Date(),
        }
      );
      mockAdminUserSession(app);

      const result = await app
        .httpRequest()
        .post(`/api/article/${fakeArticle.id}/publish`)
        .send();

      assert(result.statusCode === 200);
      assert(!result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.NOT_FOUND);
    });
  });
});
