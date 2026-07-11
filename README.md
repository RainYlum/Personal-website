# Rylum - 个人博客系统

一个基于 Node.js + Express + MySQL 开发的个人博客系统，支持文章发布、用户评论、AI 助手、音乐播放器等功能。

## 技术栈

### 前端
- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap Icons

### 后端
- Node.js (v18+)
- Express.js
- MySQL 8.0+

### 依赖
- axios - HTTP 请求
- bcryptjs - 密码加密
- jsonwebtoken - JWT 认证
- mysql2 - MySQL 驱动
- multer - 文件上传
- cors - 跨域处理
- dotenv - 环境变量

## 功能特性

### 用户功能
- ✅ 用户注册与登录
- ✅ JWT 认证
- ✅ 用户中心（查看/编辑资料）
- ✅ 头像上传
- ✅ 修改密码

### 文章功能
- ✅ 文章列表展示
- ✅ 文章详情查看
- ✅ 文章分类
- ✅ 阅读量统计
- ✅ Markdown 编辑器（h2-h6、加粗、斜体、代码块、链接等）

### 评论功能
- ✅ 文章评论
- ✅ 评论列表展示
- ✅ 评论作者信息显示

### AI 助手
- ✅ AI Agent 对话组件
- ✅ 集成 DeepSeek API
- ✅ 知识库检索（自动读取网站文章）
- ✅ 对话历史管理
- ✅ 打字指示器动画

### 音乐播放器
- ✅ 自动扫描音频目录
- ✅ 播放/暂停控制
- ✅ 上一曲/下一曲
- ✅ 循环模式（列表/单曲/随机）
- ✅ 进度条拖动
- ✅ 音量控制
- ✅ 状态持久化（页面切换不中断）

### 交互体验
- ✅ 页面平滑滚动
- ✅ 侧边栏固定定位
- ✅ 浏览器前进/后退支持
- ✅ 登录状态持久化
- ✅ 组件化架构（共用 header、footer、agent、musicPlayer）

## 项目结构

```
rylum/
├── index.html                    # 首页
├── favicon.ico                  # 网站图标
├── pages/
│   ├── login.html               # 登录页
│   ├── register.html            # 注册页
│   ├── post_article.html        # 发布文章页
│   └── user_center.html         # 用户中心
├── Components/
│   ├── header.html              # 顶部导航组件
│   ├── footer.html              # 底部组件
│   ├── agent.html               # AI 助手组件
│   └── musicPlayer.html         # 音乐播放器组件
├── css/
│   ├── index.css                # 主样式
│   ├── login.css                # 登录页样式
│   ├── register.css             # 注册页样式
│   ├── agent.css                # AI 助手样式
│   └── musicPlayer.css          # 音乐播放器样式
├── js/
│   ├── index.js                 # 首页脚本
│   ├── login.js                 # 登录页脚本
│   ├── user_center.js           # 用户中心脚本
│   ├── post_article.js          # 发布文章脚本
│   ├── common.js                # 公共脚本
│   ├── components.js            # 组件加载器
│   ├── config.js                # 配置文件
│   ├── agent.js                 # AI 助手逻辑
│   └── musicPlayer.js           # 音乐播放器逻辑
├── backend/
│   ├── server.js                # 服务器入口
│   ├── init.sql                 # 数据库初始化脚本
│   └── start.bat / start.ps1    # 启动脚本
├── assets/
│   ├── img/                     # 图片资源
│   └── audio/                   # 音频资源
├── uploads/                     # 上传文件目录（忽略）
├── .env                         # 环境变量（忽略）
├── .gitignore
└── package.json
```

## 快速开始

### 环境要求
- Node.js >= 18.x
- MySQL >= 8.0

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/RainYlum/Personal-website.git
cd Personal-website
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```ini
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=rylum
DB_PORT=3306

# JWT配置
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h

# 服务器配置
PORT=3000

# DeepSeek AI 配置（可选）
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_BASE=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

> **注意**：如需使用 AI 助手功能，需到 [DeepSeek Platform](https://platform.deepseek.com/) 获取 API Key

4. **初始化数据库**
```bash
mysql -u root -p < backend/init.sql
```

5. **添加音乐文件（可选）**
```
将音频文件（.mp3, .wav, .ogg, .flac, .m4a）放入 assets/audio/ 目录
音乐播放器会自动扫描并加载
```

6. **启动服务**
```bash
# Windows
backend\start.bat

