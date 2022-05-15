'use strict';
const { API_ERROR_CODE } = require('../extend/response');
module.exports = () => {
  return async function auth(ctx, next) {
    const id = ctx.session.userId;
    ctx.userId = id;
    if (!id) {
      ctx.logger.info('Unauthorized.cookies-id is null.');
      return ctx.response.returnFail(
        '用户未登录',
        API_ERROR_CODE.NOT_AUTHORIZED
      );
    }
    await next();
  };
};
