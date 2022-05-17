'use strict';

module.exports = (app) => {
  const { STRING } = app.Sequelize;

  const FullVisitHistory = app.model.define(
    'fullVisitHistory',
    {
      hostname: STRING,
      path: STRING,
      ip: STRING,
      // TODO city\country 数据试试https://www.ip2location.com/development-libraries/ip2location/nodejs
      uvCookie: STRING,
    },
    {
      timestamps: true,
      updatedAt: false,
      underscored: true,
    }
  );

  FullVisitHistory.associate = function (models) {
    if (models) {
      app.model = models;
    }

    app.model.FullVisitHistory.belongsTo(app.model.Article);
  };

  return FullVisitHistory;
};
