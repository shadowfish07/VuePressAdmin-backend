// app/extend/response.js
'use strict';
module.exports = {
  returnFail(msg, statusCode = 400) {
    this.return(false, null, msg, statusCode);
    return false;
  },

  returnSuccess(data) {
    this.return(true, data, undefined, 200);
    return true;
  },

  return(success, data, errorMessage, statusCode) {
    this.status = statusCode;
    this.body = {
      success,
      data: data || null,
      errorMessage: errorMessage || '',
    };
  },
};
