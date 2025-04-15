# meme网页.site的后端服务

## 🖼 项目名称：meme网站作品展示与管理服务（后端）

这是一个为 meme 网站提供支持的后端服务项目，旨在帮助我的闲鱼店铺和小红书账户等平台引流推广到网站，通过网页形式展示和售卖网页设计作品。后端服务基于 `Koa.js` + `MongoDB` 实现，支持图片上传、作品管理、筛选功能，并已集成自动部署流程。

------

## ✨ 功能特性

- 支持多种格式的图片上传：JPEG、PNG、GIF、WEBP
- 图片上传大小限制为 50MB，自动生成唯一文件名
- 提供上传后返回：图片URL、文件名、MIME类型、文件大小
- 作品增删改查管理（CRUD）
- 支持主题与特性标签的添加、删除和筛选
- 提供作品搜索与筛选接口
- JWT 鉴权的管理系统（用于后台管理操作）
- **已配置 GitHub Actions 自动部署：Push 到 main 分支后自动部署到服务器并重启服务**

------

## 🚀 快速开始

### 1. 克隆项目

```
git clone <你的Git仓库地址>
cd <项目目录>
```

### 2. 安装依赖

```
npm install
```

### 3. 配置环境变量

创建 `.env` 文件：

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/meme_works
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_password
```

### 4. **初始化管理员账户（首次部署时执行）**

```
npm run init-admin
```

这一步会根据 `.env` 文件中提供的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 自动在 MongoDB 中创建管理员账户。如果用户已存在，则会跳过创建。此脚本的作用是初始化一个可用于后台登录的管理账号。

⚠️ 注意：初始化脚本只执行一次，创建后请妥善保存管理员账号信息。

### 5. 启动服务

```
npm start
# 或开发模式启动
npm run dev
```

------

## 🔧 自动化部署

已配置 GitHub Actions 实现自动部署，只需将代码 push 到 `main` 分支：

```
name: Auto Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.7.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Setup known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to server
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} "sudo -i bash -c 'cd /root/server && git pull origin main && pm2 restart app'"
```

------

## 📦 API 接口一览

### 认证接口

- `POST /api/admin/login` 管理员登录

### 上传接口

- `POST /api/admin/upload` 上传图片（需登录）

### 作品管理

- `GET /api/works` 获取作品列表
- `POST /api/admin/works` 创建作品
- `PUT /api/admin/works/:id` 更新作品
- `DELETE /api/admin/works/:id` 删除作品
- `GET /api/search` 搜索作品

### 筛选器与标签管理

- `GET /api/works/filters` 获取主题与特性
- `GET /api/admin/themes` / `POST` / `DELETE`
- `GET /api/admin/features` / `POST` / `DELETE`

------

## 📁 项目结构

```
├── app.js                 # 入口文件
├── config.js              # 配置文件
├── .env                   # 环境变量
├── package.json           # 依赖管理
├── controllers/           # 控制器模块
│   └── *.js               # 各功能控制器
├── models/                # 数据模型
├── middleware/            # 中间件
├── routes/                # 路由配置
├── public/uploads/        # 图片上传目录
├── db/                    # MongoDB连接配置
└── scripts/init-admin.js  # 管理员初始化脚本
```

------

## 🧱 技术栈

- **Node.js + Koa**：主框架
- **MongoDB + Mongoose**：数据库
- **JWT**：认证授权
- **Multer**：文件上传
- **PM2**：进程守护 & 热重启
- **GitHub Actions**：自动化部署

------

## 📢 说明

本项目为网页设计售卖页面的后端服务，前端页面展示部分请参考对应的前端仓库。本项目支持自动部署功能，每次推送到 `main` 分支后，GitHub Actions 会自动登录远程服务器并更新代码。
