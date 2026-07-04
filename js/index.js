// index.js

// 公告弹窗关闭逻辑
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('announcementOverlay');
  const closeBtn = document.getElementById('announcementClose');

  if (overlay) {
    closeBtn.addEventListener('click', function () {
      overlay.style.display = 'none';
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  }
});

// 全局变量
let currentUser = null;

// 检查登录状态并更新用户卡片
async function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const userName = document.querySelector('.user-name');
  const userImg = document.querySelector('.user-img');
  const dropdownAvatar = document.querySelector('.dropdown-avatar');
  const dropdownName = document.querySelector('.dropdown-name');
  const dropdownEmail = document.querySelector('.dropdown-email');

  if (token) {
    try {
      const response = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        currentUser = data.user;

        userName.textContent = data.user.username || '用户';

        // 更新头像显示
        if (data.user.avatar) {
          userImg.src = data.user.avatar;
          dropdownAvatar.src = data.user.avatar;
        }

        dropdownName.textContent = data.user.username || '用户';
        dropdownEmail.textContent = data.user.email || '未绑定邮箱';

      } else {
        // token失效，清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      currentUser = null;
    }
  }
}

// 用户卡片点击事件
function handleUserCardClick(e) {
  e.stopPropagation();

  const dropdown = document.getElementById('userDropdown');

  if (!currentUser) {
    // 未登录状态，跳转到登录页
    window.location.href = './pages/login.html';
    return;
  }

  // 登录状态，切换下拉菜单显示
  dropdown.classList.toggle('active');
}

// 点击页面其他地方关闭下拉菜单
function handleDocumentClick(e) {
  const dropdown = document.getElementById('userDropdown');
  const userCard = document.getElementById('userCard');

  if (dropdown && !userCard.contains(e.target)) {
    dropdown.classList.remove('active');
  }
}

// 退出登录
function logout(e) {
  e.preventDefault();

  fetch('/api/logout', {
    method: 'POST'
  }).then(() => {
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;

    // 更新显示
    const userName = document.querySelector('.user-name');
    userName.textContent = '未登录';

    const userImg = document.querySelector('.user-img');
    userImg.src = './assets/img/user.png';

    const dropdownAvatar = document.querySelector('.dropdown-avatar');
    dropdownAvatar.src = './assets/img/user.png';

    // 关闭下拉菜单
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.remove('active');
  });
}

// 打开头像上传模态框
function openAvatarModal() {
  const modal = document.getElementById('avatarModal');
  const previewImg = document.getElementById('previewImg');
  const userImg = document.querySelector('.user-img');
  previewImg.src = userImg.src;
  modal.classList.add('active');
}

// 关闭头像上传模态框
function closeAvatarModal() {
  const modal = document.getElementById('avatarModal');
  modal.classList.remove('active');
  // 清空文件输入
  document.getElementById('avatarInput').value = '';
}

// 选择图片
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewImg = document.getElementById('previewImg');
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// 上传头像
async function uploadAvatar() {
  const input = document.getElementById('avatarInput');
  const file = input.files[0];

  if (!file) {
    alert('请先选择图片');
    return;
  }

  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch('/api/upload/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // 更新头像显示
      const userImg = document.querySelector('.user-img');
      const dropdownAvatar = document.querySelector('.dropdown-avatar');
      userImg.src = `${data.avatar}?t=${Date.now()}`;
      dropdownAvatar.src = `${data.avatar}?t=${Date.now()}`;

      closeAvatarModal();
      alert('头像上传成功！');
    } else {
      alert(data.message || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    alert('上传失败，请检查网络连接');
  }
}

async function loadArticles() {
  try {
    const response = await fetch('/api/articles');
    const data = await response.json();

    if (data.success) {
      updateArticleNav(data.data);

      if (data.data.length > 0) {
        loadArticle(data.data[0].id);
      }
    }
  } catch (error) {
    console.error('加载文章列表失败:', error);
  }
}

function updateArticleNav(articles) {
  const navUl = document.querySelector('.left-nav ul');
  if (!navUl) return;

  navUl.innerHTML = articles.map(article => `
    <li>
      <a href="#" data-id="${article.id}" class="article-link">${article.title}</a>
    </li>
  `).join('');

  document.querySelectorAll('.article-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const articleId = parseInt(e.target.dataset.id);
      if (!isNaN(articleId)) {
        loadArticle(articleId);
      }
    });
  });
}

