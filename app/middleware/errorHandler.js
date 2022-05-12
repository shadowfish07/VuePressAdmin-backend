'use strict';
module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      if (err.status === 422) {
        ctx.logger.info('请求参数错误.error:', JSON.stringify(err));
        ctx.response.returnFail('请求参数错误', 422);
      } else {
        // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
        ctx.app.emit('error', err, ctx);
        ctx.response.returnFail('服务器内部错误', 500);
      }
    }
  };
};
