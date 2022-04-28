'use strict';

module.exports = (app) => {
  const { STRING, INTEGER } = app.Sequelize;

  const ShellTask = app.model.define(
    'shellTask',
    {
      taskId: { type: STRING, unique: true },
      taskName: String,
      state: INTEGER, // 0-未执行，1-执行中，2-执行完成, 3-执行失败
      log: STRING,
    },
    {
      underscored: true,
    }
  );

  ShellTask.associate = function (models) {
    if (models) {
      app.model = models;
    }

    app.model.ShellTask.belongsTo(app.model.User);
  };

  return ShellTask;
};
