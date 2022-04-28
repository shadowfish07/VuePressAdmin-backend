// app/extend/response.js
'use strict';
module.exports = {
  returnFail(msg) {
    this.return(false, null, msg);
    return false;
  },

  returnSuccess(data) {
    this.return(true, data);
    return true;
  },

  return(success, data, errorMessage) {
    this.body = {
      success,
      data: data || null,
      errorMessage: errorMessage || '',
    };
  },
};
