'use strict';

module.exports = (app) => {
  const { STRING, INTEGER } = app.Sequelize;

  const Article = app.model.define(
    'article',
    {
      title: STRING,
      filePath: STRING,
      readCount: INTEGER,
      lastModifiedAt: STRING,
    },
    {
      timestamps: true,
      updatedAt: false,
      underscored: true,
    }
  );

  Article.associate = function (models) {
    if (models) {
      app.model = models;
    }

    app.model.Article.belongsTo(app.model.User);
  };

  return Article;
};
