const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 获取文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('只允许上传 jpg、png、gif、webp 格式的图片！'), false);
    return;
  }

  // 检查文件扩展名
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  if (!allowedExt.includes(ext)) {
    cb(new Error('文件扩展名不允许！'), false);
    return;
  }

  cb(null, true);
};

// 创建multer实例 - 增加文件大小限制到50MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (从原来的5MB增加到50MB)
  }
});

class UploadController {
  async uploadFiles(ctx) {
    try {
      const files = ctx.files;

      // 验证是否有文件上传
      if (!files || files.length === 0) {
        ctx.status = 400;
        ctx.body = {
          status: 400,
          message: '没有文件被上传'
        };
        return;
      }

      // 生成文件URL
      const uploadedFiles = files.map(file => ({
        fileUrl: `/uploads/${file.filename}`,  // 保持相对路径
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }));

      ctx.body = {
        status: 200,
        message: '文件上传成功',
        data: uploadedFiles
      };
    } catch (error) {
      // 发生错误时删除已上传的文件
      if (ctx.files) {
        ctx.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (unlinkErr) {
            console.error('删除文件失败:', unlinkErr);
          }
        });
      }

      ctx.status = 500;
      ctx.body = {
        status: 500,
        message: '文件上传失败',
        error: error.message
      };
    }
  }
}

module.exports = {
  uploadController: new UploadController(),
  upload
}; 