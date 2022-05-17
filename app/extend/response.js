// app/extend/response.js
'use strict';

const API_ERROR_CODE = {
  SUCCESS: '00000',

  BAD_REQUEST: 'A0100',
  PARAM_INVALID: 'A0101',
  CONTENT_TYPE_NOT_SUPPORT: 'A0102',

  NOT_AUTHORIZED: 'A0200',
  NO_PERMISSION: 'A0201',
  SITE_NOT_INIT: 'A0202',

  NOT_FOUND: 'A0300',

  INTERNAL_SERVER_ERROR: 'B0001',
};

module.exports = {
  API_ERROR_CODE,

  /**
   * 返回失败调用数据
   * @param msg {string} 错误信息
   * @param [errorCode='A0100'] {API_ERROR_CODE} 状态码
   * @returns {boolean}
   */
  returnFail(msg, errorCode = API_ERROR_CODE.BAD_REQUEST) {
    this.return(false, null, msg, errorCode);
    return false;
  },

  /**
   * 返回成功调用数据
   * @param [data] {any} 数据
   * @returns {boolean} 返回true
   */
  returnSuccess(data) {
    this.return(true, data, undefined);
    return true;
  },

  /**
   * 设置返回给客户端的数据
   * @param success {boolean} 是否成功
   * @param data {any} 返回的数据
   * @param errorMessage {string} 错误信息
   * @param [errorCode='00000'] {API_ERROR_CODE} 错误码
   */
  return(success, data, errorMessage, errorCode = API_ERROR_CODE.SUCCESS) {
    this.status = 200;
    this.body = {
      success,
      data: data ?? null,
      errorCode,
      errorMessage: errorMessage || '',
      traceId: this.ctx.traceId,
    };
  },
};
