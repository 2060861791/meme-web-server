const Router = require('@koa/router');
const worksController = require('../controllers/worksController');
const filtersController = require('../controllers/filtersController');
const authMiddleware = require('../middleware/auth');

const router = new Router();

// 作品路由
router.post('/works', authMiddleware, worksController.create);
router.get('/works', worksController.list);

// 筛选选项路由
router.get('/filters', filtersController.getFilters);

module.exports = router; 