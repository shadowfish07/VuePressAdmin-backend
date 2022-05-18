'use strict';
const { factory } = require('factory-girl');
const { adminUserId } = require('./util/utils');
const { v4: uuidv4 } = require('uuid');

module.exports = (app) => {
  // 可以通过 app.factory 访问 factory 实例
  app.factory = factory;

  factory.define('user', app.model.User, (options) => {
    return {
      username: options.username || factory.chance('name'),
      password: options.password || factory.chance('word'),
      role: options.role || 'general',
      avatar: 'https://doge.shadowfish0.top/%E7%94%B7%E5%A4%B4%E5%83%8F.png',
    };
  });

  // 定义 user 和默认数据
  factory.define('article', app.model.Article, (options) => {
    return {
      title: options.title || factory.chance('sentence', { words: 3 }),
      content: options.content || '',
      filePath: factory.sequence(
        'Article.filePath',
        (n) => `/docs/article_${n}.md`
      ),
      readCount: options.readCount || 0,
      createAt: options.createAt || new Date(),
      lastModifiedAt: options.lastModifiedAt || new Date(),
      isDraft: options.isDraft || 0,
      permalink:
        options.permalink ||
        factory.sequence('Article.permalink', (n) => `${n}`),
      userId: options.userId || adminUserId,
      deletedById: options.deletedById || null,
      deletedAt: options.deletedAt || null,
    };
  });

  factory.define('shellTask', app.model.ShellTask, (options) => {
    return {
      taskId: options.taskId || uuidv4(),
      taskName: options.taskName || 'shell任务',
      state: options.state || 0,
      log: options.createAt || factory.chance('sentence', { words: 3 }),
      timeConsumed: options.timeConsumed || 0,
      userId: options.userId || adminUserId,
    };
  });

  factory.define('visitCount', app.model.VisitCount, (options) => {
    return {
      year: options.year || factory.chance('integer', { min: 2077, max: 2080 }),
      month: options.month || factory.chance('integer', { min: 1, max: 12 }),
      day: options.day || factory.chance('integer', { min: 1, max: 28 }),
      hour: options.hour || factory.chance('integer', { min: 0, max: 23 }),
      pv: options.pv || factory.chance('integer', { min: 0, max: 100 }),
      uv: options.uv || factory.chance('integer', { min: 0, max: 100 }),
    };
  });
};
