'use strict';

module.exports = {
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
