let currentUser = null;

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

async function checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
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
      updateUserCard(data.user);
      return true;
    }
  } catch (error) {
    console.error('检查登录状态失败:', error);
  }

  localStorage.removeItem('token');
  return false;
}

function updateUserCard(user) {
  const userName = document.querySelector('.user-name');
  const userImg = document.querySelector('.user-img');
  const dropdownAvatar = document.querySelector('.dropdown-avatar');
  const dropdownName = document.querySelector('.dropdown-name');
  const dropdownEmail = document.querySelector('.dropdown-email');

  if (userName) userName.textContent = user.nickname || user.username;
  if (dropdownName) dropdownName.textContent = user.nickname || user.username;
  if (dropdownEmail) dropdownEmail.textContent = user.email;

  const avatarUrl = user.avatar && user.avatar.startsWith('/') ? user.avatar : './assets/img/user.png';
  if (userImg) userImg.src = avatarUrl;
  if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
}

async function loadUserProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = './pages/login.html?redirect=user_center';
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
      window.location.href = './pages/login.html?redirect=user_center';
    }
  } catch (error) {
    console.error('加载用户信息失败:', error);
    window.location.href = './pages/login.html?redirect=user_center';
  }
}

function renderUserProfile(user) {
  const profileAvatar = document.getElementById('profileAvatar');
  const profileNickname = document.getElementById('profileNickname');
  const profileUsername = document.getElementById('profileUsername');
  const profileEmail = document.getElementById('profileEmail');
  const profileCreatedAt = document.getElementById('profileCreatedAt');
  const profileLastLogin = document.getElementById('profileLastLogin');

  if (profileAvatar) {
    profileAvatar.src = user.avatar && user.avatar.startsWith('/') ? user.avatar : './assets/img/user.png';
  }
  if (profileNickname) profileNickname.textContent = user.nickname || user.username;
  if (profileUsername) profileUsername.textContent = '@' + user.username;
  if (profileEmail) profileEmail.textContent = user.email;
  if (profileCreatedAt) profileCreatedAt.textContent = formatDate(user.created_at);
  if (profileLastLogin) profileLastLogin.textContent = formatDate(user.last_login_at);
}

function toggleEditProfile() {
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

  document.getElementById('editNickname').value = currentUser.nickname || '';
  document.getElementById('editEmail').value = currentUser.email || '';
  document.getElementById('editPassword').value = '';
  document.getElementById('editConfirmPassword').value = '';
}

async function updateProfile(event) {
  event.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) return;

  const nickname = document.getElementById('editNickname').value.trim();
  const email = document.getElementById('editEmail').value.trim();
  const password = document.getElementById('editPassword').value;
  const confirmPassword = document.getElementById('editConfirmPassword').value;

  if (!nickname || !email) {
    alert('请填写昵称和邮箱');
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
      body: JSON.stringify({ nickname, email, password })
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

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

function handleUserCardClick(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('userDropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function handleDocumentClick(e) {
  const dropdown = document.getElementById('userDropdown');
  const userCard = document.getElementById('userCard');
  if (dropdown && userCard && !userCard.contains(e.target)) {
    dropdown.style.display = 'none';
  }
}

let previewImg = null;

function openAvatarModal() {
  const modal = document.getElementById('avatarModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeAvatarModal() {
  const modal = document.getElementById('avatarModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function selectFile() {
  const input = document.getElementById('avatarInput');
  if (input) {
    input.click();
  }
}

function previewAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg = document.getElementById('previewImg');
      if (previewImg) {
        previewImg.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

async function uploadAvatar() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('请先登录');
    return;
  }

  const input = document.getElementById('avatarInput');
  const file = input.files[0];
  if (!file) {
    alert('请选择图片');
    return;
  }

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
      alert('头像上传成功');
      closeAvatarModal();
      loadUserProfile();
      updateUserCard({ ...currentUser, avatar: data.avatar });
      input.value = '';
    } else {
      alert(data.message || '上传失败');
    }
  } catch (error) {
    console.error('上传头像失败:', error);
    alert('上传失败，请稍后重试');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();

  const userCard = document.getElementById('userCard');
  if (userCard) userCard.addEventListener('click', handleUserCardClick);

  document.addEventListener('click', handleDocumentClick);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  const dropdownHeader = document.getElementById('dropdownHeader');
  if (dropdownHeader) {
    dropdownHeader.addEventListener('click', () => {
      window.location.href = 'user_center.html';
    });
  }

  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) editProfileBtn.addEventListener('click', toggleEditProfile);

  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', toggleEditProfile);

  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) editProfileForm.addEventListener('submit', updateProfile);

  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const modalClose = document.getElementById('modalClose');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const avatarInput = document.getElementById('avatarInput');
  const cancelBtn = document.getElementById('cancelBtn');
  const uploadBtn = document.getElementById('uploadBtn');

  if (changeAvatarBtn) changeAvatarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openAvatarModal();
  });

  if (modalClose) modalClose.addEventListener('click', closeAvatarModal);
  if (selectFileBtn) selectFileBtn.addEventListener('click', selectFile);
  if (avatarInput) avatarInput.addEventListener('change', previewAvatar);
  if (cancelBtn) cancelBtn.addEventListener('click', closeAvatarModal);
  if (uploadBtn) uploadBtn.addEventListener('click', uploadAvatar);
});