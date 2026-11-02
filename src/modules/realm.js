// =====================================================
// REALMS — three compendiums from one dataset:
//   living  — the present world (full colour)
//   archive — The Archive of the Dead: what the fallen party gathered (greyscale)
//   eve     — Behind the Seam: the world on the eve of the Usurpation (sunlit)
// =====================================================
import state from './state.js';
import { refreshIcons } from './icons.js';
import { setAudioRealm } from './audio.js';
import { setParticleRealm } from './particles.js';
import { getThumbnailPath } from './images.js';
import { prefersReducedMotion, scrollBehavior } from './smooth-scroll.js';

let currentRealm = 'living';
let handlers = {}; // { buildNavigation, showWelcome, navigateToItemById }

// What players call the eve. The DM calls it "the eve", but on the site it is
// always "Before the Usurpation": "eve" makes it sound as if the Usurpation
// is happening tomorrow (DM, 2026-11-02). Its URLs read #before/...
export const EVE_NAME = 'Before the Usurpation';
export const EVE_HASH = 'before';

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
  // Kettleback, Jawbone and Edra keep their old-party record in the Archive.
  // The living party met them in Crownfall (Sessions 40 and 43), so their
  // items carry era 'both' and a trimmed contentLiving, written as
  // content/entities/NPCs/*.living.md overlays.
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

const ERAS = new Set(['living', 'archive', 'both', 'eve']);

