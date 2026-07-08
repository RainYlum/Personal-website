let isVisitor = false;

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function updateUserCard(user) {
  const userName = document.querySelector('.user-name');
  const userImg = document.querySelector('.user-img');
  const dropdownAvatar = document.querySelector('.dropdown-avatar');
  const dropdownName = document.querySelector('.dropdown-name');
  const dropdownEmail = document.querySelector('.dropdown-email');

  if (userName) userName.textContent = user.username;
  if (dropdownName) dropdownName.textContent = user.username;
  if (dropdownEmail) dropdownEmail.textContent = user.email;

  const avatarUrl = user.avatar && user.avatar.startsWith('/') ? user.avatar : '/assets/img/user.png';
  if (userImg) userImg.src = avatarUrl;
  if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
}

function enableVisitorMode() {
  isVisitor = true;
  
  const visitorLabel = document.getElementById('visitorLabel');
  if (visitorLabel) visitorLabel.style.display = 'block';
  
  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) editProfileBtn.style.display = 'none';
  
  const postArticleBtn = document.getElementById('postArticleBtn');
  if (postArticleBtn) postArticleBtn.style.display = 'none';
  
  const emailDetail = document.getElementById('emailDetail');
  if (emailDetail) emailDetail.style.display = 'none';
  
  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  if (changeAvatarBtn) changeAvatarBtn.style.display = 'none';
}

async function loadUserProfile() {
  const params = new URLSearchParams(window.location.search);
  const targetUserId = params.get('id');
  
  if (targetUserId) {
    try {
      const response = await fetch(`/api/user/${targetUserId}`);
      const data = await response.json();
      
      if (data.success) {
        renderUserProfile(data.user);
        enableVisitorMode();
        checkLoginStatus();
        return;
      } else {
        alert(data.message || '用户不存在');
        window.location.href = '/index.html';
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      alert('加载用户信息失败');
      window.location.href = '/index.html';
    }
    return;
  }
  
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/pages/login.html?redirect=user_center';
    return;
  }

  try {
    const response = await fetch('/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.success) {
      currentUser = data.user;
      renderUserProfile(data.user);
      updateUserCard(data.user);
    } else {
      window.location.href = '/pages/login.html?redirect=user_center';
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    window.location.href = '/pages/login.html?redirect=user_center';
  }
}

function renderUserProfile(user) {
  const profileAvatar = document.getElementById('profileAvatar');
  const profileNickname = document.getElementById('profileNickname');
  const profileEmail = document.getElementById('profileEmail');
  const profileCreatedAt = document.getElementById('profileCreatedAt');
  const profileLastLogin = document.getElementById('profileLastLogin');

  if (profileAvatar) {
    profileAvatar.src = user.avatar && user.avatar.startsWith('/') ? user.avatar : '/assets/img/user.png';
  }
  if (profileNickname) profileNickname.textContent = user.username;
  if (profileEmail) profileEmail.textContent = user.email || '-';
  if (profileCreatedAt) profileCreatedAt.textContent = formatDate(user.created_at);
  if (profileLastLogin) profileLastLogin.textContent = formatDate(user.last_login);
}

function toggleEditProfile() {
  if (isVisitor) return;
  
  const editSection = document.getElementById('editProfileSection');
  if (editSection.style.display === 'none') {
    editSection.style.display = 'block';
    fillEditForm();
  } else {
    editSection.style.display = 'none';
  }
}

function fillEditForm() {
  if (!currentUser) return;

  document.getElementById('editEmail').value = currentUser.email || '';
  document.getElementById('editPassword').value = '';
  document.getElementById('editConfirmPassword').value = '';
}

async function updateProfile(event) {
  event.preventDefault();
  
  if (isVisitor) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  const email = document.getElementById('editEmail').value.trim();
  const password = document.getElementById('editPassword').value;
  const confirmPassword = document.getElementById('editConfirmPassword').value;

  if (!email) {
    alert('请填写邮箱');
    return;
  }

  if (password && password !== confirmPassword) {
    alert('两次密码输入不一致');
    return;
  }

  try {
    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
      alert('资料更新成功');
      toggleEditProfile();
      loadUserProfile();
      updateUserCard(data.user);
    } else {
      alert(data.message || '更新失败');
    }
  } catch (error) {
    console.error('更新资料失败:', error);
    alert('更新失败，请稍后重试');
  }
}

function initUserCenterPage() {
  loadUserProfile();

  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) editProfileBtn.addEventListener('click', toggleEditProfile);

  const postArticleBtn = document.getElementById('postArticleBtn');
  if (postArticleBtn) {
    postArticleBtn.addEventListener('click', () => {
      if (isVisitor) {
        window.location.href = '/pages/login.html?redirect=post_article';
      } else {
        window.location.href = '/pages/post_article.html';
      }
    });
  }

  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', toggleEditProfile);

  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) editProfileForm.addEventListener('submit', updateProfile);
}

document.addEventListener('componentsLoaded', initUserCenterPage);