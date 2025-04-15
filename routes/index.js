const Router = require('@koa/router');
const userRoutes = require('./users');
const apiRoutes = require('./api');

const router = new Router({ prefix: '/api' });

// 注册子路由
router.use(userRoutes.routes());
router.use(apiRoutes.routes());

module.exports = router;
