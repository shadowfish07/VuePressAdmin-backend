'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const Chance = require('chance');
const { API_ERROR_CODE } = require('../../../app/extend/response');
const chance = new Chance();
const setCookie = require('set-cookie-parser');
const dayjs = require('dayjs');
const { generalUserId } = require('../../util/utils');

describe('test/app/controller/statistics.test.js', () => {
  describe('POST /api/statistics', function () {
    it('should only update visitCount and count UV when using minimum params and no uv cookie', async () => {
      const hostname = 'test.com';
      const path = '/';
      const ip = chance.ip();
      const result = await app.httpRequest().post('/api/statistics').send({
        hostname,
        path,
        ip,
      });

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(setCookie.parse(result).find((item) => item.name === 'uv'));

      const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
      };

      const record = await app.model.VisitCount.findOne({
        where: {
          year: today.year,
          month: today.month,
          day: today.day,
          hour: today.hour,
        },
      });

      assert(record.pv === 1);
      assert(record.uv === 1);

      assert((await app.model.FullVisitHistory.count()) === 0);
    });
    it('should only update visitCount and not count UV when using minimum params and has uv cookie', async () => {
      app.mockCookies({
        uv: new Date().getDate().toString(),
      });
      const hostname = 'test.com';
      const path = '/';
      const ip = chance.ip();
      const result = await app.httpRequest().post('/api/statistics').send({
        hostname,
        path,
        ip,
      });

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(!setCookie.parse(result).find((item) => item.name === 'uv'));

      const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
      };

      const record = await app.model.VisitCount.findOne({
        where: {
          year: today.year,
          month: today.month,
          day: today.day,
          hour: today.hour,
        },
      });

      assert(record.pv === 1);
      assert(record.uv === 0);

      assert((await app.model.FullVisitHistory.count()) === 0);
    });
    it('should update visitCount and article and count UV when pass articleId and no uv cookie', async () => {
      const newArticle = await app.factory.create('article');
      const hostname = 'test.com';
      const path = '/';
      const ip = chance.ip();
      const result = await app.httpRequest().post('/api/statistics').send({
        hostname,
        path,
        ip,
        articleId: newArticle.id,
      });

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(setCookie.parse(result).find((item) => item.name === 'uv'));

      const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
      };

      const record = await app.model.VisitCount.findOne({
        where: {
          year: today.year,
          month: today.month,
          day: today.day,
          hour: today.hour,
        },
      });

      assert(record.pv === 1);
      assert(record.uv === 1);

      assert((await app.model.FullVisitHistory.count()) === 0);

      const article = await app.model.Article.findOne({
        where: {
          id: newArticle.id,
        },
      });
      assert(article.readCount === 1);
    });
    it('should update visitCount and article and not count UV when pass articleId and has uv cookie', async () => {
      app.mockCookies({
        uv: new Date().getDate().toString(),
      });
      const newArticle = await app.factory.create('article');
      const hostname = 'test.com';
      const path = '/';
      const ip = chance.ip();
      const result = await app.httpRequest().post('/api/statistics').send({
        hostname,
        path,
        ip,
        articleId: newArticle.id,
      });

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(!setCookie.parse(result).find((item) => item.name === 'uv'));

      const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
      };

      const record = await app.model.VisitCount.findOne({
        where: {
          year: today.year,
          month: today.month,
          day: today.day,
          hour: today.hour,
        },
      });

      assert(record.pv === 1);
      assert(record.uv === 0);

      assert((await app.model.FullVisitHistory.count()) === 0);

      const article = await app.model.Article.findOne({
        where: {
          id: newArticle.id,
        },
      });
      assert(article.readCount === 1);
    });
    it('should update visitCount, article and fullVisitHistory and count UV when fullVisitHistoryRecord is true and no uv cookie', async () => {
      const newArticle = await app.factory.create('article');
      await app.model.Config.create({
        key: 'fullVisitHistoryRecord',
        value: 1,
      });
      const hostname = 'test.com';
      const path = '/';
      const ip = chance.ip();
      const result = await app.httpRequest().post('/api/statistics').send({
        hostname,
        path,
        ip,
        articleId: newArticle.id,
      });

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(setCookie.parse(result).find((item) => item.name === 'uv'));

      const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
      };

      const record = await app.model.VisitCount.findOne({
        where: {
          year: today.year,
          month: today.month,
          day: today.day,
          hour: today.hour,
        },
      });

      assert(record.pv === 1);
      assert(record.uv === 1);

      const article = await app.model.Article.findOne({
        where: {
          id: newArticle.id,
        },
      });
      assert(article.readCount === 1);

      const fullRecord = await app.model.FullVisitHistory.findAll();
      assert(fullRecord.length === 1);
      assert(fullRecord[0].hostname === hostname);
      assert(fullRecord[0].path === path);
      assert(fullRecord[0].ip === ip);
      assert(fullRecord[0].uvCookie);
    });
    it('should update visitCount, article and fullVisitHistory and not count UV when fullVisitHistoryRecord is true and has uv cookie', async () => {
      const uvCookieValue = new Date().getDate().toString();
      app.mockCookies({
        uv: uvCookieValue,
      });
      const newArticle = await app.factory.create('article');
      await app.model.Config.create({
        key: 'fullVisitHistoryRecord',
        value: 1,
      });
      const hostname = 'test.com';
      const path = '/';
      const ip = chance.ip();
      const result = await app.httpRequest().post('/api/statistics').send({
        hostname,
        path,
        ip,
        articleId: newArticle.id,
      });

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(!setCookie.parse(result).find((item) => item.name === 'uv'));

      const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
      };

      const record = await app.model.VisitCount.findOne({
        where: {
          year: today.year,
          month: today.month,
          day: today.day,
          hour: today.hour,
        },
      });

      assert(record.pv === 1);
      assert(record.uv === 0);

      const article = await app.model.Article.findOne({
        where: {
          id: newArticle.id,
        },
      });
      assert(article.readCount === 1);

      const fullRecord = await app.model.FullVisitHistory.findAll();
      assert(fullRecord.length === 1);
      assert(fullRecord[0].hostname === hostname);
      assert(fullRecord[0].path === path);
      assert(fullRecord[0].ip === ip);
      assert((fullRecord[0].uvCookie = uvCookieValue));
    });
  });
});
