// app/extend/response.js
'use strict';
module.exports = {
  /**
   * 返回失败调用数据
   * @param msg {string} 错误信息
   * @param [statusCode=400] {number} 状态码
   * @returns {boolean}
   */
  returnFail(msg, statusCode = 400) {
    this.return(false, null, msg, statusCode);
    return false;
  },

  /**
   * 返回成功调用数据
   * @param [data] {any} 数据
   * @returns {boolean} 返回true
   */
  returnSuccess(data) {
    this.return(true, data, undefined, 200);
    return true;
  },

  /**
   * 设置返回给客户端的数据
   * @param success {boolean} 是否成功
   * @param data {any} 返回的数据
   * @param errorMessage {string} 错误信息
   * @param statusCode {number} 状态码
   */
  return(success, data, errorMessage, statusCode) {
    this.status = statusCode;
    this.body = {
      success,
      data: data || null,
      errorMessage: errorMessage || '',
      traceId: this.ctx.traceId,
    };
  },
};
