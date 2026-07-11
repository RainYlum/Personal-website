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
              <a href="/pages/user_center.html?id=${article.author_id}" class="article-author-link">
                <img class="article-author-avatar" src="${article.author_avatar && article.author_avatar.startsWith('/') ? article.author_avatar : '/assets/img/user.png'}" alt="头像">
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
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="article-image">');

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, text, url) {
    if (url === 'url') {
      return `<a href="javascript:void(0)" onclick="showInfoToast('该链接未配置，请联系管理员')" style="color: #999; text-decoration: none;">${text}</a>`;
    }
    if (/^(https?:\/\/|\/)/i.test(url)) {
      return `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
    }
    return `<a href="https://${url}" target="_blank" rel="noopener">${text}</a>`;
  });

  html = html.replace(/^\d+\.\s(.+)$/gim, '<li>$1</li>');
  html = html.replace(/^[-*+]\s(.+)$/gim, '<li>$1</li>');

  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');

  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

  html = html.replace(/^-{3,}$/gim, '<hr>');

  html = html.replace(/\n/g, '<br>');

  return html;
}

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
            window.location.href = '/pages/post_article.html';
          } else {
            window.location.href = '/pages/login.html?redirect=post_article';
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
            <a href="/pages/user_center.html?id=${comment.author_id}" class="comment-author-link">
              <img class="comment-avatar" src="${comment.author_avatar && comment.author_avatar.startsWith('/') ? comment.author_avatar : '/assets/img/user.png'}" alt="头像">
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

function bindCommentSubmit(articleId) {
  const submitBtn = document.getElementById('submitCommentBtn');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async () => {
    const content = document.getElementById('commentContent');
    if (!content || !content.value.trim()) {
      showInfoToast('请输入评论内容');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/pages/login.html?redirect=user_center';
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
        showSuccessToast('评论发布成功');
      } else {
        showErrorToast(data.message || '评论失败');
      }
    } catch (error) {
      console.error('评论失败:', error);
      showErrorToast('评论失败，请稍后重试');
    }
  });
}

function scrollToMainContent() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

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

function initIndexPage() {
  initPageFromURL();

  window.addEventListener('popstate', handlePopState);

  const forumLink = document.querySelector('.nav ul li:nth-child(2) a');
  if (forumLink) {
    forumLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await loadForumList();
      scrollToMainContent();
    });
  }

  const leftNav = document.querySelector('.left-nav');
  const banner = document.querySelector('.banner');
  const nav = document.querySelector('.nav');

  if (leftNav) {
    let scrollThreshold = 0;
    if (banner) {
      scrollThreshold = banner.offsetHeight;
    } else if (nav) {
      scrollThreshold = nav.offsetHeight;
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY >= scrollThreshold) {
        leftNav.classList.add('fixed');
      } else {
        leftNav.classList.remove('fixed');
      }
    });
  }
}

document.addEventListener('componentsLoaded', initIndexPage);