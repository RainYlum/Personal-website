function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

async function loadForumList() {
  const forumContainer = document.getElementById('forumContainer');
  if (!forumContainer) return;

  forumContainer.innerHTML = '<div style="text-align: center; padding: 50px; color: #999;">加载中...</div>';

  try {
    const response = await fetch('/api/articles');
    const data = await response.json();

    if (data.success) {
      const articles = data.data;
      forumContainer.innerHTML = `
        <div class="forum-header">
          <h1 class="forum-title">论坛</h1>
          <p class="forum-subtitle">共 ${data.pagination ? data.pagination.total : articles.length} 篇文章</p>
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
      `;

      document.querySelectorAll('.forum-card').forEach(card => {
        card.addEventListener('click', () => {
          const articleId = parseInt(card.dataset.id);
          if (!isNaN(articleId)) {
            window.location.href = `/index.html?article=${articleId}`;
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
      forumContainer.innerHTML = `<p style="text-align: center; color: #999; padding: 50px;">${data.message || '加载失败'}</p>`;
    }
  } catch (error) {
    console.error('加载论坛列表失败:', error);
    forumContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 50px;">加载失败，请稍后重试</p>';
  }
}

function initForumPage() {
  loadForumList();
}

document.addEventListener('DOMContentLoaded', initForumPage);