'use strict';
module.exports = () => {
  return async function checkSiteInit(ctx, next) {
    const { value } = (await ctx.model.Config.findOne({
      where: {
        key: 'hasInit',
      },
    })) || { value: false };
    if (!ctx.helper.transferToBoolean(value)) {
      ctx.logger.info('站点未初始化');
      return ctx.response.returnFail('站点未初始化', 403);
    }
    await next();
  };
};
