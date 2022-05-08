'use strict';
const { factory } = require('factory-girl');
const { adminUserId } = require('./util/utils');

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
};
