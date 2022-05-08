'use strict';

module.exports = (app) => {
  const { STRING } = app.Sequelize;

  const ArticleHistory = app.model.define(
    'article_history',
    {
      title: STRING, // 文章标题
      content: {
        type: STRING,
        defaultValue: '',
      }, // 文章内容
    },
    {
      timestamps: true,
      updatedAt: false,
      underscored: true,
    }
  );

  ArticleHistory.associate = function (models) {
    if (models) {
      app.model = models;
    }

    app.model.ArticleHistory.belongsTo(app.model.Article);
    app.model.ArticleHistory.belongsTo(app.model.User);
  };

  return ArticleHistory;
};
