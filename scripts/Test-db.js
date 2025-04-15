const mongoose = require('mongoose');
const Work = require('../models/Work');
require('dotenv').config({ path: '../.env' });

// 直接使用环境变量中的数据库URI
const mongoURI = 'mongodb://localhost:27017/works_db';

// 连接数据库
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));

// 定义测试数据
const themes = [
  '电商网站',
  '企业官网',
  '个人博客',
  '落地页',
  '管理后台'
];

const features = [
  'Vue3',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Element Plus',
  'Ant Design',
  'Next.js',
  'Nuxt.js',
  'Bootstrap',
  'Responsive Design'
];

// 生成随机数据的辅助函数
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 生成测试数据
async function generateTestData() {
  try {
    // 清空现有数据
    await Work.deleteMany({});
    
    const testWorks = [];
    
    for (let i = 0; i < 200; i++) {
      const randomTheme = getRandomElements(themes, 1)[0];
      const work = {
        title: `测试网页模板 ${i + 1}`,
        price: getRandomInt(10, 60),
        pageCount: getRandomInt(1, 11),
        theme: randomTheme,
        features: getRandomElements(features, getRandomInt(2, 5)),
        thumbnails: ['/uploads/1731324960978-178523073.png'],
        createdAt: new Date()
      };
      
      testWorks.push(work);
    }
    
    // 批量插入数据
    await Work.insertMany(testWorks);
    console.log('成功生成200条测试数据');
    
  } catch (error) {
    console.error('生成测试数据失败:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 运行生成脚本
generateTestData(); 