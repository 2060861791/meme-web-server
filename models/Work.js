const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  thumbnails: [{
    type: String,
    required: true
  }],
  price: {
    type: Number,
    required: true
  },
  pageCount: {
    type: Number,
    required: true
  },
  theme: {
    type: String,
    required: true
  },
  features: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Work', workSchema); 