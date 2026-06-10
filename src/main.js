// =====================================================
// THE ASHEN REALMS - Interactive Compendium
// Entry Point — Vite ES Module Build
// =====================================================

// Fonts (WOFF2 via @fontsource)
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';
import '@fontsource/spectral/400.css';
import '@fontsource/spectral/400-italic.css';
import '@fontsource/spectral/500.css';
import '@fontsource/spectral/600.css';
import '@fontsource/spectral/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

// Vendor CSS
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
import 'leaflet/dist/leaflet.css';

// App CSS loaded via <link> in index.html to prevent FOUC

// Leaflet marker icon fix
import L from 'leaflet';

// Modules
import state from './modules/state.js';
import { refreshIcons } from './modules/icons.js';
import { initAudio, setupAudioControls } from './modules/audio.js';
import { setupLightbox, attachImageZoom } from './modules/images.js';
import { initParticles } from './modules/particles.js';
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { updateHash, setHashHandlers, restoreFromHash } from './modules/hash-routing.js';
import { buildWikiIndex } from './modules/wiki-links.js';
import { buildNavigation, openCategory, navigateToItemById, setNavigationHandlers } from './modules/navigation.js';
import {
  setRealmHandlers,
  setupArchiveEntries,
  showArchiveLanding,
  enterArchiveSilent,
  filterDataForRealm,
  getRealm,
} from './modules/realm.js';
import { showItem, navigateToItem, showRelationshipMap } from './modules/article.js';
import { setupSearch, setSearchHandlers } from './modules/search.js';
import { setupBondsLink, showRelationships } from './modules/bonds.js';
import { setupSpellsLink, showSpells } from './modules/spells.js';
import { toggleBookmark, showBookmarksList, updateBookmarkButton, setBookmarkHandlers } from './modules/bookmarks.js';
import { setupKeyboardShortcuts, setKeyboardHandlers } from './modules/keyboard.js';
import {
  setupDynamicQuotes,
  setupMobileMenu,
  setupBackToTop,
  setupSwipeGestures,
  setupLogoClick,
  showNotFound,
  restoreScrollPosition,
  setUiHandlers,
  setupTopBarActions,
} from './modules/ui.js';

// ===== SERVICE WORKER REGISTRATION =====
// Only register SW in production (dev mode + SW = stale cache headaches)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Unregister any existing SW in dev mode to prevent stale cache issues
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
}

// ===== DATA LOADING =====
async function loadData() {
  try {
    const cacheBuster = Date.now();
    const response = await fetch(`data.json?v=${cacheBuster}`);
    state.data = await response.json();
  } catch (error) {
    console.error('Failed to load compendium data:', error);
    document.getElementById('content-body').innerHTML = `
      <div class="welcome-container">
        <h2 class="welcome-title">Failed to Load</h2>
        <p class="welcome-subtitle">The chronicles could not be retrieved. Please refresh the page.</p>
      </div>
    `;
  }
}

