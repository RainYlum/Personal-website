let currentUser = null;

async function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const userName = document.querySelector('.user-name');
  const userImg = document.querySelector('.user-img');
  const dropdownAvatar = document.querySelector('.dropdown-avatar');
  const dropdownName = document.querySelector('.dropdown-name');
  const dropdownEmail = document.querySelector('.dropdown-email');

  if (!userName || !userImg) return;

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
        dropdownEmail.textContent = data.user.email || '未绑定邮箱';

      } else {
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

function handleUserCardClick(e) {
  e.stopPropagation();

  const dropdown = document.getElementById('userDropdown');
  const navMenu = document.getElementById('navMenu');
  const userCard = document.getElementById('userCard');

  if (!currentUser) {
    window.location.href = '/pages/login.html';
    return;
  }

  if (navMenu && navMenu.contains(userCard)) {
    window.location.href = '/pages/user_center.html';
  } else {
    dropdown.classList.toggle('active');
  }
}

function handleDocumentClick(e) {
  const dropdown = document.getElementById('userDropdown');
  const userCard = document.getElementById('userCard');

  if (dropdown && !userCard.contains(e.target)) {
    dropdown.classList.remove('active');
  }
}

async function logout(e) {
  if (e) e.preventDefault();

  try {
    await fetch('/api/logout', {
      method: 'POST'
    });
  } catch (error) {
    console.error('退出登录失败:', error);
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;

  const userName = document.querySelector('.user-name');
  userName.textContent = '未登录';

  const userImg = document.querySelector('.user-img');
  userImg.src = '/assets/img/user.png';

  const dropdownAvatar = document.querySelector('.dropdown-avatar');
  dropdownAvatar.src = '/assets/img/user.png';

  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.remove('active');

  window.location.href = '/index.html';
}

function openAvatarModal() {
  const modal = document.getElementById('avatarModal');
  const previewImg = document.getElementById('previewImg');
  const userImg = document.querySelector('.user-img');
  if (previewImg && userImg) {
    previewImg.src = userImg.src;
  }
  if (modal) {
    modal.classList.add('active');
  }
}

function closeAvatarModal() {
  const modal = document.getElementById('avatarModal');
  if (modal) {
    modal.classList.remove('active');
  }
  const avatarInput = document.getElementById('avatarInput');
  if (avatarInput) {
    avatarInput.value = '';
  }
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const previewImg = document.getElementById('previewImg');
      if (previewImg) {
        previewImg.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

async function uploadAvatar() {
  const input = document.getElementById('avatarInput');
  const file = input.files[0];

  if (!file) {
    showInfoToast('请先选择图片');
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
      const userImg = document.querySelector('.user-img');
      const dropdownAvatar = document.querySelector('.dropdown-avatar');
      const newAvatarUrl = `${data.avatar}?t=${Date.now()}`;
      userImg.src = newAvatarUrl;
      dropdownAvatar.src = newAvatarUrl;

      if (currentUser) {
        currentUser.avatar = data.avatar;
      }

      closeAvatarModal();
      showSuccessToast('头像上传成功！');
    } else {
      showErrorToast(data.message || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    showErrorToast('上传失败，请检查网络连接');
  }
}

function initCommonHeader() {
  checkLoginStatus();

  const userCard = document.getElementById('userCard');
  if (userCard) {
    userCard.addEventListener('click', handleUserCardClick);
  }

  document.addEventListener('click', handleDocumentClick);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  const dropdownHeader = document.querySelector('.dropdown-header');
  if (dropdownHeader) {
    dropdownHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentUser) {
        window.location.href = '/pages/user_center.html';
      } else {
        window.location.href = '/pages/login.html?redirect=user_center';
      }
    });
  }

  const userCenterLink = document.getElementById('userCenterLink');
  if (userCenterLink) {
    userCenterLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
        window.location.href = '/pages/user_center.html';
      } else {
        window.location.href = '/pages/login.html?redirect=user_center';
      }
    });
  }

  const changeAvatarBtn = document.getElementById('changeAvatarBtn');
  const modalClose = document.getElementById('modalClose');
  const selectFileBtn = document.getElementById('selectFileBtn');
  const avatarInput = document.getElementById('avatarInput');
  const cancelBtn = document.getElementById('cancelBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const modalOverlay = document.getElementById('avatarModal');

  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAvatarModal();
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeAvatarModal);
  }

  if (selectFileBtn) {
    selectFileBtn.addEventListener('click', () => avatarInput.click());
  }

  if (avatarInput) {
    avatarInput.addEventListener('change', handleFileSelect);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeAvatarModal);
  }

  if (uploadBtn) {
    uploadBtn.addEventListener('click', uploadAvatar);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeAvatarModal();
      }
    });
  }

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    let navOverlay = document.getElementById('navOverlay');
    if (!navOverlay) {
      navOverlay = document.createElement('div');
      navOverlay.id = 'navOverlay';
      navOverlay.className = 'nav-overlay';
      document.body.appendChild(navOverlay);
    }

    let originalParent = navMenu.parentNode;
    let userCardOriginalParent = userCard ? userCard.parentNode : null;
    let userCardOriginalSibling = userCard ? userCard.nextSibling : null;
    let wasMoved = false;

    function handleResponsive() {
      if (window.innerWidth <= 768 && !wasMoved) {
        navMenu.parentNode.removeChild(navMenu);
        document.body.appendChild(navMenu);

        if (userCard) {
          userCard.parentNode.removeChild(userCard);
          navMenu.insertBefore(userCard, navMenu.firstChild);
        }

        wasMoved = true;
      } else if (window.innerWidth > 768 && wasMoved) {
        navMenu.parentNode.removeChild(navMenu);
        originalParent.appendChild(navMenu);

        if (userCard && userCardOriginalParent) {
          userCard.parentNode.removeChild(userCard);
          if (userCardOriginalSibling) {
            userCardOriginalParent.insertBefore(userCard, userCardOriginalSibling);
          } else {
            userCardOriginalParent.appendChild(userCard);
          }
        }

        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        wasMoved = false;
      }
    }

    handleResponsive();
    window.addEventListener('resize', handleResponsive);

    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navMenu.classList.toggle('active');
      navOverlay.classList.toggle('active');
    });

    navOverlay.addEventListener('click', function () {
      navMenu.classList.remove('active');
      navOverlay.classList.remove('active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function () {
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
      });
    });
  }
}

