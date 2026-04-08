import { refreshIcons } from './icons.js';

const audioTracks = [
  { file: 'Track 1.mp3', name: 'Ashen Whispers' },
  { file: 'Track 2.mp3', name: "Sovereign's Lament" },
  { file: 'Track 3.mp3', name: 'The Hollow Throne' },
  { file: 'Track 4.mp3', name: 'Blood & Bone' },
  { file: 'Track 5.mp3', name: 'Echoes of the Maker' },
  { file: 'Track 6.mp3', name: 'Twilight Dominion' },
];

let audio = null;
let currentTrackIndex = 0;
let isMuted = false;
let savedVolume = 0.3;

export function initAudio() {
  const savedMuted = localStorage.getItem('audioMuted');
  const savedVol = localStorage.getItem('audioVolume');

  if (savedMuted === 'true') {
    isMuted = true;
  }
  if (savedVol !== null) {
    savedVolume = parseFloat(savedVol);
    document.getElementById('volume-slider').value = savedVolume * 100;
  }

  currentTrackIndex = 0;

  audio = new Audio(audioTracks[currentTrackIndex].file);
  audio.volume = savedVolume;
  audio.muted = isMuted;
  audio.loop = false;

  audio.addEventListener('ended', () => {
    playNextTrack();
  });

  audio.addEventListener('error', () => {
    console.log('Audio error, trying next track...');
    playNextTrack();
  });

  updateMuteIcon();
  updateTrackName();
  preloadNextTrack();
}

function preloadNextTrack() {
  const nextIndex = (currentTrackIndex + 1) % audioTracks.length;
  const preloadAudio = new Audio();
  preloadAudio.preload = 'auto';
  preloadAudio.src = audioTracks[nextIndex].file;
}

function playNextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
  audio.src = audioTracks[currentTrackIndex].file;
  updateTrackName();
  audio.play();
  preloadNextTrack();
}

function playPrevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length;
  audio.src = audioTracks[currentTrackIndex].file;
  updateTrackName();
  audio.play();
  preloadNextTrack();
}

function updateTrackName() {
  const trackNameEl = document.getElementById('track-name');
  if (trackNameEl) {
    trackNameEl.textContent = audioTracks[currentTrackIndex].name;
  }
}

function updateSliderFill(slider) {
  const value = slider.value;
  const percent = (value / slider.max) * 100;
  slider.style.background = `linear-gradient(to right, #8b2d2d 0%, #8b2d2d ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%, rgba(255, 255, 255, 0.2) 100%)`;
}

export function setupAudioControls() {
  const volumeSlider = document.getElementById('volume-slider');
  const muteBtn = document.getElementById('mute-btn');
  const prevBtn = document.getElementById('prev-track-btn');
  const nextBtn = document.getElementById('next-track-btn');

  updateSliderFill(volumeSlider);

  volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    audio.volume = volume;
    savedVolume = volume;
    localStorage.setItem('audioVolume', volume);
    updateSliderFill(e.target);

    if (volume === 0) {
      isMuted = true;
    } else {
      isMuted = false;
      audio.muted = false;
    }
    localStorage.setItem('audioMuted', isMuted);
    updateMuteIcon();
  });

  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    audio.muted = isMuted;
    localStorage.setItem('audioMuted', isMuted);
    updateMuteIcon();
  });

  prevBtn.addEventListener('click', () => {
    playPrevTrack();
  });

  nextBtn.addEventListener('click', () => {
    playNextTrack();
  });

  let audioStarted = false;
  const startAudio = () => {
    if (!audioStarted && audio.paused && !isMuted) {
      audio.play().then(() => {
        audioStarted = true;
        document.removeEventListener('click', startAudio);
        document.removeEventListener('keydown', startAudio);
        document.removeEventListener('touchstart', startAudio);
      }).catch((e) => {
        console.log('Audio play failed, will retry on next interaction:', e);
      });
    }
  };
  document.addEventListener('click', startAudio);
  document.addEventListener('keydown', startAudio);
  document.addEventListener('touchstart', startAudio);

  audio.addEventListener('canplaythrough', () => {
    if (!audioStarted && !isMuted) {
      audio.play().then(() => {
        audioStarted = true;
      }).catch(() => {});
    }
  });
}

function updateMuteIcon() {
  const muteBtn = document.getElementById('mute-btn');
  const volumeIcon = document.getElementById('volume-icon');

  if (isMuted || audio.volume === 0) {
    volumeIcon.setAttribute('data-lucide', 'volume-x');
    muteBtn.classList.add('muted');
  } else if (audio.volume < 0.5) {
    volumeIcon.setAttribute('data-lucide', 'volume-1');
    muteBtn.classList.remove('muted');
  } else {
    volumeIcon.setAttribute('data-lucide', 'volume-2');
    muteBtn.classList.remove('muted');
  }
  refreshIcons();
}
