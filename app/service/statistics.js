'use strict';
const Service = require('egg').Service;
class StatisticsService extends Service {
  /**
   * 进行访问记录
   *
   * 通过签发有效期1天的cookie判断UV
   *
   * 默认一定会进行在visitCount表进行每小时分区的UV记录
   *
   * 如果配置了fullVisitHistoryRecord，则还会写入全量记录库FullVisitHistory
   *
   * 如果传入了文章ID，还会更新相应文章的阅读数
   *
   * @param hostname {string} 域名
   * @param path {string} 访问路径
   * @param ip {string} 访问IP
   * @param articleId {number|null} 文章ID
   * @returns {Promise<void>}
   */
  async recordAccess({ hostname, path, ip, articleId = null }) {
    const isFullRecord = (
      await this.app.model.Config.findOne({
        where: {
          key: 'fullVisitHistoryRecord',
        },
      })
    )?.value;

    let countUV = false;
    let uvCookie = this.ctx.cookies.get('uv');

    if (!uvCookie) {
      // 计入UV，并给予uv cookie
      uvCookie = new Date().getTime().toString();

      this.ctx.cookies.set('uv', uvCookie, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      countUV = true;
    }

    // 如果是全量记录，则记录访问记录
    if (isFullRecord) {
      await this.app.model.FullVisitHistory.create({
        hostname,
        path,
        ip,
        articleId,
        uvCookie,
      });
    }

    // 文章ID传入时，更新相应文章的访问量
    if (articleId) {
      await this.app.model.Article.increment(
        { readCount: 1 },
        {
          where: {
            id: articleId,
          },
        }
      );
    }

    // 记录以小时分区的全站访问量
    const thisHourRecord = await this.app.model.VisitCount.findOne({
      where: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
      },
    });

    if (!thisHourRecord) {
      await this.app.model.VisitCount.create({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        hour: new Date().getHours(),
        pv: 1,
        uv: countUV ? 1 : 0,
      });
    } else {
      thisHourRecord.increment({
        pv: 1,
        uv: countUV ? 1 : 0,
      });
      await thisHourRecord.save();
    }
  }
}

module.exports = StatisticsService;
