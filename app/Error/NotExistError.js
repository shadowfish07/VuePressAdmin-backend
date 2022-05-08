'use strict';
class NotExistError extends Error {
  constructor(message) {
    super(message ?? '资源不存在');
  }
}

module.exports = NotExistError;
