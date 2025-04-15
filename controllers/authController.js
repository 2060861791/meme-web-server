const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

class AuthController {
  // 用户登录
  async login(ctx) {
    try {
      const { username, password } = ctx.request.body;

      // 验证请求体
      if (!username || !password) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '请提供用户名和密码'
        };
        return;
      }

      // 查找用户
      const user = await User.findOne({ username });

      // 用户不存在
      if (!user) {
        ctx.status = 401;
        ctx.body = {
          status: 401,
          message: '用户不存在'
        };
        return;
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        ctx.status = 401;
        ctx.body = {
          status: 401,
          message: '密码错误'
        };
        return;
      }

      // 更新最后登录时间
      user.lastLogin = new Date();
      await user.save();

      // 生成 JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: '24h' }
      );

      // 返回成功响应
      ctx.body = {
        status: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user._id,
            username: user.username,
            role: user.role,
            lastLogin: user.lastLogin
          }
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '登录失败',
        error: error.message
      };
    }
  }
}

module.exports = new AuthController(); 