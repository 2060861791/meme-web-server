const Router = require('@koa/router');
const authController = require('../controllers/authController');

const router = new Router();

router.post('/login', authController.login);

module.exports = router;
