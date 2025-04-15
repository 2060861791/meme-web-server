const Category = require('../models/Category');
const Work = require('../models/Work');

class FeaturesController {
  // 获取所有特性
  async getFeatures(ctx) {
    try {
      // 从 Category 集合中获取所有特性
      const features = await Category.find({ type: 'feature' })
        .select('value -_id')
        .sort('value');
      
      ctx.body = {
        status: 200,
        data: features.map(f => f.value)
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '获取特性列表失败',
        error: error.message
      };
    }
  }

  // 添加新特性
  async addFeature(ctx) {
    try {
      const { value } = ctx.request.body;
      
      if (!value) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '特性名称不能为空'
        };
        return;
      }

      // 创建新特性
      const newFeature = new Category({
        type: 'feature',
        value: value
      });

      await newFeature.save();

      ctx.body = {
        status: 200,
        message: '特性添加成功',
        data: { value }
      };
    } catch (error) {
      // 处理重复键错误
      if (error.code === 11000) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '特性已存在'
        };
        return;
      }

      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '添加特性失败',
        error: error.message
      };
    }
  }

  // 删除特性
  async deleteFeature(ctx) {
    try {
      const { value } = ctx.params;
      
      // 检查是否有作品使用该特性
      const usedByWorks = await Work.findOne({ features: value });
      if (usedByWorks) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '该特性正在被使用，无法删除'
        };
        return;
      }

      // 删除特性
      const result = await Category.deleteOne({ 
        type: 'feature', 
        value: value 
      });

      if (result.deletedCount === 0) {
        ctx.status = 404;
        ctx.body = {
          status: 404,
          message: '特性不存在'
        };
        return;
      }

      ctx.body = {
        status: 200,
        message: '特性删除成功'
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '删除特性失败',
        error: error.message
      };
    }
  }
}

module.exports = new FeaturesController(); 