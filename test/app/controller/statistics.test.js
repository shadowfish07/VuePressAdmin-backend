'use strict';

const { app, assert } = require('egg-mock/bootstrap');
const Chance = require('chance');
const { API_ERROR_CODE } = require('../../../app/extend/response');
const chance = new Chance();
const setCookie = require('set-cookie-parser');
const { mockGeneralUsersSession } = require('../../util/utils');

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

    it('should update visitCount and article and count UV when path is article permalink and no uv cookie', async () => {
      const newArticle = await app.factory.create('article');
      const hostname = 'test.com';
      const path = '/' + newArticle.permalink + '/';
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

      const article = await app.model.Article.findOne({
        where: {
          id: newArticle.id,
        },
      });
      assert(article.readCount === 1);
    });
    it('should update visitCount and article and not count UV when is article permalink and has uv cookie', async () => {
      app.mockCookies({
        uv: new Date().getDate().toString(),
      });
      const newArticle = await app.factory.create('article');
      const hostname = 'test.com';
      const path = '/' + newArticle.permalink + '/';
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

  describe('GET /api/statistics/visit_count', function () {
    it('should return simple number when pass no params', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const expectPV = fakeData.reduce((sum, item) => sum + item.pv, 0);
      const expectUV = fakeData.reduce((sum, item) => sum + item.uv, 0);

      const result = await app.httpRequest().get('/api/statistics/visit_count');

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data.pv === expectPV);
      assert(result.body.data.uv === expectUV);
    });

    it('should return simple number when pass year', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const expectPV = fakeData
        .filter((item) => item.year === fakeData[0].year)
        .reduce((sum, item) => sum + item.pv, 0);
      const expectUV = fakeData
        .filter((item) => item.year === fakeData[0].year)
        .reduce((sum, item) => sum + item.uv, 0);

      const result = await app
        .httpRequest()
        .get(`/api/statistics/visit_count?year=${fakeData[0].year}`);

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data.pv === expectPV);
      assert(result.body.data.uv === expectUV);
    });

    it('should return simple number when pass year and month', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const expectPV = fakeData
        .filter(
          (item) =>
            item.year === fakeData[0].year && item.month === fakeData[0].month
        )
        .reduce((sum, item) => sum + item.pv, 0);
      const expectUV = fakeData
        .filter(
          (item) =>
            item.year === fakeData[0].year && item.month === fakeData[0].month
        )
        .reduce((sum, item) => sum + item.uv, 0);

      const result = await app
        .httpRequest()
        .get(
          `/api/statistics/visit_count?year=${fakeData[0].year}&month=${fakeData[0].month}`
        );

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data.pv === expectPV);
      assert(result.body.data.uv === expectUV);
    });

    it('should return simple number when pass year, month and day', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const expectPV = fakeData
        .filter(
          (item) =>
            item.year === fakeData[0].year &&
            item.month === fakeData[0].month &&
            item.day === fakeData[0].day
        )
        .reduce((sum, item) => sum + item.pv, 0);
      const expectUV = fakeData
        .filter(
          (item) =>
            item.year === fakeData[0].year &&
            item.month === fakeData[0].month &&
            item.day === fakeData[0].day
        )
        .reduce((sum, item) => sum + item.uv, 0);

      const result = await app
        .httpRequest()
        .get(
          `/api/statistics/visit_count?year=${fakeData[0].year}&month=${fakeData[0].month}&day=${fakeData[0].day}`
        );

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data.pv === expectPV);
      assert(result.body.data.uv === expectUV);
    });

    it('should ignore month and day, return simple number when pass month and day', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const expectPV = fakeData.reduce((sum, item) => sum + item.pv, 0);
      const expectUV = fakeData.reduce((sum, item) => sum + item.uv, 0);

      const result = await app
        .httpRequest()
        .get(
          `/api/statistics/visit_count?month=${fakeData[0].month}&day=${fakeData[0].day}`
        );

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data.pv === expectPV);
      assert(result.body.data.uv === expectUV);
    });

    it('should return details when pass detail', async function () {
      mockGeneralUsersSession(app);
      await app.factory.createMany('visitCount', 100);

      const result = await app
        .httpRequest()
        .get('/api/statistics/visit_count?detail=true');

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data.length === 100);
      assert(result.body.data[0].pv !== undefined);
      assert(result.body.data[0].uv !== undefined);
      assert(result.body.data[0].year !== undefined);
      assert(result.body.data[0].month !== undefined);
      assert(result.body.data[0].day !== undefined);
      assert(result.body.data[0].hour !== undefined);
    });

    it('should return details when pass detail and year', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const result = await app
        .httpRequest()
        .get(
          `/api/statistics/visit_count?detail=true&year=${fakeData[0].year}`
        );

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(
        result.body.data.length ===
          fakeData.filter((item) => {
            return item.year === fakeData[0].year;
          }).length
      );
      assert(result.body.data[0].pv !== undefined);
      assert(result.body.data[0].uv !== undefined);
      assert(result.body.data[0].year !== undefined);
      assert(result.body.data[0].month !== undefined);
      assert(result.body.data[0].day !== undefined);
      assert(result.body.data[0].hour !== undefined);
      result.body.data.forEach((item) => {
        assert(item.year === fakeData[0].year);
      });
    });

    it('should return details when pass detail and year and month', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const result = await app
        .httpRequest()
        .get(
          `/api/statistics/visit_count?detail=true&year=${fakeData[0].year}&month=${fakeData[0].month}`
        );

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(
        result.body.data.length ===
          fakeData.filter((item) => {
            return (
              item.year === fakeData[0].year && item.month === fakeData[0].month
            );
          }).length
      );
      assert(result.body.data[0].pv !== undefined);
      assert(result.body.data[0].uv !== undefined);
      assert(result.body.data[0].year !== undefined);
      assert(result.body.data[0].month !== undefined);
      assert(result.body.data[0].day !== undefined);
      assert(result.body.data[0].hour !== undefined);
      result.body.data.forEach((item) => {
        assert(item.year === fakeData[0].year);
        assert(item.month === fakeData[0].month);
      });
    });

    it('should return details when pass detail, year, month and day', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const result = await app
        .httpRequest()
        .get(
          `/api/statistics/visit_count?detail=true&year=${fakeData[0].year}&month=${fakeData[0].month}&day=${fakeData[0].day}`
        );

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(
        result.body.data.length ===
          fakeData.filter((item) => {
            return (
              item.year === fakeData[0].year &&
              item.month === fakeData[0].month &&
              item.day === fakeData[0].day
            );
          }).length
      );
      assert(result.body.data[0].pv !== undefined);
      assert(result.body.data[0].uv !== undefined);
      assert(result.body.data[0].year !== undefined);
      assert(result.body.data[0].month !== undefined);
      assert(result.body.data[0].day !== undefined);
      assert(result.body.data[0].hour !== undefined);
      result.body.data.forEach((item) => {
        assert(item.year === fakeData[0].year);
        assert(item.month === fakeData[0].month);
        assert(item.day === fakeData[0].day);
      });
    });

    it('should ignore month and day , return details when pass detail, month and day', async function () {
      mockGeneralUsersSession(app);
      const fakeData = await app.factory.createMany('visitCount', 100);

      const result = await app
        .httpRequest()
        .get(
          `/api/statistics/visit_count?detail=true&month=${fakeData[0].month}&day=${fakeData[0].day}`
        );

      assert(result.statusCode === 200);
      assert(result.body.success);
      assert(result.body.errorCode === API_ERROR_CODE.SUCCESS);
      assert(result.body.data.length === 100);
      assert(result.body.data[0].pv !== undefined);
      assert(result.body.data[0].uv !== undefined);
      assert(result.body.data[0].year !== undefined);
      assert(result.body.data[0].month !== undefined);
      assert(result.body.data[0].day !== undefined);
      assert(result.body.data[0].hour !== undefined);
    });
  });
});
