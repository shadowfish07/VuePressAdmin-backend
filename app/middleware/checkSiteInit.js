'use strict';
const { API_ERROR_CODE } = require('../extend/response');
module.exports = () => {
  return async function checkSiteInit(ctx, next) {
    const { value } = (await ctx.model.Config.findOne({
      where: {
        key: 'hasInit',
      },
    })) || { value: false };
    if (!ctx.helper.transferToBoolean(value)) {
      ctx.logger.info('站点未初始化');
      return ctx.response.returnFail(
        '站点未初始化',
        API_ERROR_CODE.SITE_NOT_INIT
      );
    }
    await next();
  };
};
