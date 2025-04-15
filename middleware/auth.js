const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your-secret-key';

module.exports = async (ctx, next) => {
  try {
    const token = ctx.header.authorization?.split(' ')[1];
    if (!token) {
      ctx.throw(401, '未提供认证令牌');
    }
    
    const decoded = jwt.verify(token, SECRET_KEY);
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    ctx.throw(401, '无效的认证令牌');
  }
}; 