async function loadArticle(articleId, pushHistory = true) {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  try {
    const response = await fetch(`/api/articles/${articleId}`);
    const data = await response.json();

    if (data.success) {
      const article = data.data;
      mainContent.innerHTML = `
        <article class="article-content">
          <h1 class="article-title">${article.title}</h1>
          
          <div class="article-meta">
            <span class="meta-item">
              <a href="./pages/user_center.html?id=${article.author_id}" class="article-author-link">
                <img class="article-author-avatar" src="${article.author_avatar && article.author_avatar.startsWith('/') ? article.author_avatar : './assets/img/user.png'}" alt="头像">
                <span>${article.author_name || '未知作者'}</span>
              </a>
            </span>
            <span class="meta-item">发布时间：${formatDate(article.created_at)}</span>
            <span class="meta-item">分类：${article.category}</span>
            <span class="meta-item">浏览：${article.views}</span>
          </div>
          
          <div class="article-body">
            ${parseMarkdown(article.content)}
          </div>
        </article>
        
        <div class="comments-section" id="commentsSection">
          <h3 class="comments-title">评论</h3>
          <div class="comment-form" id="commentForm">
            <textarea id="commentContent" placeholder="写下你的评论..." rows="4"></textarea>
            <div class="comment-form-actions">
              <button class="submit-comment-btn" id="submitCommentBtn">发表评论</button>
            </div>
          </div>
          <div class="comments-list" id="commentsList"></div>
        </div>
      `;

      if (pushHistory) {
        history.pushState({ page: 'article', id: articleId }, '', `?article=${articleId}`);
      }

      scrollToMainContent();
      loadComments(articleId);
      bindCommentSubmit(articleId);
    } else {
      mainContent.innerHTML = `<p style="text-align: center; color: #999;">${data.message || '文章加载失败'}</p>`;
    }
  } catch (error) {
    console.error('加载文章失败:', error);
    mainContent.innerHTML = '<p style="text-align: center; color: #999;">文章加载失败，请稍后重试</p>';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 解析Markdown内容为HTML
function parseMarkdown(content) {
  if (!content) return '';

  let html = content;

  html = html.replace(/<[^>]*>/g, '');

  html = html.replace(/^#{1,2}\s(.+)$/gim, '<h2>$1</h2>');
  html = html.replace(/^#{3}\s(.+)$/gim, '<h3>$1</h3>');
  html = html.replace(/^#{4}\s(.+)$/gim, '<h4>$1</h4>');
  html = html.replace(/^#{5}\s(.+)$/gim, '<h5>$1</h5>');
  html = html.replace(/^#{6}\s(.+)$/gim, '<h6>$1</h6>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="article-image">');

  html = html.replace(/^\d+\.\s(.+)$/gim, '<li>$1</li>');
  html = html.replace(/^[-*+]\s(.+)$/gim, '<li>$1</li>');

  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');

  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

  html = html.replace(/^-{3,}$/gim, '<hr>');

  html = html.replace(/\n/g, '<br>');

  return html;
}

// 加载论坛列表
async function loadForumList(pushHistory = true) {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  try {
    const response = await fetch('/api/articles');
    const data = await response.json();

    if (data.success) {
      const articles = data.data;
      mainContent.innerHTML = `
        <div class="forum-container">
          <div class="forum-header">
            <h1 class="forum-title">论坛</h1>
            <p class="forum-subtitle">共 ${data.pagination.total} 篇文章</p>
            <button class="post-article-btn" id="postArticleBtn">发布文章</button>
          </div>
          <div class="forum-list">
            ${articles.map(article => `
              <div class="forum-card" data-id="${article.id}">
                <h3 class="forum-card-title">${article.title}</h3>
                <p class="forum-card-summary">${article.summary}</p>
                <div class="forum-card-meta">
                  <span class="forum-card-category">${article.category}</span>
                  <span class="forum-card-author">作者：${article.author_name}</span>
                  <span class="forum-card-date">${formatDate(article.created_at)}</span>
                  <span class="forum-card-views">浏览：${article.views}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      if (pushHistory) {
        history.pushState({ page: 'forum' }, '', '?forum');
      }

      document.querySelectorAll('.forum-card').forEach(card => {
        card.addEventListener('click', () => {
          const articleId = parseInt(card.dataset.id);
          if (!isNaN(articleId)) {
            loadArticle(articleId);
          }
        });
      });

      const postArticleBtn = document.getElementById('postArticleBtn');
      if (postArticleBtn) {
        postArticleBtn.addEventListener('click', () => {
          const token = localStorage.getItem('token');
          if (token) {
            window.location.href = './pages/post_article.html';
          } else {
            window.location.href = './pages/login.html?redirect=post_article';
          }
        });
      }
    } else {
      mainContent.innerHTML = `<p style="text-align: center; color: #999;">${data.message || '加载失败'}</p>`;
    }
  } catch (error) {
    console.error('加载论坛列表失败:', error);
    mainContent.innerHTML = '<p style="text-align: center; color: #999;">加载失败，请稍后重试</p>';
  }
}

// 加载文章评论
async function loadComments(articleId) {
  const commentsList = document.getElementById('commentsList');
  if (!commentsList) return;

  try {
    const response = await fetch(`/api/articles/${articleId}/comments`);
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      commentsList.innerHTML = data.data.map(comment => `
        <div class="comment-item">
          <div class="comment-author">
            <a href="./pages/user_center.html?id=${comment.author_id}" class="comment-author-link">
              <img class="comment-avatar" src="${comment.author_avatar && comment.author_avatar.startsWith('/') ? comment.author_avatar : './assets/img/user.png'}" alt="头像">
              <span class="comment-author-name">${comment.author_name || '未知用户'}</span>
            </a>
          </div>
          <div class="comment-content">${comment.content}</div>
          <div class="comment-time">${formatDate(comment.created_at)}</div>
        </div>
      `).join('');
    } else {
      commentsList.innerHTML = '<p class="no-comments">暂无评论，快来发表第一条评论吧！</p>';
    }
  } catch (error) {
    console.error('加载评论失败:', error);
    commentsList.innerHTML = '<p class="no-comments">加载评论失败，请稍后重试</p>';
  }
}

// 绑定评论提交事件
function bindCommentSubmit(articleId) {
  const submitBtn = document.getElementById('submitCommentBtn');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async () => {
    const content = document.getElementById('commentContent');
    if (!content || !content.value.trim()) {
      alert('请输入评论内容');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = './pages/login.html?redirect=user_center';
      return;
    }

    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content.value.trim() })
      });

      const data = await response.json();
      if (data.success) {
        content.value = '';
        loadComments(articleId);
      } else {
        alert(data.message || '评论失败');
      }
    } catch (error) {
      console.error('评论失败:', error);
      alert('评论失败，请稍后重试');
    }
  });
}

