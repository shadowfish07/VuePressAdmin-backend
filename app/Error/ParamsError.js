'use strict';
class ParamsError extends Error {
  constructor(message) {
    super(message ?? '参数错误');
  }
}

module.exports = ParamsError;
