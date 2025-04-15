require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  port: process.env.PORT || 3000,
  mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/works_db',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000'
}; 