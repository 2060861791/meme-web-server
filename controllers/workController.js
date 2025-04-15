const Work = require('../models/work');

class WorkController {
  // 获取作品列表
  async getWorks(ctx) {
    try {
      const { page = 1, pageSize = 12, technologies = [] } = ctx.query;
      
      // 构建查询条件
      const query = {};
      if (technologies.length > 0) {
        query.technologies = { $in: technologies };
      }

      // 查询总数
      const total = await Work.countDocuments(query);
      
      // 查询作品列表
      const works = await Work.find(query)
        .skip((page - 1) * pageSize)
        .limit(parseInt(pageSize))
        .select('id title thumbnail');

      ctx.body = {
        status: 200,
        data: {
          total,
          works
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }

  // 获取筛选选项
  async getFilters(ctx) {
    try {
      // 获取所有不重复的技术标签
      const technologies = await Work.distinct('technologies');
      
      ctx.body = {
        status: 200,
        data: {
          technologies
        }
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
}

module.exports = new WorkController(); 