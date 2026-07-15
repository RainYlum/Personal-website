// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');

      if (redirect === 'user_center') {
        window.location.href = '/pages/user_center.html';
      } else if (redirect === 'post_article') {
        window.location.href = '/pages/post_article.html';
      } else {
        window.location.href = '/index.html';
      }
    } else {
      errorMessage.textContent = data.message;
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    errorMessage.textContent = '登录失败，请检查网络连接';
    errorMessage.style.display = 'block';
    console.error('登录失败:', error);
  }
});