function showToast(title, message, icon = '📢', onClose = null) {
  let toastOverlay = document.getElementById('toastOverlay');
  if (!toastOverlay) {
    toastOverlay = document.createElement('div');
    toastOverlay.id = 'toastOverlay';
    toastOverlay.className = 'toast-overlay';
    document.body.appendChild(toastOverlay);
  }

  toastOverlay.innerHTML = `
    <div class="toast-modal">
      <button class="toast-close" id="toastClose">&times;</button>
      <div class="toast-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <button class="toast-btn" id="toastBtn">确定</button>
    </div>
  `;

  toastOverlay.classList.add('show');

  function closeToast() {
    toastOverlay.classList.remove('show');
    if (onClose) onClose();
  }

  document.getElementById('toastClose').addEventListener('click', closeToast);
  document.getElementById('toastBtn').addEventListener('click', closeToast);
  toastOverlay.addEventListener('click', (e) => {
    if (e.target === toastOverlay) {
      closeToast();
    }
  });
}

function showSuccessToast(message, onClose = null) {
  showToast('操作成功', message, '✅', onClose);
}

function showErrorToast(message, onClose = null) {
  showToast('操作失败', message, '❌', onClose);
}

function showInfoToast(message, onClose = null) {
  showToast('提示', message, 'ℹ️', onClose);
}

function smoothScrollTo(target, options = {}) {
  const { duration = 500, offset = 0 } = options;
  
  if (typeof target === 'string') {
    target = document.querySelector(target);
  }
  
  if (!target) return;
  
  const targetPosition = target.getBoundingClientRect().top + window.pageYOffset + offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    
    window.scrollTo({
      top: startPosition + distance * easeOutCubic,
      behavior: 'smooth'
    });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}