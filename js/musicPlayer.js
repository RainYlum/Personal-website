let songs = [];
let currentIndex = 0;
let isPlaying = false;
let loopMode = 'list';

function initMusicPlayer() {
  const player = document.getElementById('musicPlayer');
  const toggle = document.getElementById('musicPlayerToggle');
  const content = document.querySelector('.musicPlayer-content');
  const closeBtn = document.getElementById('musicPlayerClose');
  const audio = document.getElementById('musicPlayerAudio');
  const playBtn = document.getElementById('musicPlayerPlay');
  const prevBtn = document.getElementById('musicPlayerPrev');
  const nextBtn = document.getElementById('musicPlayerNext');
  const loopBtn = document.getElementById('musicPlayerLoop');
  const progressBar = document.querySelector('.musicPlayer-progress-bar');
  const progressFill = document.getElementById('musicPlayerProgress');
  const currentTimeEl = document.getElementById('musicPlayerCurrentTime');
  const durationEl = document.getElementById('musicPlayerDuration');
  const volumeSlider = document.getElementById('musicPlayerVolume');
  const titleEl = document.getElementById('musicPlayerTitle');
  const playlistContainer = document.querySelector('.musicPlayer-playlist');

  async function loadMusicList() {
    try {
      const response = await fetch('/api/music/list');
      const data = await response.json();

      if (data.success && data.songs.length > 0) {
        songs = data.songs;
        renderPlaylist();
        loadSong(0);
      } else {
        titleEl.textContent = '暂无音乐';
        playlistContainer.innerHTML = '<div class="playlist-item">请在 assets/audio 目录下添加音乐文件</div>';
      }
    } catch (error) {
      console.error('加载音乐列表失败:', error);
      titleEl.textContent = '加载失败';
      playlistContainer.innerHTML = '<div class="playlist-item">加载音乐列表失败</div>';
    }
  }

  function renderPlaylist() {
    playlistContainer.innerHTML = songs.map((song, index) =>
      `<div class="playlist-item" data-index="${index}">${song.title}</div>`
    ).join('');

    const playlistItems = playlistContainer.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, index) => {
      item.addEventListener('click', function () {
        loadSong(index);
        audio.play();
        const playIcon = playBtn.querySelector('i');
        playIcon.classList.remove('bi-play-fill');
        playIcon.classList.add('bi-pause-fill');
        isPlaying = true;
      });
    });
  }

  toggle.addEventListener('click', function () {
    player.classList.toggle('minimized');
    content.style.display = player.classList.contains('minimized') ? 'none' : 'block';
  });

  closeBtn.addEventListener('click', function () {
    player.classList.add('minimized');
    content.style.display = 'none';
  });

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function loadSong(index) {
    if (songs.length === 0) return;

    currentIndex = index;
    const song = songs[index];
    audio.src = song.src;
    titleEl.textContent = song.title;

    const playlistItems = playlistContainer.querySelectorAll('.playlist-item');
    playlistItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });

    audio.load();
  }

  function togglePlay() {
    if (songs.length === 0) return;

    const playIcon = playBtn.querySelector('i');
    if (isPlaying) {
      audio.pause();
      playIcon.classList.remove('bi-pause-fill');
      playIcon.classList.add('bi-play-fill');
    } else {
      audio.play();
      playIcon.classList.remove('bi-play-fill');
      playIcon.classList.add('bi-pause-fill');
    }
    isPlaying = !isPlaying;
  }

  function playPrev() {
    if (songs.length === 0) return;

    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = songs.length - 1;
    }
    loadSong(newIndex);
    audio.play();
    const playIcon = playBtn.querySelector('i');
    playIcon.classList.remove('bi-play-fill');
    playIcon.classList.add('bi-pause-fill');
    isPlaying = true;
  }

  function playNext() {
    if (songs.length === 0) return;

    let newIndex = currentIndex + 1;
    if (newIndex >= songs.length) {
      newIndex = 0;
    }
    loadSong(newIndex);
    audio.play();
    const playIcon = playBtn.querySelector('i');
    playIcon.classList.remove('bi-play-fill');
    playIcon.classList.add('bi-pause-fill');
    isPlaying = true;
  }

  function toggleLoop() {
    const modes = ['list', 'single', 'random'];
    const icons = ['bi-repeat', 'bi-repeat-1', 'bi-shuffle'];
    const currentModeIndex = modes.indexOf(loopMode);
    const nextModeIndex = (currentModeIndex + 1) % modes.length;
    loopMode = modes[nextModeIndex];

    const loopIcon = loopBtn.querySelector('i');
    loopIcon.className = `bi ${icons[nextModeIndex]}`;
    loopBtn.title = loopMode === 'list' ? '列表循环' : loopMode === 'single' ? '单曲循环' : '随机播放';
  }

  playBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', playPrev);

  nextBtn.addEventListener('click', playNext);

  loopBtn.addEventListener('click', toggleLoop);

  audio.addEventListener('timeupdate', function () {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', function () {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', function () {
    if (loopMode === 'single') {
      audio.currentTime = 0;
      audio.play();
    } else if (loopMode === 'random') {
      const newIndex = Math.floor(Math.random() * songs.length);
      loadSong(newIndex);
      audio.play();
    } else {
      playNext();
    }
  });

  progressBar.addEventListener('click', function (e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  });

  volumeSlider.addEventListener('input', function () {
    audio.volume = this.value / 100;
  });

  loadMusicList();
}