// ===== WELCOME SCREEN =====
function showWelcome() {
  // In the Archive realm, "home" is the Archive landing, not the living welcome
  if (getRealm() === 'archive') {
    showArchiveLanding();
    return;
  }
  state.currentItem = null;
  state.currentCategory = null;

  initSmoothScroll();
  document.getElementById('content-body').classList.remove('full-width');
  updateHash();

  document.getElementById('breadcrumb').innerHTML = `
    <span class="breadcrumb-home">Compendium</span>
  `;

  document.querySelectorAll('.nav-item.active').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-category.open').forEach((el) => el.classList.remove('open'));

  let stats = {};
  for (const [name, cat] of Object.entries(state.data)) {
    stats[name] = cat.items.length;
  }

  const footerQuotes = [
    'The Maker is dead. The Sovereigns reign.',
    'In ash we are born, in ash we return.',
    'Even gods can bleed.',
    'Thirteen thrones built on the corpse of divinity.',
    'The void whispers secrets to those who listen.',
    'Walk softly in the realm of fallen divinity.',
    'Something ancient stirs in the ash and bone.',
    'Between shadow and flame, truth awaits.',
    'Every sovereign casts a long shadow.',
    'The faithful pray. The wise prepare.',
    'Blood remembers what flesh forgets.',
    'In the silence between heartbeats, they listen.',
    'All roads lead to ruin. Choose yours carefully.',
    'The dead do not stay buried in these lands.',
    'Power has a price. Divinity demands more.',
    'What was torn asunder seeks to be whole.',
    'Trust is a currency spent only once.',
    'The throne room echoes with the screams of gods.',
    'Some doors, once opened, cannot be closed.',
    'Memory is the cruelest wound.',
    'They divided a god. They became monsters.',
    'Hope is the last lie we tell ourselves.',
    'The Usurpation was not the end. It was the beginning.',
    'I will hit you.',
  ];

  const statsHtml = Object.entries(stats)
    .map(
      ([name, count]) => `
    <div class="stat-card" data-category="${name}" onclick="openCategory('${name}')" style="cursor: pointer;">
      <div class="stat-number">${count}</div>
      <div class="stat-label">${name}</div>
    </div>
  `
    )
    .join('');

  document.getElementById('content-body').innerHTML = `
    <div class="welcome-container">
      <img src="Assets/Weeping Statue.webp" alt="Aedwynn, The Weeping Angel" class="welcome-sigil">
      <h1 class="welcome-title">The Ashen Realms</h1>
      <p class="welcome-subtitle">
        A chronicle of thirteen thrones built on the corpse of a murdered god,
        and those who dare to walk between them.
      </p>
      <div class="welcome-quote">
        <p>${footerQuotes[Math.floor(Math.random() * footerQuotes.length)]}</p>
      </div>
      <div class="welcome-stats">
        ${statsHtml}
      </div>
      <div class="archive-gate" onclick="enterArchiveRealm()">
        <div class="gate-icon"><i data-lucide="skull"></i></div>
        <div class="gate-text">
          <div class="gate-title">The Archive of the Dead</div>
          <div class="gate-sub">What the fallen gathered, before the maw. Cross over &rarr;</div>
        </div>
      </div>
    </div>
  `;

  refreshIcons();
}

// Make showWelcome available globally for onclick handlers
window.showWelcome = showWelcome;

// ===== INJECT HANDLER DEPENDENCIES =====
// These break circular imports by injecting callbacks after all modules are loaded

setHashHandlers({
  showRelationships,
  showSpells,
  showItem,
  openCategory,
  showWelcome,
  showNotFound,
  restoreScrollPosition,
  enterArchiveSilent,
  showArchiveLanding,
});

setNavigationHandlers({
  showItem,
  showRelationshipMap,
});

setSearchHandlers({
  showItem,
});

setBookmarkHandlers({
  showItem,
});

setKeyboardHandlers({
  showItem,
});

setUiHandlers({
  showWelcome,
  showItem,
});

// ===== INLINE ANIMATION CSS =====
const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translate(-50%, 20px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  @keyframes fadeOutDown {
    from { opacity: 1; transform: translate(-50%, 0); }
    to { opacity: 0; transform: translate(-50%, 20px); }
  }
`;
document.head.appendChild(animStyle);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  // Split the dataset into two realms (living + archive); render one filtered view at a time
  state.allData = state.data;
  buildWikiIndex(); // index every entity across both realms before filtering
  state.data = filterDataForRealm(state.allData, 'living');
  state.currentRealm = 'living';
  setRealmHandlers({ buildNavigation, showWelcome });
  buildNavigation();
  setupArchiveEntries();
  setupSearch();
  setupMobileMenu();
  setupKeyboardShortcuts();
  setupLogoClick();
  setupLightbox();
  setupBackToTop();
  setupTopBarActions(toggleBookmark);
  setupDynamicQuotes();
  setupBondsLink();
  setupSpellsLink();
  initAudio();
  setupAudioControls();
  initParticles();
  initSmoothScroll();
  setupSwipeGestures();
  refreshIcons();

  // Fix Leaflet marker icon paths
  if (typeof L !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'vendor/images/marker-icon-2x.png',
      iconUrl: 'vendor/images/marker-icon.png',
      shadowUrl: 'vendor/images/marker-shadow.png',
    });
  }

  // Check for URL hash to restore state
  if (!restoreFromHash()) {
    showWelcome();
  }

  // Listen for back/forward navigation
  window.addEventListener('hashchange', () => {
    if (!restoreFromHash()) {
      showWelcome();
    }
  });
});
