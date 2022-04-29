'use strict';
module.exports = () => {
  return async function auth(ctx, next) {
    ctx.logger.info('request:', ctx.request);
    const id = ctx.session.userId;
    if (!id) {
      ctx.logger.info('Unauthorized.cookies-id is null.');
      return ctx.response.returnFail('用户未登录', 401);
    }
    await next();
  };
};
