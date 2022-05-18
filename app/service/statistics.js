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
   * @param body {object} request body
   * @param body.hostname {string} 域名
   * @param body.path {string} 访问路径
   * @param body.ip {string} 访问IP
   * @param body.articleId {number|null} 文章ID
   * @returns {Promise<void>}
   */
  async recordAccess({ hostname, path, ip, articleId = null }) {
    const getArticleId = async () => {
      if (articleId !== null) return articleId;

      let _path = path;

      if (_path.startsWith('/')) {
        _path = _path.substring(1);
      }
      if (_path.endsWith('/')) {
        _path = _path.substring(0, _path.length - 1);
      }

      const article = await this.ctx.model.Article.findOne({
        where: {
          permalink: _path,
        },
      });

      if (article) {
        return article.id;
      }
    };

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

    // 文章ID传入或path是文章永久链接时，更新相应文章的访问量

    const _articleId = await getArticleId();

    if (_articleId) {
      await this.app.model.Article.increment(
        { readCount: 1 },
        {
          where: {
            id: _articleId,
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

  /**
   * @typedef {object} VisitCountDetail
   * @property {number} pv
   * @property {number} uv
   * @property {number} year
   * @property {number} month
   * @property {number} day
   */

  /**
   * @typedef {object} VisitCount
   * @property {number} pv
   * @property {number} uv
   */

  /**
   * 获取全站访问次数，按小时分组
   *
   * @param query {object} request query
   * @param query.year {number} 查询年份，不填则返回所有数据
   * @param query.month {number} 仅year指定时有效，查询月份，不填则返回当年所有数据
   * @param query.day {number} 仅month指定时有效，查询天，不填则返回当月所有数据
   * @param query.detail {boolean} 是否返回详细数据，默认false
   *
   * @returns {Promise<VisitCountDetail[]|VisitCount>} detail真时，返回详细以时间分区的数据;否则返回阶段总pv\uv数
   */
  async getVisitCount({ year, month, day, detail }) {
    if (!year) {
      month = undefined;
      day = undefined;
    }
    if (!month) {
      day = undefined;
    }

    const where = {};
    if (year) where.year = year;
    if (month) where.month = month;
    if (day) where.day = day;

    if (detail) {
      return await this.app.model.VisitCount.findAll({
        where,
        attributes: { exclude: ['id'] },
      });
    }

    return await this.app.model.VisitCount.findOne({
      where,
      attributes: [
        [
          this.app.model.Sequelize.fn(
            'sum',
            this.app.model.Sequelize.col('pv')
          ),
          'pv',
        ],
        [
          this.app.model.Sequelize.fn(
            'sum',
            this.app.model.Sequelize.col('uv')
          ),
          'uv',
        ],
      ],
    });
  }
}

module.exports = StatisticsService;
