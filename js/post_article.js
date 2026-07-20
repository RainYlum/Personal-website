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

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

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

  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  html = '<p>' + html + '</p>';

  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');
  html = html.replace(/<p><ul>/g, '<ul>');
  html = html.replace(/<\/ul><\/p>/g, '</ul>');
  html = html.replace(/<p><blockquote>/g, '<blockquote>');
  html = html.replace(/<\/blockquote><\/p>/g, '</blockquote>');
  html = html.replace(/<p><pre>/g, '<pre>');
  html = html.replace(/<\/pre><\/p>/g, '</pre>');
  html = html.replace(/<p><h/g, '<h');
  html = html.replace(/<\/h(\d)><\/p>/g, '</h$1>');
  html = html.replace(/<p><hr><\/p>/g, '<hr>');

  return html;
}

function updatePreview() {
  const content = document.getElementById('articleContent').value;
  const previewContent = document.getElementById('previewContent');
  if (previewContent) {
    previewContent.innerHTML = parseMarkdown(content);
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
      showInfoToast('请填写完整的文章信息');
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
        showSuccessToast('文章发布成功！', function () {
          window.location.replace('/index.html?article=' + data.article.id);
        });
      } else {
        showErrorToast('发布失败：' + data.message);
      }
    } catch (error) {
      console.error('发布文章失败:', error);
      showErrorToast('发布失败，请稍后重试');
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
        case 'h4':
          before = '\n#### ';
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
        case 'list':
          before = '\n- ';
          after = '';
          break;
        case 'olist':
          before = '\n1. ';
          after = '';
          break;
        case 'link':
          const urlInput = prompt('请输入链接地址:', 'https://');
          if (urlInput) {
            before = '[';
            after = `](${urlInput})`;
          } else {
            return;
          }
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

      updatePreview();
    });
  });

  document.querySelectorAll('.editor-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.editor-panel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('editor' + this.dataset.tab.charAt(0).toUpperCase() + this.dataset.tab.slice(1)).classList.add('active');
      if (this.dataset.tab === 'preview') {
        updatePreview();
      }
    });
  });

  articleContent.addEventListener('input', updatePreview);

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
        showSuccessToast('图片上传成功');
        updatePreview();
      } else {
        showErrorToast('图片上传失败：' + data.message);
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      showErrorToast('图片上传失败，请稍后重试');
    }

    imageUpload.value = '';
  });
}

document.addEventListener('componentsLoaded', initPostArticlePage);