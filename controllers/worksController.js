const Work = require('../models/Work');
const Category = require('../models/Category');

class WorksController {
  // 获取作品列表
  async getWorks(ctx) {
    try {
      const {
        page = 1,
        pageSize = 12,
        theme,
        priceMin,
        priceMax,
        pageCountMin,
        pageCountMax,
        features,
        sortBy
      } = ctx.query;

      // 构建查询条件
      const query = {};
      
      // 主题筛选
      if (theme) {
        query.theme = theme;
      }
      
      // 价格区间筛选
      if (priceMin || priceMax) {
        query.price = {};
        if (priceMin) query.price.$gte = Number(priceMin);
        if (priceMax) query.price.$lte = Number(priceMax);
      }
      
      // 页数区间筛选
      if (pageCountMin || pageCountMax) {
        query.pageCount = {};
        if (pageCountMin) query.pageCount.$gte = Number(pageCountMin);
        if (pageCountMax) query.pageCount.$lte = Number(pageCountMax);
      }
      
      // 特性筛选
      if (features) {
        const featureArray = Array.isArray(features) ? features : [features];
        if (featureArray.length > 0) {
          query.features = { $all: featureArray };
        }
      }

      // 构建排序条件
      const sort = {};
      if (sortBy === 'priceAsc') {
        sort.price = 1;
      } else if (sortBy === 'priceDesc') {
        sort.price = -1;
      }

      // 计算分页
      const skip = (Number(page) - 1) * Number(pageSize);
      
      // 执行查询
      const total = await Work.countDocuments(query);
      const totalPages = Math.ceil(total / Number(pageSize));
      
      const works = await Work.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(pageSize));

      ctx.body = {
        status: 200,
        data: {
          total,
          totalPages,
          currentPage: Number(page),
          works: works.map(work => ({
            id: work._id,
            title: work.title,
            thumbnails: work.thumbnails,
            price: work.price,
            pageCount: work.pageCount,
            theme: work.theme,
            features: work.features
          }))
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '获取作品列表失败',
        error: error.message
      };
    }
  }

  // 搜索作品
  async searchWorks(ctx) {
    try {
      const { query } = ctx.query;

      if (!query) {
        ctx.body = {
          status: 200,
          data: []
        };
        return;
      }

      // 构建搜索条件
      const searchQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { theme: { $regex: query, $options: 'i' } },
          { features: { $in: [new RegExp(query, 'i')] } }
        ]
      };

      const works = await Work.find(searchQuery);

      ctx.body = {
        status: 200,
        data: works.map(work => ({
          id: work._id,
          title: work.title,
          thumbnails: work.thumbnails,
          price: work.price,
          pageCount: work.pageCount,
          theme: work.theme,
          features: work.features
        }))
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '搜索失败',
        error: error.message
      };
    }
  }

  // 创建作品
  async createWork(ctx) {
    try {
      const { title, thumbnails, price, pageCount, theme, features } = ctx.request.body;

      // 验证必填字段
      if (!title || !thumbnails || !price || !pageCount || !theme || !features) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '缺少必要字段'
        };
        return;
      }

      // 验证图片数组
      if (!Array.isArray(thumbnails) || thumbnails.length === 0) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '至少需要上传一张图片'
        };
        return;
      }

      // 验证图片URL格式
      const invalidUrls = thumbnails.filter(url => !url.startsWith('/uploads/'));
      if (invalidUrls.length > 0) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '图片URL格式不正确'
        };
        return;
      }

      // 验证价格和页数为数字
      const priceNum = Number(price);
      const pageCountNum = Number(pageCount);
      
      if (isNaN(priceNum) || isNaN(pageCountNum)) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '价格和页数必须是数字'
        };
        return;
      }

      // 验证价格范围
      if (priceNum <= 0) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '价格必须大于0'
        };
        return;
      }

      // 验证页数范围
      if (pageCountNum <= 0) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '页数必须大于0'
        };
        return;
      }

      // 创建新作品
      const work = new Work({
        title,
        thumbnails,
        price: priceNum,
        pageCount: pageCountNum,
        theme,
        features: Array.isArray(features) ? features : [features]
      });

      const savedWork = await work.save();

      ctx.body = {
        status: 200,
        message: '作品添加成功',
        data: {
          id: savedWork._id
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '添加作品失败',
        error: error.message
      };
    }
  }

  // 删除作品
  async deleteWork(ctx) {
    try {
      const { id } = ctx.params;

      const result = await Work.findByIdAndDelete(id);
      
      if (!result) {
        ctx.status = 404;
        ctx.body = {
          status: 404,
          message: '作品不存在'
        };
        return;
      }

      ctx.body = {
        status: 200,
        message: '作品删除成功'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '删除作品失败',
        error: error.message
      };
    }
  }

  // 更新作品
  async updateWork(ctx) {
    try {
      const { id } = ctx.params;
      const updates = ctx.request.body;

      // 验证价格和页数为数字（如果提供了的话）
      if (updates.price) {
        const priceNum = Number(updates.price);
        if (isNaN(priceNum) || priceNum <= 0) {
          ctx.status = 400;
          ctx.body = {
            status: 400,
            message: '价格必须是大于0的数字'
          };
          return;
        }
        updates.price = priceNum;
      }

      if (updates.pageCount) {
        const pageCountNum = Number(updates.pageCount);
        if (isNaN(pageCountNum) || pageCountNum <= 0) {
          ctx.status = 400;
          ctx.body = {
            status: 400,
            message: '页数必须是大于0的数字'
          };
          return;
        }
        updates.pageCount = pageCountNum;
      }

      // 验证图片URL格式（如果提供了的话）
      if (updates.thumbnails) {
        if (!Array.isArray(updates.thumbnails) || updates.thumbnails.length === 0) {
          ctx.status = 400;
          ctx.body = {
            status: 400,
            message: '至少需要一张图片'
          };
          return;
        }

        const invalidUrls = updates.thumbnails.filter(url => !url.startsWith('/uploads/'));
        if (invalidUrls.length > 0) {
          ctx.status = 400;
          ctx.body = {
            status: 400,
            message: '图片URL格式不正确'
          };
          return;
        }
      }

      // 更新作品
      const updatedWork = await Work.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedWork) {
        ctx.status = 404;
        ctx.body = {
          status: 404,
          message: '作品不存在'
        };
        return;
      }

      ctx.body = {
        status: 200,
        message: '作品更新成功',
        data: {
          id: updatedWork._id
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '更新作品失败',
        error: error.message
      };
    }
  }
}

module.exports = new WorksController(); 