function scrollToMainContent() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// 全局锚点平滑滚动处理
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link) {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    if (targetId && targetId !== '#') {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
});

// 处理弹出状态变化
function handlePopState(event) {
  if (event.state) {
    if (event.state.page === 'forum') {
      loadForumList(false);
    } else if (event.state.page === 'article' && event.state.id) {
      loadArticle(event.state.id, false);
    }
  } else {
    loadForumList(false);
  }
}

// 初始化页面状态
function initPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('article');
  const forum = params.get('forum');

  if (articleId) {
    loadArticle(parseInt(articleId), false);
    history.replaceState({ page: 'article', id: parseInt(articleId) }, '', `?article=${articleId}`);
  } else {
    loadForumList(false);
    history.replaceState({ page: 'forum' }, '', '');
  }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();

  initPageFromURL();

  window.addEventListener('popstate', handlePopState);

  // 绑定论坛链接点击事件
  const forumLink = document.querySelector('.nav ul li:nth-child(2) a');
  if (forumLink) {
    forumLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await loadForumList();
      scrollToMainContent();
    });
  }

  // 绑定用户卡片点击事件
  const userCard = document.getElementById('userCard');
  userCard.addEventListener('click', handleUserCardClick);

  // 绑定页面点击事件（用于关闭下拉菜单）
  document.addEventListener('click', handleDocumentClick);

  // 绑定退出按钮点击事件
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', logout);

  // 绑定下拉菜单头部点击事件（跳转到用户中心）
  const dropdownHeader = document.querySelector('.dropdown-header');
  if (dropdownHeader) {
    dropdownHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentUser) {
        window.location.href = './pages/user_center.html';
      } else {
        window.location.href = './pages/login.html?redirect=user_center';
      }
    });
  }

  // 绑定用户中心链接点击事件
  const userCenterLink = document.getElementById('userCenterLink');
  if (userCenterLink) {
    userCenterLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
        window.location.href = './pages/user_center.html';
      } else {
        window.location.href = './pages/login.html?redirect=user_center';
      }
    });
  }

  // 绑定头像上传相关事件
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const modalClose = document.getElementById('modalClose');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const avatarInput = document.getElementById('avatarInput');
  const cancelBtn = document.getElementById('cancelBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const modalOverlay = document.getElementById('avatarModal');

  if (changeAvatarBtn) changeAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openAvatarModal();
  });
  if (modalClose) modalClose.addEventListener('click', closeAvatarModal);
  if (selectFileBtn) selectFileBtn.addEventListener('click', () => avatarInput.click());
  if (avatarInput) avatarInput.addEventListener('change', handleFileSelect);
  if (cancelBtn) cancelBtn.addEventListener('click', closeAvatarModal);
  if (uploadBtn) uploadBtn.addEventListener('click', uploadAvatar);

  // 点击模态框外部关闭
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeAvatarModal();
    }
  });

  // 侧边栏固定定位逻辑
  const leftNav = document.querySelector('.left-nav');
  const banner = document.querySelector('.banner');

  if (leftNav && banner) {
    const bannerHeight = banner.offsetHeight;

    window.addEventListener('scroll', () => {
      if (window.scrollY >= bannerHeight) {
        leftNav.classList.add('fixed');
      } else {
        leftNav.classList.remove('fixed');
      }
    });
  }
});