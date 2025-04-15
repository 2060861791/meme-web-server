const Category = require('../models/Category');
const Work = require('../models/Work');

class ThemesController {
    // 获取所有主题
    async getThemes(ctx) {
        try {
            // 从 Category 集合中获取所有主题
            const themes = await Category.find({ type: 'theme' })
                .select('value -_id')
                .sort('value');

            ctx.body = {
                status: 200,
                data: themes.map(t => t.value)
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                status: 500,
                message: '获取主题列表失败',
                error: error.message
            };
        }
    }

    // 添加新主题
    async addTheme(ctx) {
        try {
            const { value } = ctx.request.body;

            if (!value) {
                ctx.status = 400;
                ctx.body = {
                    status: 400,
                    message: '主题名称不能为空'
                };
                return;
            }

            // 创建新主题
            const newTheme = new Category({
                type: 'theme',
                value: value
            });

            await newTheme.save();

            ctx.body = {
                status: 200,
                message: '主题添加成功',
                data: { value }
            };
        } catch (error) {
            // 处理重复键错误
            if (error.code === 11000) {
                ctx.status = 400;
                ctx.body = {
                    status: 400,
                    message: '主题已存在'
                };
                return;
            }

            ctx.status = 500;
            ctx.body = {
                status: 500,
                message: '添加主题失败',
                error: error.message
            };
        }
    }

    // 删除主题
    async deleteTheme(ctx) {
        try {
            const { value } = ctx.params;

            // 检查是否有作品使用该主题
            const usedByWorks = await Work.findOne({ theme: value });
            if (usedByWorks) {
                ctx.status = 400;
                ctx.body = {
                    status: 400,
                    message: '该主题正在被使用，无法删除'
                };
                return;
            }

            // 删除主题
            const result = await Category.deleteOne({
                type: 'theme',
                value: value
            });

            if (result.deletedCount === 0) {
                ctx.status = 404;
                ctx.body = {
                    status: 404,
                    message: '主题不存在'
                };
                return;
            }

            ctx.body = {
                status: 200,
                message: '主题删除成功'
            };
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                status: 500,
                message: '删除主题失败',
                error: error.message
            };
        }
    }
}

module.exports = new ThemesController(); 