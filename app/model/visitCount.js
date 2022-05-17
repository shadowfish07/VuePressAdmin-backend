'use strict';

module.exports = (app) => {
  const { INTEGER } = app.Sequelize;

  const VisitCount = app.model.define(
    'visitCount',
    {
      year: {
        type: INTEGER,
        allowNull: false,
      },
      month: {
        type: INTEGER,
        allowNull: false,
      },
      day: {
        type: INTEGER,
        allowNull: false,
      },
      hour: {
        type: INTEGER,
        allowNull: false,
      },
      pv: INTEGER,
      uv: INTEGER,
    },
    {
      timestamps: false,
      underscored: true,
    }
  );

  return VisitCount;
};