function sessionNumberOf(item) {
  const m = (item.title || '').match(/Session\s*0*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

export function getEra(categoryName, item) {
  // Explicit per-item realm wins ('living' | 'archive' | 'both' | 'eve'). New
  // entities set this in their header so they self-classify without editing
  // the title sets above.
  if (ERAS.has(item.era)) return item.era;
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

// The realms an entry appears in. An explicit `realms` list wins (a session
// played on the eve is ['living', 'eve']); otherwise the era decides, and
// 'both' keeps its old meaning of living + archive.
export function realmsOf(categoryName, item) {
  if (Array.isArray(item.realms) && item.realms.length) return item.realms;
  const era = getEra(categoryName, item);
  if (era === 'both') return ['living', 'archive'];
  // The company crossed over, so their own pages travel with them.
  if (categoryName === 'Party' && !item.era) return ['living', 'eve'];
  return [era];
}

// True once any page outside the Party belongs to the eve. Until then the
// eve has nothing to show and its doors stay hidden.
export function hasEveContent() {
  for (const [cat, data] of Object.entries(state.allData || {})) {
    if (cat === 'Party') continue;
    for (const item of data.items || []) {
      if (realmsOf(cat, item).includes('eve')) return true;
    }
  }
  return false;
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

// What "home" is called in the breadcrumb for the current realm (short: it shares
// the top bar with the page title on narrow screens).
export function realmHomeLabel() {
  return currentRealm === 'eve' ? EVE_NAME : 'Compendium';
}

// ===== DATA FILTERING =====
// Returns a shallow-cloned data object containing only the entries visible
// in the given realm. Categories that end up empty are dropped.
export function filterDataForRealm(allData, realm) {
  const out = {};
  for (const [cat, data] of Object.entries(allData)) {
    const items = (data.items || [])
      .filter((it) => realmsOf(cat, it).includes(realm))
      .map((it) => realmContent(it, realm));

    let subcategories;
    if (data.subcategories) {
      subcategories = {};
      for (const [sub, arr] of Object.entries(data.subcategories)) {
        const filtered = arr
          .filter((it) => realmsOf(cat, it).includes(realm))
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
  document.documentElement.classList.toggle('realm-eve', realm === 'eve');
  setAudioRealm(realm);
  setParticleRealm(realm);
  if (rebuildNav && handlers.buildNavigation) handlers.buildNavigation();
  updatePortalLinks();
}

// The two sidebar doors. In the present both show (the eve's only once it has
// pages); inside a realm its own door becomes the way back and the other hides.
function updatePortalLinks() {
  const archive = document.getElementById('archive-link');
  if (archive) {
    archive.hidden = currentRealm === 'eve';
    if (currentRealm === 'archive') {
      archive.classList.add('returning');
      archive.innerHTML = `
        <i data-lucide="arrow-left"></i>
        <span>Return to the Living<span class="portal-sub">Leave the archive</span></span>`;
    } else {
      archive.classList.remove('returning');
      archive.innerHTML = `
        <i data-lucide="skull"></i>
        <span>The Archive of the Dead<span class="portal-sub">What the fallen gathered</span></span>`;
    }
  }
  const eve = document.getElementById('eve-link');
  if (eve) {
    eve.hidden = currentRealm === 'archive' || !hasEveContent();
    if (currentRealm === 'eve') {
      eve.classList.add('returning');
      eve.innerHTML = `
        <i data-lucide="arrow-left"></i>
        <span>Return to the present<span class="portal-sub">Back through the seam</span></span>`;
    } else {
      eve.classList.remove('returning');
      eve.innerHTML = `
        <i data-lucide="sunrise"></i>
        <span>${EVE_NAME}<span class="portal-sub">Through the seam</span></span>`;
    }
  }
  refreshIcons();
}

// ===== THE CROSSING (cinematic transition) =====
function crossingText(toRealm) {
  if (toRealm === 'archive') return ['THE ARCHIVE OF THE DEAD', 'What the fallen gathered, before the maw.'];
  if (toRealm === 'eve') return [EVE_NAME.toUpperCase(), 'Through the seam.'];
  if (currentRealm === 'eve') return ['BACK THROUGH THE SEAM', ''];
  return ['RETURN TO THE LIVING', ''];
}

function playCrossing(toRealm, onMidpoint) {
  const overlay = document.getElementById('realm-transition');
  if (!overlay) { if (onMidpoint) onMidpoint(); return; }

  const titleEl = overlay.querySelector('.realm-transition-title');
  const subEl = overlay.querySelector('.realm-transition-sub');
  const [title, sub] = crossingText(toRealm);
  titleEl.textContent = title;
  subEl.textContent = sub;
  overlay.classList.toggle('to-eve', toRealm === 'eve');

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

// Cross into a realm with the transition, then run `then` on the far side.
function crossTo(toRealm, then) {
  if (currentRealm === toRealm) { if (then) then(); return; }
  playCrossing(toRealm, () => {
    applyRealm(toRealm);
    if (then) then();
    document.getElementById('sidebar').classList.remove('open');
  });
}

// ===== ENTER / EXIT =====
export function enterArchive() {
  if (currentRealm === 'archive') return;
  crossTo('archive', () => {
    showArchiveLanding();
    window.location.hash = 'archive';
  });
}

export function enterEve() {
  if (currentRealm === 'eve') return;
  crossTo('eve', () => {
    showEveLanding();
    window.location.hash = EVE_HASH;
  });
}

// Back to the present, from either realm.
export function exitArchive() {
  if (currentRealm === 'living') return;
  crossTo('living', () => {
    if (handlers.showWelcome) handlers.showWelcome();
    history.replaceState(null, '', window.location.pathname);
  });
}

// Open an entry that lives in another realm ("then and now" links, bookmarks).
export function crossToItem(realm, category, id) {
  crossTo(realm, () => {
    if (handlers.navigateToItemById) handlers.navigateToItemById(category, id);
  });
}

// Silent enters (no animation) — used when restoring a realm from the URL hash.
export function enterArchiveSilent() { applyRealm('archive'); }
export function enterEveSilent() { applyRealm('eve'); }
export function enterLivingSilent() { applyRealm('living'); }

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

// ===== THE EVE LANDING (Behind the Seam) =====
// The places in the order the company reached them (Locations carry `order`,
// and `frontmatter.sessions` / `frontmatter.now` for the line under each name),
// then the eve's chapters and the way back.
export function showEveLanding() {
  state.currentItem = null;
  state.currentCategory = null;
  document.title = `${EVE_NAME} — The Ashen Realms`;

  document.getElementById('content-body').classList.remove('full-width');

  document.getElementById('breadcrumb').innerHTML = `
    <button type="button" class="breadcrumb-home" onclick="exitArchiveRealm()">Compendium</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">${EVE_NAME}</span>
  `;

  document.querySelectorAll('.nav-item.active').forEach((el) => el.classList.remove('active'));
  document.querySelectorAll('.nav-category.open').forEach((el) => el.classList.remove('open'));

  const places = [...(state.data.Locations?.items || [])].sort((a, b) =>
    (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));

  // Each stop can carry `frontmatter.leg` (how the company got there from the
  // stop before). A session heading opens wherever the first session changes,
  // linked to that recap when it is in this realm. The people met at a stop are
  // the realm's NPCs whose region is the stop's title. `Locations.info.roadNow`
  // (optional) closes the road with where the company is now.
  const firstNumber = (s) => { const m = String(s ?? '').match(/\d+/); return m ? Number(m[0]) : null; };
  const people = state.data.NPCs?.items || [];
  const recaps = state.data.Sessions?.items || [];
  let lastSession = null;

  const hero = places.find((p) => p.image)?.image;
  const road = places.map((p) => {
    const fm = p.frontmatter || {};
    const sessions = fm.sessions != null ? String(fm.sessions) : '';
    const sessionLabel = sessions ? `${/[,\-–]| to /.test(sessions) ? 'Sessions' : 'Session'} ${sessions}` : '';
    // `where` is a free line under the name; `now` (a present-day name) reads "Where X will be"
    const now = fm.where || (fm.now ? `Where ${fm.now} will be` : '');
    const parts = [];

    const n = firstNumber(sessions);
    if (n != null && n !== lastSession) {
      lastSession = n;
      const recap = recaps.find((s) => firstNumber(s.title) === n);
      parts.push(`
      <li class="eve-road-session">${recap
        ? `<button type="button" onclick="navigateToItemById('Sessions', '${recap.id}')">Session ${n}</button>`
        : `<span>Session ${n}</span>`}</li>`);
    }
    if (fm.leg) parts.push(`
      <li class="eve-road-leg"><span>${fm.leg}</span></li>`);

    const met = people.filter((np) => np.region === p.title);
    parts.push(`
      <li class="eve-road-place">
        <button class="eve-road-stop" type="button" onclick="navigateToItemById('Locations', '${p.id}')">
          ${p.image ? `<img src="${getThumbnailPath(p.image)}" alt="" loading="lazy" decoding="async">` : '<span class="eve-road-blank"></span>'}
          <span class="eve-road-text">
            <strong>${p.title}</strong>
            ${now ? `<small>${now}</small>` : ''}
            ${sessionLabel ? `<em>${sessionLabel}</em>` : ''}
          </span>
        </button>
        ${met.length ? `<div class="eve-road-people"><span>Met</span>${met.map((np) =>
          `<button type="button" onclick="navigateToItemById('NPCs', '${np.id}')">${np.title}</button>`).join('')}</div>` : ''}
      </li>`);
    return parts.join('');
  }).join('');
  const roadNow = state.data.Locations?.info?.roadNow;
  const roadEnd = roadNow ? `
      <li class="eve-road-now"><i data-lucide="map-pin"></i><span><small>Now</small>${roadNow}</span></li>` : '';

  const statsHtml = Object.entries(state.data)
    .map(([name, cat]) => `
    <button class="stat-card" type="button" data-category="${name}" onclick="openCategory('${name}')">
      <i data-lucide="${cat.info?.icon || 'folder'}" class="stat-icon"></i>
      <span class="stat-label">${name}</span>
      <span class="stat-number">${cat.items.length}</span>
    </button>`)
    .join('');

  document.getElementById('content-body').innerHTML = `
    <div class="welcome-container eve-landing">
      ${hero ? `<img class="eve-hero" src="${hero}" alt="" decoding="async">` : ''}
      <div class="eve-kicker">Through the seam</div>
      <h1 class="welcome-title eve-title">${EVE_NAME}</h1>
      <p class="welcome-subtitle eve-subtitle">
        The world the company crossed into in Session 62.
      </p>
      ${places.length ? `
      <section class="eve-road" aria-labelledby="eve-road-title">
        <h2 id="eve-road-title">The road so far</h2>
        <ol>${road}${roadEnd}</ol>
      </section>` : ''}
      <div class="welcome-section-label">Browse the compendium</div>
      <div class="welcome-stats" style="--stat-rows: ${Math.ceil(Object.keys(state.data).length / 2)}">${statsHtml}</div>
      <button class="eve-return-btn" type="button" onclick="exitArchiveRealm()">
        <i data-lucide="arrow-left"></i> Return to the present
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
  const eve = document.getElementById('eve-link');
  if (eve) {
    eve.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentRealm === 'eve') exitArchive();
      else enterEve();
    });
  }
  const ret = document.getElementById('realm-return');
  if (ret) {
    ret.addEventListener('click', (e) => {
      e.preventDefault();
      exitArchive();
    });
  }
  updatePortalLinks();
}

// Expose for inline onclick handlers rendered into innerHTML
window.enterArchiveRealm = enterArchive;
window.exitArchiveRealm = exitArchive;
window.enterEveRealm = enterEve;
window.crossToItem = crossToItem;
