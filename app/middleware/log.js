'use strict';
module.exports = () => {
  return async function log(ctx, next) {
    ctx.logger.info('request:', ctx.request);
    await next();
    ctx.logger.info('response body:', JSON.stringify(ctx.response.body));
  };
};
