'use strict';

module.exports = (app) => {
  const { STRING } = app.Sequelize;

  const User = app.model.define(
    'user',
    {
      username: STRING,
      password: STRING,
      role: STRING,
      avatar: STRING,
    },
    {
      underscored: true,
    }
  );

  User.associate = function (models) {
    if (models) {
      app.model = models;
    }

    app.model.User.hasMany(app.model.ShellTask);
    app.model.User.hasMany(app.model.Article);
    app.model.User.hasMany(app.model.ArticleHistory);
  };

  return User;
};
