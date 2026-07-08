document.addEventListener('DOMContentLoaded', function () {
  const components = [
    { url: '/Components/header.html', position: 'beforeBegin', targetId: 'main' },
    { url: '/Components/footer.html', position: 'afterEnd', targetId: 'main' },
    { url: '/Components/agent.html' },
    { url: '/Components/musicPlayer.html' }
  ];

  let loadedCount = 0;

  function loadComponent(component) {
    fetch(component.url)
      .then(response => response.text())
      .then(html => {
        const container = document.createElement('div');
        container.innerHTML = html;

        if (component.position && component.targetId) {
          const target = document.getElementById(component.targetId);
          if (target) {
            if (component.position === 'beforeBegin') {
              target.parentNode.insertBefore(container.firstElementChild, target);
            } else if (component.position === 'afterEnd') {
              target.parentNode.insertBefore(container.firstElementChild, target.nextSibling);
            }
          }
        } else {
          document.body.appendChild(container.firstElementChild);
        }

        loadedCount++;
        checkAllLoaded();
      })
      .catch(error => {
        console.error('加载组件失败:', component.url, error);
        loadedCount++;
        checkAllLoaded();
      });
  }

  function checkAllLoaded() {
    if (loadedCount === components.length) {
      document.dispatchEvent(new Event('componentsLoaded'));
      initComponents();
    }
  }

  function initComponents() {
    if (typeof initMusicPlayer === 'function') {
      initMusicPlayer();
    }
    if (typeof initAgent === 'function') {
      initAgent();
    }
    if (typeof initCommonHeader === 'function') {
      initCommonHeader();
    }
  }

  components.forEach(loadComponent);
});