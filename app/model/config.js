'use strict';

module.exports = (app) => {
  const { STRING } = app.Sequelize;
  const Config = app.model.define(
    'config',
    {
      key: STRING,
      value: STRING,
    },
    {
      timestamps: true,
      updatedAt: true,
      createdAt: false,
      underscored: true,
    }
  );

  return Config;
};
