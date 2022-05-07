'use strict';

const fs = require('fs');
module.exports = {
  /**
   * 若符合条件的记录存在，则用给定值更新它；若不存在，则用给定值插入一条新记录。
   * @param model {object} model对象
   * @param where {object} 查询条件，直接传入Sequelize的findOne方法的where参数。e.g: {id: 1}
   * @param updateValue {object} 更新值，直接传入Sequelize的update方法/create方法的第一个参数。e.g: {name: 'test'}
   * @returns {Promise<model>} 返回更新后的model对象
   */
  async updateOrCreate(model, where, updateValue) {
    let result = await model.findOne({
      where,
    });
    if (result) {
      await model.update(updateValue, {
        where,
      });
      await result.reload();
    } else {
      result = await model.create(updateValue);
    }

    return result;
  },

  /**
   * 把任意值转换为boolean值，只支持true/false、1/0、'true'/'false'、'1'/'0'
   * @param value {any} 任意值
   * @throws {Error} 当传入的值不是支持的boolean值时，抛出错误
   * @returns {boolean}
   */
  transferToBoolean(value) {
    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else if (value === '1') {
      return true;
    } else if (value === '0') {
      return false;
    } else if (typeof value === 'string') {
      throw new Error('不支持的字符串值');
    }
    return !!value;
  },

  /**
   * 获取可用的文件路径，遇到同名文件，则不断尝试在文件名_后递增数字
   *
   * 如果文件名以/开头，会忽略/
   *
   * 如果根目录不以/结尾，则添加/
   *
   * @param documentRoot {string} 文件存放根目录
   * @param originFilename {string} 原始文件名
   * @param suffix {string} 文件后缀
   * @returns {string} 可用文件路径，包含根目录、文件名、后缀
   */
  getAvailableFilePath(documentRoot, originFilename, suffix) {
    // const documentRoot = process.cwd() + '/vuepress/docs/';
    // const suffix = '.md';

    // 如果文件名以/开头，就去掉/
    while (originFilename.startsWith('/')) {
      originFilename = originFilename.substring(1);
    }

    // 如果根目录不以/结尾，则添加/
    if (!documentRoot.endsWith('/')) {
      documentRoot += '/';
    }

    let modifiedFilename = originFilename;
    let count = 1;

    while (fs.existsSync(documentRoot + modifiedFilename + suffix)) {
      modifiedFilename = originFilename + '_' + count++;
    }

    return documentRoot + modifiedFilename + suffix;
  },
};
