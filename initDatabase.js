'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const modelPath = './app/model';
const databasePath = 'database/database.sqlite';
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
});
const models = {};

// 导入所有model

fs.readdirSync(modelPath).forEach((file) => {
  const filename = path.basename(file, '.js');
  models[filename.replace(filename[0], filename[0].toUpperCase())] =
    require(modelPath + '/' + filename)({
      Sequelize: DataTypes,
      model: sequelize,
    });
});

// 执行延迟执行的关联处理

// eslint-disable-next-line no-unused-vars
Object.entries(models).forEach(([key, value]) => {
  typeof value.associate === 'function' && value.associate(models);
});

// 执行数据库初始化

doInit();

async function doInit() {
  if (!fs.existsSync(databasePath)) {
    console.log('database not found, creating...');
    await initDatabase();
  } else {
    const args = process.argv.slice(2);
    if (args[0] === 'force') {
      console.log('database found, force to recreate...');
      await initDatabase(true);
    } else {
      console.log('database found, skip init');
    }
  }

  console.log('init finished');

  async function initDatabase(force = false) {
    await sequelize.sync({ force });
    console.log('database synced');

    await models.Config.create({ key: 'hasInit', value: 'false' });

    console.log('Config 表初始化完成');

    await models.User.create({
      username: 'admin',
      password: 'admin',
      role: 'admin',
      avatar: 'https://doge.shadowfish0.top/%E7%94%B7%E5%A4%B4%E5%83%8F.png',
    });

    console.log('User 表初始化完成');

    console.log('database created');
  }
}
