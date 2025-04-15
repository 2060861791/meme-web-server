const Category = require('../models/Category');

class FiltersController {
  async getFilters(ctx) {
    try {
      // 从数据库获取主题和特性
      const themes = await Category.find({ type: 'theme' }).select('value -_id').sort('value');
      const features = await Category.find({ type: 'feature' }).select('value -_id').sort('value');

      ctx.body = {
        status: 200,
        message: 'success',
        data: {
          // 转换主题数据格式并添加"不限"选项
          themes: [
            { value: '', label: '不限' },
            ...themes.map(t => ({
              value: t.value,
              label: t.value
            }))
          ],
          // 转换特性数据格式并添加"不限"选项，直接使用原始值
          features: [
            { value: '', label: '不限' },
            ...features.map(f => ({
              value: f.value,
              label: f.value
            }))
          ],
          // 固定的页数选项
          pageCount: [
            {value: '', label: '不限'},
            {value: '1', label: '1页'},
            {value: '2-5', label: '2-5页'},
            {value: '6-10', label: '6-10页'},
            {value: '10+', label: '10页以上'}
          ],
          // 固定的价格选项
          price: [
            {value: '', label: '不限'},
            {value: '0-20', label: '20元以下'},
            {value: '20-50', label: '20-50元'},
            {value: '50+', label: '50元以上'}
          ]
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '获取筛选选项失败',
        error: error.message
      };
    }
  }
}

module.exports = new FiltersController(); 