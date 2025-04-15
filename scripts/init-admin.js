const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const createAdminUser = async () => {
  try {
    // 输出连接字符串用于调试（上线前删除此行）
    console.log('尝试连接到:', process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB 连接成功');

    // 检查是否已存在管理员用户
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('管理员用户已存在，跳过创建步骤');
    } else {
      // 创建默认管理员用户
      // 注意：在实际部署中，应使用环境变量或安全的配置管理系统
      const defaultAdmin = {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123', // 将在保存时自动加密
        role: 'admin'
      };

      const newAdmin = new User(defaultAdmin);
      await newAdmin.save();
      console.log('默认管理员用户创建成功');
    }
  } catch (error) {
    console.error('初始化管理员用户失败:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// 执行初始化
createAdminUser(); 