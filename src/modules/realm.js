// =====================================================
// THE ARCHIVE OF THE DEAD — realm system
// Two compendiums from one dataset: the living world (full colour)
// and the muted archive of what the fallen party gathered.
// =====================================================
import state from './state.js';
import { refreshIcons } from './icons.js';
import { setAudioRealm } from './audio.js';
import { prefersReducedMotion, scrollBehavior } from './smooth-scroll.js';

let currentRealm = 'living';
let handlers = {}; // { buildNavigation, showWelcome }

export function setRealmHandlers(h) { handlers = h; }
export function getRealm() { return currentRealm; }

// ===== CLASSIFICATION =====
// Entries that belong to BOTH realms (shared world — public knowledge or
// still-active in the new party's Crownfall). Everything else in the
// "encounter" categories defaults to the Archive. New-party content
// (Party category + Sessions >= 40) is living-only.
const BOTH_TITLES = new Set([
  // --- NPCs still in the new party's orbit ---
  'Broma', 'Marek', 'Senna', 'Sister Varen', 'The Dealer (Green Door)',
  'Velvet Thorn', 'Veshra Coil', 'Captain Hael',
  'Sorrow', 'The Docent', 'Dr. Evangeline Morrow', 'Galheran, the Unmoved',
  'Rosa Solt',
  // Kettleback & Jawbone were Ashford NPCs (town burned 5 yrs ago, all their
  // canon is old-party) — archive-only until/unless the DM places them as
  // known Crownfall refugees.
  // --- Locations / public-world geography ---
  'The Ashen Realms', 'The Blooming Rot', 'The Clockwork Sanctum', 'Veinspire',
  'The Devoured Courts', 'Lastwell', "The Hexwright's Tower", 'Crownfall',
  "The Docent's Archive", 'The Velvet Thorn', 'The Silken Refuge',
  // --- World lore (general knowledge) ---
  'Aedwynn the Maker', 'The Usurpation', 'The Ashen Calendar',
  'Aethranox and Vaelumbra',
]);

// New-party / living-only entries — NPCs the dead party never gathered.
const LIVING_TITLES = new Set([
  'Old Yannis',
]);

