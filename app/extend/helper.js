'use strict';

module.exports = {
  /**
   * 若符合条件的记录存在，则用给定值更新它；若不存在，则用给定值插入一条新记录。
   * @param model {object} model对象
   * @param where {object} 查询条件，直接传入Sequelize的findOne方法的where参数。e.g: {id: 1}
   * @param updateValue {object} 更新值，直接传入Sequelize的update方法/create方法的第一个参数。e.g: {name: 'test'}
   * @returns {Promise<void>}
   */
  async updateOrCreate(model, where, updateValue) {
    const result = await model.findOne({
      where,
    });
    if (result) {
      await model.update(updateValue, {
        where,
      });
    } else {
      await model.create(updateValue);
    }
  },
};
