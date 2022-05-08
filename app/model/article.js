'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, DATE, NOW } = app.Sequelize;

  const Article = app.model.define(
    'article',
    {
      title: STRING, // 文章标题
      content: {
        type: STRING,
        defaultValue: '',
      }, // 文章内容
      filePath: STRING, // 文件路径
      readCount: {
        type: INTEGER,
        defaultValue: 0,
      }, // 阅读数
      lastModifiedAt: {
        type: DATE,
        defaultValue: NOW,
      }, // 最后修改时间
      isDraft: INTEGER, // 是否为草稿 0: false, 1: true
      permalink: STRING, // 文章永久链接
    },
    {
      timestamps: true,
      updatedAt: false,
      underscored: true,
      paranoid: true,
    }
  );

  Article.associate = function (models) {
    if (models) {
      app.model = models;
    }

    app.model.Article.belongsTo(app.model.User, {
      as: 'author',
      foreignKey: 'userId',
    });
    app.model.Article.belongsTo(app.model.User, {
      as: 'deletedBy',
      foreignKey: 'deletedById',
    });
  };

  return Article;
};
