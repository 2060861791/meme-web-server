const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['theme', 'feature']  // 限制类型只能是 theme 或 feature
  },
  value: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 确保同一类型下不会有重复的值
categorySchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema); 