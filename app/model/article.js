'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Article = app.model.define(
    'article',
    {
      title: STRING,
      filePath: STRING,
      readCount: INTEGER,
      lastModifiedAt: DATE,
      isDraft: INTEGER,
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
