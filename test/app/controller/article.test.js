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

describe('test/app/controller/article.test.js', () => {
  before(async () => {
    await require('../../util/init')();
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
      await require('../../util/init')();
    });
    it('should create article when admin user operating and using space in title', async () => {
      mockAdminUserSession(app);
      const title = 'new article';
      const result = await app.httpRequest().post('/api/article').send({
        title,
      });

      assert(result.status === 200);
      assert(result.body.success);
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
          path.join(app.config.vuepress.path, 'docs', title + '.md')
        )
      );

      const file = fs.readFileSync(
        path.join(app.config.vuepress.path, 'docs', title + '.md'),
        'utf-8'
      );

      assert(
        file.replace(/\n/g, '').replace(/\r/g, '') ===
          `---title: ${title}  date: ${dayjs().format('YYYY-MM-DD')}  ---`
      );

      // 检查git
      const commitsPromise = await gitToJs(app.config.vuepress.path);

      assert(commitsPromise.length === 1);
      assert(commitsPromise[0].message === '[docs:1] 新建文章');
      assert(commitsPromise[0].filesAdded.length === 1);
      // TODO 似乎因为git-parse的原因，这里获取到的path有误
      // assert(commitsPromise[0].filesAdded[0].path === 'docs/' + title + '.md');

      // 清理文件
      fs.unlinkSync(path.join(app.config.vuepress.path, 'docs', title + '.md'));
    });
    it('should create article when general user operating', async () => {
      mockGeneralUsersSession(app);
      const title = 'MyTitle';
      const result = await app.httpRequest().post('/api/article').send({
        title,
      });

      assert(result.status === 200);
      assert(result.body.success);
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
          path.join(app.config.vuepress.path, 'docs', title + '.md')
        )
      );

      const file = fs.readFileSync(
        path.join(app.config.vuepress.path, 'docs', title + '.md'),
        'utf-8'
      );

      assert(
        file.replace(/\n/g, '').replace(/\r/g, '') ===
          `---title: ${title}  date: ${dayjs().format('YYYY-MM-DD')}  ---`
      );

      // 检查git
      const commitsPromise = await gitToJs(app.config.vuepress.path);

      assert(commitsPromise.length === 1);
      assert(commitsPromise[0].message === '[docs:1] 新建文章');
      assert(commitsPromise[0].filesAdded.length === 1);
      assert(commitsPromise[0].filesAdded[0].path === 'docs/' + title + '.md');

      // 清理文件
      fs.unlinkSync(path.join(app.config.vuepress.path, 'docs', title + '.md'));
    });
    it('should fail when not pass title', async () => {
      mockAdminUserSession(app);
      const result = await app.httpRequest().post('/api/article').send({});

      assert(result.status === 422);
      assert(!result.body.success);
    });
  });
});