# 或
node backend/server.js
```

7. **访问网站**
```
http://localhost:3000
```

## API 接口

### 用户接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/register | 用户注册 |
| POST | /api/login | 用户登录 |
| GET | /api/user | 获取当前用户信息 |
| GET | /api/user/:id | 获取指定用户信息 |
| PUT | /api/user | 更新用户信息（含修改密码） |
| POST | /api/upload/avatar | 上传头像 |
| POST | /api/logout | 退出登录 |

### 文章接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/articles | 获取文章列表 |
| GET | /api/articles/:id | 获取文章详情 |
| POST | /api/articles | 发布文章 |
| POST | /api/upload/article | 上传文章图片 |

### 评论接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/articles/:id/comments | 获取文章评论 |
| POST | /api/articles/:id/comments | 添加评论 |

### AI 助手接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/agent/chat | AI 对话（需登录） |

### 音乐接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/music/list | 获取音乐列表 |

## 数据库表结构

### user 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| email | VARCHAR(100) | 邮箱（唯一） |
| password | VARCHAR(255) | 密码（加密） |
| avatar | VARCHAR(255) | 头像路径 |
| status | TINYINT | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| last_login | DATETIME | 最后登录时间 |

### articles 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| title | VARCHAR(200) | 文章标题 |
| content | LONGTEXT | 文章内容 |
| summary | VARCHAR(500) | 摘要 |
| author_id | INT | 作者ID |
| category | VARCHAR(50) | 分类 |
| status | TINYINT | 状态 |
| views | INT | 阅读量 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### comments 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| article_id | INT | 文章ID |
| user_id | INT | 用户ID |
| content | TEXT | 评论内容 |
| created_at | TIMESTAMP | 创建时间 |

## 开发日志

### 2026-07-11
- ✅ 实现 AI Agent 对话组件，集成 DeepSeek API
- ✅ 添加知识库功能，自动检索网站文章标题和摘要
- ✅ 优化 token 使用：仅当用户问题与文章相关时才发送知识库
- ✅ 添加清除对话按钮和清除对话功能

### 2026-07-08
- ✅ 音乐播放器自动扫描 assets/audio 目录
- ✅ 组件化重构，抽取公共 header/footer 和 common.js
- ✅ 用户中心 URL 改为 /user_center.html

### 2026-07-04
- ✅ 删除昵称功能，统一显示用户名
- ✅ 文章详情页和评论区添加作者头像，点击可进入用户中心
- ✅ 用户中心支持访问他人资料，访客模式下隐藏编辑功能
- ✅ 增强 Markdown 解析：支持 h2-h6、删除线、代码块、链接、图片、分割线等
- ✅ 文章编辑器工具栏添加更多格式按钮
- ✅ 添加网站 favicon 图标
- ✅ 添加网站公告弹窗功能

### 2026-07-03
- ✅ 统一数据库初始化脚本（init.sql）
- ✅ 测试数据改为中文
- ✅ 忽略 uploads 目录
- ✅ 同步代码到 GitHub

### 2026-07-02
- ✅ 实现页面平滑滚动
- ✅ 侧边栏固定定位（滚动到 banner 以下后固定）
- ✅ 移除硬编码 API 地址，使用相对路径

### 2026-07-01
- ✅ 实现评论功能（文章结尾留言）
- ✅ 修复评论区用户名显示问题
- ✅ 移动 user_center.html 到 pages 目录
- ✅ 优化用户中心 header usercard 显示

### 2026-06-30
- ✅ 实现用户中心页面
- ✅ 未登录跳转登录页后自动返回用户中心
- ✅ 修复浏览器前进/后退问题（使用 History API）
- ✅ 实现论坛列表功能

### 2026-06-29
- ✅ 修复 API 请求返回 HTML 而非 JSON 的问题
- ✅ 调整 Express 路由顺序（API 路由优先）
- ✅ 实现从数据库动态加载文章内容
- ✅ 创建 articles 表和 comments 表

### 2026-06-28
- ✅ 实现用户注册与登录功能
- ✅ JWT 认证
- ✅ 创建用户表结构

## 许可证

MIT License
