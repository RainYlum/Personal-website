CREATE DATABASE IF NOT EXISTS rylum DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rylum;

-- ============================================
-- 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) DEFAULT '/assets/img/user.png',
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 文章表
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  summary VARCHAR(500),
  author_id INT NOT NULL,
  category VARCHAR(50) DEFAULT 'uncategorized',
  status TINYINT DEFAULT 1,
  views INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 评论表
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  article_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 插入测试数据
-- ============================================
INSERT IGNORE INTO user (username, email, password) VALUES 
('admin', 'admin@rylum.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq'),
('rain', 'rainylum6936@163.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq');

INSERT IGNORE INTO articles (title, content, summary, author_id, category) VALUES 
('重新出发', '<p>这是一个关于梦想与希望的故事。在这个充满挑战的世界里，每个人都在寻找属于自己的道路。</p><p>人生就像一场漫长的旅程，有时平坦，有时坎坷。但正是这些起起落落，让我们的生活变得丰富多彩。</p><h2>开启新的旅程</h2><p>今天，我决定重新出发。放下过去的烦恼，迎接新的挑战。每一天都是新的开始，每一刻都充满无限可能。</p><p>在这个数字时代，我们拥有前所未有的机遇。通过互联网，我们可以连接世界，分享故事，学习新知。</p><h2>追逐梦想</h2><p>梦想是人生的指南针，指引我们前行。无论多么困难，只要心中有梦，就一定能找到出路。</p><p>让我们一起勇敢地迈出第一步，朝着梦想前进。记住，成功不是终点，而是另一个开始。</p><blockquote class="article-quote">"人生最大的挑战是发现自己是谁；第二大挑战是对所发现的感到满意。"</blockquote><p>感谢阅读这篇文章，希望它能给你带来一些启发和力量。让我们共同努力，创造更美好的未来！</p>', '这是一篇关于梦想与希望的文章，讲述重新出发的勇气和追逐梦想的决心。', 1, '个人日记'),
('技术博客：前端开发心得', '<p>作为一名前端开发者，我在工作中积累了很多经验和心得，今天想和大家分享一下。</p><h2>学习之路</h2><p>前端技术日新月异，保持学习热情非常重要。从HTML、CSS到JavaScript，再到各种框架，每一步都需要不断探索。</p><p>React、Vue、Angular等主流框架各有特色，选择适合自己的学习路径至关重要。</p><h2>最佳实践</h2><p>代码规范、性能优化、用户体验，这些都是前端开发中需要关注的重点。</p><p>合理使用组件化开发可以大大提高代码的可维护性和复用性。</p><blockquote class="article-quote">"好的代码是写给人看的，只是顺便在机器上运行。"</blockquote><p>希望这些心得对你有帮助，让我们一起努力！</p>', '分享前端开发的学习经验和最佳实践。', 1, '技术分享'),
('旅行日记：探索未知世界', '<p>旅行是一种生活态度。它让我们走出舒适区，探索未知的世界。</p><h2>出发的意义</h2><p>每一次旅程都是一次成长。在路上，我们会遇到不同的人和事，开阔视野。</p><p>无论是山川湖海，还是城镇乡村，它们都有独特的魅力等待我们去发现。</p><h2>路上的故事</h2><p>旅途中，我遇到了很多有趣的人，听到了很多感人的故事。</p><p>这些经历成为了我生命中宝贵的财富。</p><blockquote class="article-quote">"世界是一本书，不旅行的人只读了一页。"</blockquote><p>希望每个人都能走出家门，探索这个美丽的世界！</p>', '记录旅途中的所见所闻和所思所想。', 2, '旅行日记');

INSERT IGNORE INTO comments (article_id, user_id, content) VALUES 
(1, 2, '写得太棒了！很受启发。'),
(2, 1, '感谢分享这些心得。'),
(3, 2, '我也喜欢旅行！');

-- ============================================
-- 验证数据
-- ============================================
SELECT '用户表' as 表名, COUNT(*) as 记录数 FROM user
UNION ALL
SELECT '文章表', COUNT(*) FROM articles
UNION ALL
SELECT '评论表', COUNT(*) FROM comments;