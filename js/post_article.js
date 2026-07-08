async function checkLoginStatusForPost() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/pages/login.html?redirect=post_article';
    return;
  }

  try {
    const response = await fetch('/api/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
    } else {
      localStorage.removeItem('token');
      window.location.href = '/pages/login.html?redirect=post_article';
    }
  } catch (error) {
    console.error('检查登录状态失败:', error);
    localStorage.removeItem('token');
    window.location.href = '/pages/login.html?redirect=post_article';
  }
}

function initPostArticlePage() {
  checkLoginStatusForPost();

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
        window.location.replace('/index.html?article=' + data.article.id);
      } else {
        alert('发布失败：' + data.message);
      }
    } catch (error) {
      console.error('发布文章失败:', error);
      alert('发布失败，请稍后重试');
    }
  });

  cancelPostBtn.addEventListener('click', function () {
    window.location.href = '/index.html#main';
  });

  const articleContent = document.getElementById('articleContent');

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
          document.getElementById('imageUpload').click();
          return;
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

  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/article', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const imageMarkdown = `![图片](${data.url})`;
        const start = articleContent.selectionStart;
        const end = articleContent.selectionEnd;
        const newValue = articleContent.value.substring(0, start) + imageMarkdown + articleContent.value.substring(end);
        articleContent.value = newValue;
        articleContent.focus();
        articleContent.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
      } else {
        alert('图片上传失败：' + data.message);
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请稍后重试');
    }

    imageUpload.value = '';
  });
}

document.addEventListener('componentsLoaded', initPostArticlePage);