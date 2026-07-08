// server.js
// 加载环境变量（指定项目根目录的 .env 文件）
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const filename = `avatar_${Date.now()}.${ext}`;
    cb(null, filename);
  }
});

// 文件类型限制
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传 JPG、PNG、GIF 格式的图片'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB 限制
});

// 文章图片存储配置
const articleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'articles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const filename = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    cb(null, filename);
  }
});

const articleUpload = multer({
  storage: articleStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 静态资源服务（用于访问上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 获取音乐列表 API
app.get('/api/music/list', (req, res) => {
  const audioDir = path.join(__dirname, '..', 'assets', 'audio');
  
  fs.readdir(audioDir, (err, files) => {
    if (err) {
      console.error('读取音乐目录失败:', err);
      return res.json({ success: false, message: '读取音乐目录失败', songs: [] });
    }
    
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
    const songs = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return audioExtensions.includes(ext);
      })
      .map(file => {
        const ext = path.extname(file);
        const title = file.replace(ext, '');
        return {
          title: title,
          src: `/assets/audio/${file}`
        };
      });
    
    res.json({ success: true, songs: songs });
  });
});

// 从环境变量读取数据库配置
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'rylum',
  port: process.env.DB_PORT || 3306
});

// JWT密钥（从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'rylum_jwt_secret_key_2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// 注册接口
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 检查用户名是否已存在
    const [existingUsers] = await pool.execute(
      'SELECT id FROM user WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.json({ success: false, message: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const [existingEmails] = await pool.execute(
      'SELECT id FROM user WHERE email = ?',
      [email]
    );

    if (existingEmails.length > 0) {
      return res.json({ success: false, message: '邮箱已被注册' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 插入新用户
    const [result] = await pool.execute(
      'INSERT INTO user (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.json({
      success: true,
      message: '注册成功',
      userId: result.insertId
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 登录接口
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`[登录尝试] 用户名: ${username}, 密码长度: ${password ? password.length : 0}`);

    // 查询用户
    const [users] = await pool.execute(
      'SELECT * FROM user WHERE username = ?',
      [username]
    );

    console.log(`[查询结果] 找到用户数: ${users.length}`);

    if (users.length === 0) {
      console.log(`[登录失败] 用户不存在: ${username}`);
      return res.json({ success: false, message: '用户名或密码错误' });
    }

    const user = users[0];
    console.log(`[用户信息] id: ${user.id}, username: ${user.username}, password_hash_length: ${user.password.length}`);

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`[密码验证] 结果: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log(`[登录失败] 密码错误: ${username}`);
      return res.json({ success: false, message: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 更新最后登录时间
    await pool.execute(
      'UPDATE user SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取当前用户信息
app.get('/api/user', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [users] = await pool.execute(
      'SELECT id, username, email, avatar, created_at, last_login FROM user WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取指定用户信息（公开接口，用于查看他人资料）
app.get('/api/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: '无效的用户ID' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT id, username, avatar, created_at, last_login FROM user WHERE id = ? AND status = 1',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 更新用户资料接口
app.put('/api/user', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  const { email, password } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (email) {
      const [existingEmails] = await pool.execute(
        'SELECT id FROM user WHERE email = ? AND id != ?',
        [email, decoded.userId]
      );
      if (existingEmails.length > 0) {
        return res.json({ success: false, message: '邮箱已被使用' });
      }
    }

    let updateFields = [];
    let updateValues = [];

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (password && password.length >= 6) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.json({ success: false, message: '请提供要更新的信息' });
    }

    updateValues.push(decoded.userId);

    await pool.execute(
      `UPDATE user SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [users] = await pool.execute(
      'SELECT id, username, email, avatar, created_at, last_login FROM user WHERE id = ?',
      [decoded.userId]
    );

    res.json({
      success: true,
      message: '资料更新成功',
      user: users[0]
    });
  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 文章图片上传接口
app.post('/api/upload/article', articleUpload.single('image'), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: '请选择要上传的图片' });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    const imagePath = `/uploads/articles/${req.file.filename}`;

    res.json({
      success: true,
      message: '图片上传成功',
      url: imagePath
    });
  } catch (error) {
    console.error('上传图片错误:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
    }
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 头像上传接口
app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, message: '请选择要上传的图片' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // 更新数据库
    await pool.execute(
      'UPDATE user SET avatar = ? WHERE id = ?',
      [avatarPath, decoded.userId]
    );

    res.json({
      success: true,
      message: '头像上传成功',
      avatar: avatarPath
    });
  } catch (error) {
    console.error('上传头像错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 发布文章接口
app.post('/api/articles', async (req, res) => {
  console.log('API hit: POST /api/articles');
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { title, category, summary, content } = req.body;

    if (!title || !category || !summary || !content) {
      return res.json({ success: false, message: '请填写完整的文章信息' });
    }

    const [result] = await pool.execute(
      'INSERT INTO articles (title, content, summary, author_id, category, status) VALUES (?, ?, ?, ?, ?, 1)',
      [title, content, summary, decoded.userId, category]
    );

    const articleId = result.insertId;

    const [articles] = await pool.execute(
      'SELECT a.id, a.title, a.summary, a.category, a.views, a.created_at, u.username as author_name ' +
      'FROM articles a LEFT JOIN user u ON a.author_id = u.id WHERE a.id = ?',
      [articleId]
    );

    res.json({
      success: true,
      message: '文章发布成功',
      article: articles[0]
    });
  } catch (error) {
    console.error('发布文章错误:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: '登录已过期，请重新登录' });
    }
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取文章列表接口
app.get('/api/articles', async (req, res) => {
  console.log('API hit: /api/articles');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [articles] = await pool.query(
      'SELECT a.id, a.title, a.summary, a.category, a.views, a.created_at, u.username as author_name ' +
      'FROM articles a ' +
      'LEFT JOIN user u ON a.author_id = u.id ' +
      'WHERE a.status = 1 ' +
      'ORDER BY a.created_at DESC ' +
      'LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM articles WHERE status = 1'
    );

    res.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('获取文章列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取单篇文章详情接口
app.get('/api/articles/:id', async (req, res) => {
  console.log('API hit: /api/articles/:id', req.params.id);
  const articleId = parseInt(req.params.id);

  if (isNaN(articleId)) {
    return res.status(400).json({ success: false, message: '无效的文章ID' });
  }

  try {
    await pool.query(
      'UPDATE articles SET views = views + 1 WHERE id = ?',
      [articleId]
    );

    const [articles] = await pool.query(
      'SELECT a.id, a.title, a.content, a.summary, a.category, a.views, a.created_at, a.updated_at, u.id as author_id, u.username as author_name, u.avatar as author_avatar ' +
      'FROM articles a ' +
      'LEFT JOIN user u ON a.author_id = u.id ' +
      'WHERE a.id = ? AND a.status = 1',
      [articleId]
    );

    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: '文章不存在或未发布' });
    }

    res.json({
      success: true,
      data: articles[0]
    });
  } catch (error) {
    console.error('获取文章详情错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 获取文章评论列表接口
app.get('/api/articles/:id/comments', async (req, res) => {
  const articleId = parseInt(req.params.id);

  try {
    const [comments] = await pool.query(
      'SELECT c.id, c.content, c.created_at, u.id as author_id, u.username as author_name, u.avatar as author_avatar ' +
      'FROM comments c ' +
      'LEFT JOIN user u ON c.user_id = u.id ' +
      'WHERE c.article_id = ? ' +
      'ORDER BY c.created_at DESC',
      [articleId]
    );

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 添加评论接口
app.post('/api/articles/:id/comments', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  const articleId = parseInt(req.params.id);
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.json({ success: false, message: '评论内容不能为空' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    await pool.execute(
      'INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)',
      [articleId, decoded.userId, content.trim()]
    );

    res.json({
      success: true,
      message: '评论成功'
    });
  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 登出接口
app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: '登出成功' });
});

// 静态资源服务（提供项目根目录的 HTML、CSS、JS、图片等文件）- 必须放在所有 API 路由之后
app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});