function sessionNumberOf(item) {
  const m = (item.title || '').match(/Session\s*0*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

export function getEra(categoryName, item) {
  // Explicit per-item realm wins ('living' | 'archive' | 'both'). New entities
  // set this in their add script so they self-classify without editing the
  // title sets below.
  if (item.era === 'living' || item.era === 'archive' || item.era === 'both') return item.era;
  if (categoryName === 'Party') return 'living';
  if (categoryName === 'Hall of the Dead') return 'archive';
  if (categoryName === 'Sovereigns') return 'both';
  if (categoryName === 'Sessions') {
    const n = sessionNumberOf(item);
    return n != null && n >= 40 ? 'living' : 'archive';
  }
  if (LIVING_TITLES.has(item.title)) return 'living';
  if (BOTH_TITLES.has(item.title)) return 'both';
  return 'archive';
}

function eraVisible(era, realm) {
  return era === 'both' || era === realm;
}

// In the living realm, an entry that carries a trimmed `contentLiving` shows
// that instead of its full record. The Archive always shows the full `content`
// (what the fallen gathered). `raw` is swapped too so living-realm search can't
// surface archive-only facts.
function stripTags(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
export function realmContent(item, realm) {
  if (realm === 'living' && (item.contentLiving || item.hasLivingContent || item.frontmatterLiving)) {
    const out = { ...item };
    if (item.contentLiving) {
      out.content = item.contentLiving;
      out.raw = stripTags(item.contentLiving);
    }
    if (item.frontmatterLiving) out.frontmatter = item.frontmatterLiving;
    return out;
  }
  return item;
}

// ===== DATA FILTERING =====
// Returns a shallow-cloned data object containing only the entries visible
// in the given realm. Categories that end up empty are dropped.
export function filterDataForRealm(allData, realm) {
  const out = {};
  for (const [cat, data] of Object.entries(allData)) {
    const items = (data.items || [])
      .filter((it) => eraVisible(getEra(cat, it), realm))
      .map((it) => realmContent(it, realm));

    let subcategories;
    if (data.subcategories) {
      subcategories = {};
      for (const [sub, arr] of Object.entries(data.subcategories)) {
        const filtered = arr
          .filter((it) => eraVisible(getEra(cat, it), realm))
          .map((it) => realmContent(it, realm));
        if (filtered.length) subcategories[sub] = filtered;
      }
    }

    const hasContent = items.length || (subcategories && Object.keys(subcategories).length);
    if (hasContent) {
      out[cat] = { ...data, items };
      if (subcategories) out[cat].subcategories = subcategories;
    }
  }
  return out;
}

// ===== APPLY A REALM (no animation) =====
export function applyRealm(realm, { rebuildNav = true } = {}) {
  currentRealm = realm;
  state.currentRealm = realm;
  state.data = filterDataForRealm(state.allData, realm);
  document.documentElement.classList.toggle('realm-archive', realm === 'archive');
  setAudioRealm(realm);
  if (rebuildNav && handlers.buildNavigation) handlers.buildNavigation();
  updateArchiveLink();
}

// Flip the sidebar portal between "enter the archive" and "return to the living"
function updateArchiveLink() {
  const link = document.getElementById('archive-link');
  if (!link) return;
  if (currentRealm === 'archive') {
    link.classList.add('returning');
    link.innerHTML = `
      <i data-lucide="arrow-left"></i>
      <span>Return to the Living<span class="portal-sub">Leave the archive</span></span>`;
  } else {
    link.classList.remove('returning');
    link.innerHTML = `
      <i data-lucide="skull"></i>
      <span>The Archive of the Dead<span class="portal-sub">What the fallen gathered</span></span>`;
  }
  refreshIcons();
}

// ===== THE CROSSING (cinematic transition) =====
function playCrossing(toRealm, onMidpoint) {
  const overlay = document.getElementById('realm-transition');
  if (!overlay) { if (onMidpoint) onMidpoint(); return; }

  const titleEl = overlay.querySelector('.realm-transition-title');
  const subEl = overlay.querySelector('.realm-transition-sub');
  if (toRealm === 'archive') {
    titleEl.textContent = 'THE ARCHIVE OF THE DEAD';
    subEl.textContent = 'What the fallen gathered, before the maw.';
  } else {
    titleEl.textContent = 'RETURN TO THE LIVING';
    subEl.textContent = '';
  }

  let fired = false;
  const fire = () => { if (!fired && onMidpoint) { fired = true; onMidpoint(); } };

  if (prefersReducedMotion()) {
    fire();
    return;
  }

  overlay.getAnimations().forEach((animation) => animation.cancel());
  titleEl.getAnimations().forEach((animation) => animation.cancel());
  subEl.getAnimations().forEach((animation) => animation.cancel());
  overlay.style.display = 'flex';

  (async () => {
    await overlay.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 550, easing: 'ease-in', fill: 'forwards' }
    ).finished;
    fire();

    await Promise.all([
      titleEl.animate(
        [
          { opacity: 0, transform: 'translateY(16px)', letterSpacing: '0.08em' },
          { opacity: 1, transform: 'translateY(0)', letterSpacing: '0.28em' },
        ],
        { duration: 800, easing: 'ease-out', fill: 'forwards' }
      ).finished,
      subEl.animate(
        [
          { opacity: 0, transform: 'translateY(16px)', letterSpacing: '0.08em' },
          { opacity: 1, transform: 'translateY(0)', letterSpacing: '0.18em' },
        ],
        { duration: 700, delay: 250, easing: 'ease-out', fill: 'forwards' }
      ).finished,
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));
    await Promise.all([
      titleEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished,
      subEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished,
    ]);
    await overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' }).finished;
    overlay.style.display = 'none';
    fire();
  })().catch(() => {
    overlay.style.display = 'none';
    fire();
  });
}

// ===== ENTER / EXIT =====
export function enterArchive() {
  if (currentRealm === 'archive') return;
  playCrossing('archive', () => {
    applyRealm('archive');
    showArchiveLanding();
    window.location.hash = 'archive';
    document.getElementById('sidebar').classList.remove('open');
  });
}

export function exitArchive() {
  if (currentRealm === 'living') return;
  playCrossing('living', () => {
    applyRealm('living');
    if (handlers.showWelcome) handlers.showWelcome();
    history.replaceState(null, '', window.location.pathname);
    document.getElementById('sidebar').classList.remove('open');
  });
}

// Silent enter (no animation) — used when restoring from a #archive hash.
export function enterArchiveSilent() {
  applyRealm('archive');
}

// ===== THE ARCHIVE LANDING (memorial front page) =====
export function showArchiveLanding() {
  state.currentItem = null;
  state.currentCategory = null;

  document.getElementById('content-body').classList.remove('full-width');

  document.getElementById('breadcrumb').innerHTML = `
    <button type="button" class="breadcrumb-home" onclick="exitArchiveRealm()">Compendium</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">The Archive of the Dead</span>
  `;

  document.querySelectorAll('.nav-item.active').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-category.open').forEach((el) => el.classList.remove('open'));

  const statsHtml = Object.entries(state.data)
    .map(
      ([name, cat]) => `
    <button type="button" class="stat-card" data-category="${name}" onclick="openCategory('${name}')">
      <div class="stat-number">${cat.items.length}</div>
      <div class="stat-label">${name}</div>
    </button>`
    )
    .join('');

  const fallen = (state.allData['Hall of the Dead']?.items || [])
    .map((i) => i.title)
    .filter((t) => t && t !== 'REDACTED');
  const rollcall = fallen.length
    ? `<div class="archive-rollcall">
         <div class="archive-rollcall-label">The Fallen</div>
         <ul>${fallen.map((n) => `<li>${n}</li>`).join('')}<li class="unnamed">…and one whose name was eaten</li></ul>
       </div>`
    : '';

  document.getElementById('content-body').innerHTML = `
    <div class="welcome-container archive-landing">
      <div class="archive-sigil-large"><i data-lucide="skull"></i></div>
      <h1 class="welcome-title archive-title">The Archive of the Dead</h1>
      <p class="welcome-subtitle archive-subtitle">
        What the fallen gathered, before the maw — the record of those who did not return.
      </p>
      ${rollcall}
      <div class="welcome-stats">${statsHtml}</div>
      <button class="archive-return-btn" onclick="exitArchiveRealm()">
        <i data-lucide="arrow-left"></i> Return to the living
      </button>
    </div>
  `;

  refreshIcons();
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}

// ===== ENTRY WIRING =====
export function setupArchiveEntries() {
  const link = document.getElementById('archive-link');
  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentRealm === 'archive') exitArchive();
      else enterArchive();
    });
  }
  const ret = document.getElementById('realm-return');
  if (ret) {
    ret.addEventListener('click', (e) => {
      e.preventDefault();
      exitArchive();
    });
  }
}

// Expose for inline onclick handlers rendered into innerHTML
window.enterArchiveRealm = enterArchive;
window.exitArchiveRealm = exitArchive;
