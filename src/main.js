// =====================================================
// THE ASHEN REALMS - Interactive Compendium
// Entry Point — Vite ES Module Build
// =====================================================

// Latin-only WOFF2 font faces.
import './fonts.css';

// Vendor CSS
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/shift-away.css';
// App CSS loaded via <link> in index.html to prevent FOUC

// Modules
import state from './modules/state.js';
import { loadCampaignNow } from './modules/data-store.js';
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
    const response = await fetch('data-index.json');
    if (!response.ok) throw new Error(`Compendium index returned ${response.status}`);
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

let bondsModulePromise;
let spellsModulePromise;
let featsModulePromise;

function getBondsModule() {
  bondsModulePromise ||= import('./modules/bonds.js');
  return bondsModulePromise;
}

function getSpellsModule() {
  spellsModulePromise ||= import('./modules/spells.js');
  return spellsModulePromise;
}

function getFeatsModule() {
  featsModulePromise ||= import('./modules/feats.js');
  return featsModulePromise;
}

async function showRelationships() {
  const module = await getBondsModule();
  return module.showRelationships();
}

async function showSpells() {
  const module = await getSpellsModule();
  return module.showSpells();
}

async function showFeats() {
  const module = await getFeatsModule();
  return module.showFeats();
}

function setupSpecialLinks() {
  document.getElementById('bonds-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    showRelationships();
    document.getElementById('sidebar').classList.remove('open');
  });
  document.getElementById('spells-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    showSpells();
    document.getElementById('sidebar').classList.remove('open');
  });
  document.getElementById('feats-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    showFeats();
    document.getElementById('sidebar').classList.remove('open');
  });
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
  document.title = 'The Ashen Realms — Player Compendium';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'A chronicle of thirteen thrones built on the corpse of a murdered god, and those who dare to walk between them.');

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
    <button class="stat-card" type="button" data-category="${name}" onclick="openCategory('${name}')">
      <div class="stat-number">${count}</div>
      <div class="stat-label">${name}</div>
    </button>
  `
    )
    .join('');

  const campaign = state.campaignNow || {};
  const latest = campaign.latestSession;
  const location = campaign.currentLocation;
  let recent = [];
  try {
    const storedRecent = JSON.parse(localStorage.getItem('recentArticles') || '[]');
    recent = Array.isArray(storedRecent) ? storedRecent.slice(0, 3) : [];
  } catch {
    localStorage.removeItem('recentArticles');
  }
  const partyHtml = (campaign.party || []).map((member) => `
    <button class="now-party-member" type="button" onclick="navigateToItemById('${member.category}', '${member.id}')">
      ${member.image ? `<img src="${member.image}" alt="" loading="lazy" decoding="async">` : ''}
      <span>${member.title}</span>
    </button>
  `).join('');
  const recentHtml = recent.length ? recent.map((entry) => `
    <button class="now-recent-link" type="button" onclick="navigateToItemById('${entry.category}', '${entry.id}')">
      <span>${entry.title}</span><small>${entry.category}</small>
    </button>
  `).join('') : '<p class="now-empty">Recently opened entries will appear here.</p>';

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
      <section class="campaign-now" aria-labelledby="campaign-now-title">
        <div class="campaign-now-heading">
          <span class="campaign-now-kicker">The living chronicle</span>
          <h2 id="campaign-now-title">Campaign Now</h2>
        </div>
        <div class="campaign-now-grid">
          ${latest ? `<button class="now-primary-card" type="button" onclick="navigateToItemById('${latest.category}', '${latest.id}')">
            <i data-lucide="scroll-text"></i><span><small>Latest session</small><strong>${latest.title}</strong></span><i data-lucide="arrow-right"></i>
          </button>` : ''}
          ${location ? `<button class="now-primary-card" type="button" ${location.category && location.id ? `onclick="navigateToItemById('${location.category}', '${location.id}')"` : 'disabled'}>
            <i data-lucide="map-pin"></i><span><small>Party location</small><strong>${location.name}</strong></span><i data-lucide="arrow-right"></i>
          </button>` : ''}
          <div class="now-panel"><h3>Current party</h3><div class="now-party">${partyHtml}</div></div>
          <div class="now-panel"><h3>Continue reading</h3><div class="now-recent">${recentHtml}</div></div>
        </div>
      </section>
      <div class="welcome-section-label">Browse the compendium</div>
      <div class="welcome-stats">
        ${statsHtml}
      </div>
      <button class="archive-gate" type="button" onclick="enterArchiveRealm()">
        <div class="gate-icon"><i data-lucide="skull"></i></div>
        <div class="gate-text">
          <div class="gate-title">The Archive of the Dead</div>
          <div class="gate-sub">What the fallen gathered, before the maw. Cross over &rarr;</div>
        </div>
      </button>
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
  showFeats,
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
  await Promise.all([
    loadData(),
    loadCampaignNow().then((summary) => { state.campaignNow = summary; }).catch(() => { state.campaignNow = null; }),
  ]);
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
  setupSpecialLinks();
  initAudio();
  setupAudioControls();
  const scheduleParticles = () => initParticles().catch(() => {});
  if ('requestIdleCallback' in window) window.requestIdleCallback(scheduleParticles, { timeout: 1800 });
  else setTimeout(scheduleParticles, 500);
  initSmoothScroll();
  setupSwipeGestures();
  refreshIcons();

  // Check for URL hash to restore state
  if (!await restoreFromHash()) {
    showWelcome();
  }

  // Listen for back/forward navigation
  window.addEventListener('hashchange', async () => {
    if (!await restoreFromHash()) {
      showWelcome();
    }
  });
});
