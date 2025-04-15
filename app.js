const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const jwt = require('koa-jwt');
const cors = require('@koa/cors');
const serve = require('koa-static');
const path = require('path');
const connectDB = require('./db/connection');
const config = require('./config');
require('dotenv').config();

const app = new Koa();
const router = new Router();

// 连接数据库
connectDB().then(() => {
  const initAdmin = async () => {
    const User = require('./models/User');
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      console.log('正在创建管理员用户...');
      const newAdmin = new User({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      await newAdmin.save();
      console.log('管理员用户创建成功');
    }
  };

  initAdmin().catch(err => console.error('初始化管理员失败:', err));
});

const filtersController = require('./controllers/filtersController');
const authController = require('./controllers/authController');
const worksController = require('./controllers/worksController');
const { uploadController, upload } = require('./controllers/uploadController');
const themesController = require('./controllers/themesController');
const featuresController = require('./controllers/featuresController');

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401;
      ctx.body = {
        status: 401,
        message: '未授权访问'
      };
    } else {
      ctx.status = err.status || 500;
      ctx.body = {
        status: ctx.status,
        message: err.message || '服务器内部错误'
      };
    }
  }
});

// 基础中间件
app.use(cors({
  origin: '*',  // 允许所有来源
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposeHeaders: ['Authorization']
}));
app.use(bodyParser({
  jsonLimit: '50mb',
  formLimit: '50mb',
  textLimit: '50mb'
}));

// 静态文件服务 - 使用绝对路径
app.use(serve(path.join(__dirname, 'public')));

// 路由配置
const publicRouter = new Router();
const protectedRouter = new Router();

// 公开路由
publicRouter.get('/api/works', worksController.getWorks);
publicRouter.get('/api/search', worksController.searchWorks);
publicRouter.get('/api/works/filters', filtersController.getFilters);
publicRouter.post('/api/admin/login', authController.login);

// 应用公开路由
app.use(publicRouter.routes());
app.use(publicRouter.allowedMethods());

// JWT 中间件配置
app.use(jwt({
  secret: config.jwtSecret,
  debug: process.env.NODE_ENV !== 'production'
}).unless({
  path: [
    /^\/api\/works/,
    /^\/api\/search/,
    /^\/api\/works\/filters/,
    /^\/api\/admin\/login/,
    /^\/uploads\//,
    /^\/public\//
  ]
}));

// 需要认证的路由
protectedRouter.prefix('/api/admin');
protectedRouter.post('/works', worksController.createWork);
protectedRouter.post('/upload',
  upload.array('files'),
  uploadController.uploadFiles
);
protectedRouter.get('/themes', themesController.getThemes);
protectedRouter.post('/themes', themesController.addTheme);
protectedRouter.delete('/themes/:value', themesController.deleteTheme);
protectedRouter.get('/features', featuresController.getFeatures);
protectedRouter.post('/features', featuresController.addFeature);
protectedRouter.delete('/features/:value', featuresController.deleteFeature);
protectedRouter.delete('/works/:id', worksController.deleteWork);
protectedRouter.put('/works/:id', worksController.updateWork);

// 应用受保护路由
app.use(protectedRouter.routes());
app.use(protectedRouter.allowedMethods());

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
