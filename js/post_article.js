// post_article.js

let currentUser = null;

// 检查登录状态
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

        if (data.user.avatar) {
          userImg.src = data.user.avatar;
          dropdownAvatar.src = data.user.avatar;
        }

        dropdownName.textContent = data.user.username || '用户';
        dropdownEmail.textContent = data.user.email || '';
      } else {
        localStorage.removeItem('token');
        window.location.href = './login.html?redirect=post_article';
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      localStorage.removeItem('token');
      window.location.href = './login.html?redirect=post_article';
    }
  } else {
    window.location.href = './login.html?redirect=post_article';
  }
}

// 文章发布表单提交事件
document.addEventListener('DOMContentLoaded', function () {
  checkLoginStatus();

  const postArticleForm = document.getElementById('postArticleForm');
  const cancelPostBtn = document.getElementById('cancelPostBtn');

  postArticleForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('articleTitle').value.trim();
    const category = document.getElementById('articleCategory').value;
    const summary = document.getElementById('articleSummary').value.trim();
    const content = document.getElementById('articleContent').value.trim();

    if (!title || !category || !summary || !content) {
      alert('请填写完整的文章信息');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, category, summary, content })
      });

      const data = await response.json();

      if (data.success) {
        alert('文章发布成功！');
        window.location.href = '../index.html?article=' + data.article.id;
      } else {
        alert('发布失败：' + data.message);
      }
    } catch (error) {
      console.error('发布文章失败:', error);
      alert('发布失败，请稍后重试');
    }
  });

  // 取消发布按钮点击事件
  cancelPostBtn.addEventListener('click', function () {
    window.location.href = '../index.html#main';
  });

  const articleContent = document.getElementById('articleContent');

  // 工具栏按钮点击事件
  document.querySelectorAll('.toolbar-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const action = this.dataset.action;
      const start = articleContent.selectionStart;
      const end = articleContent.selectionEnd;
      const selectedText = articleContent.value.substring(start, end);

      let before = '';
      let after = '';

      switch (action) {
        case 'h2':
          before = '\n## ';
          after = '\n';
          break;
        case 'h3':
          before = '\n### ';
          after = '\n';
          break;
        case 'quote':
          before = '\n> ';
          after = '\n';
          break;
        case 'bold':
          before = '**';
          after = '**';
          break;
        case 'italic':
          before = '*';
          after = '*';
          break;
        case 'strikethrough':
          before = '~~';
          after = '~~';
          break;
        case 'code':
          before = '`';
          after = '`';
          break;
        case 'codeblock':
          before = '\n```\n';
          after = '\n```\n';
          break;
        case 'list':
          before = '\n- ';
          after = '';
          break;
        case 'olist':
          before = '\n1. ';
          after = '';
          break;
        case 'link':
          before = '[';
          after = '](url)';
          break;
        case 'image':
          before = '![';
          after = '](image-url)';
          break;
        case 'hr':
          before = '\n---\n';
          after = '';
          break;
      }

      const newValue = articleContent.value.substring(0, start) + before + selectedText + after + articleContent.value.substring(end);
      articleContent.value = newValue;

      articleContent.focus();
      const newCursorPos = start + before.length + selectedText.length;
      articleContent.setSelectionRange(newCursorPos, newCursorPos);
    });
  });

  const userCard = document.getElementById('userCard');
  const userDropdown = document.getElementById('userDropdown');

  // 点击用户卡片显示下拉菜单
  userCard.addEventListener('click', function (e) {
    e.stopPropagation();
    userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
  });

  // 点击文档外部关闭下拉菜单
  document.addEventListener('click', function (e) {
    if (!userCard.contains(e.target)) {
      userDropdown.style.display = 'none';
    }
  });

  // 退出登录按钮点击事件
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', async function () {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('token');
        currentUser = null;
        window.location.href = '../index.html';
      }
    } catch (error) {
      console.error('退出登录失败:', error);
      localStorage.removeItem('token');
      currentUser = null;
      window.location.href = '../index.html';
    }
  });

  // 点击下拉菜单头像跳转用户中心
  const dropdownHeader = document.getElementById('dropdownHeader');
  dropdownHeader.addEventListener('click', function () {
    window.location.href = 'user_center.html';
  });
});