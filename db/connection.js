const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB连接成功');
  } catch (err) {
    console.error('MongoDB连接失败:', err.message);
    process.exit(1);
  }
};

// 监听连接事件
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB连接断开');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB错误:', err);
});

module.exports = connectDB; 