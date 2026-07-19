// ===== FEAT COMPENDIUM =====
import state from './state.js';
import { refreshIcons } from './icons.js';
import { destroySmoothScroll } from './smooth-scroll.js';

let featPayload = null;
let currentRuleset = 'all';
let currentCategory = 'all';
let currentLevel = 'all';
let currentSource = 'all';
let currentSearch = '';
let selectedFeatId = null;
const openGroups = new Set(['ashen', '2024', '2014']);

const RULESET_ORDER = ['ashen', '2024', '2014'];
const RULESET_META = {
  ashen: { short: 'AR', title: 'Ashen Realms', subtitle: 'Campaign-exclusive feats' },
  '2024': { short: '24', title: '2024 Rules', subtitle: 'Modern official rules' },
  '2014': { short: '14', title: '2014 Rules', subtitle: 'Legacy official rules' },
};
const CATEGORY_ORDER = [
  'Open', 'Earned', 'General', 'Origin', 'Lineage', 'Sideways',
  'Fighting Style', 'Dragonmark', 'Legacy Feat', 'Epic', 'Epic Boon',
];

const ICONS = {
  badge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 7.8 5.1 3.2 5.8l.7 4.6-.7 4.6 4.6.7L12 18l4.2-2.3 4.6-.7-.7-4.6.7-4.6-4.6-.7L12 3Z"/><path d="m8.8 10.8 2 2 4.5-4.5"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Z"/><path d="M4 21a2 2 0 0 1 2-2h14"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3-1.6 5a3 3 0 0 1-2 2L3 12l5.4 1.8a3 3 0 0 1 2 2L12 21l1.6-5.2a3 3 0 0 1 2-2L21 12l-5.4-2a3 3 0 0 1-2-2L12 3Z"/></svg>',
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadFeatData() {
  if (featPayload) return featPayload;
  const response = await fetch('feats-data.json');
  if (!response.ok) throw new Error(`Feat compendium returned ${response.status}`);
  featPayload = await response.json();
  return featPayload;
}

function sortCategories(a, b) {
  const aIndex = CATEGORY_ORDER.indexOf(a);
  const bIndex = CATEGORY_ORDER.indexOf(b);
  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }
  return a.localeCompare(b);
}

function sourceOptions() {
  const feats = featPayload.feats;
  const sources = [...new Map(feats.map((feat) => [feat.source, feat])).values()]
    .sort((a, b) => RULESET_ORDER.indexOf(a.ruleset) - RULESET_ORDER.indexOf(b.ruleset) || a.sourceName.localeCompare(b.sourceName));
  return sources.map((feat) => (
    `<option value="${escapeHtml(feat.source)}">${escapeHtml(RULESET_META[feat.ruleset].short)} · ${escapeHtml(feat.sourceName)}</option>`
  )).join('');
}

function categoryOptions() {
  const categories = [...new Set(featPayload.feats.map((feat) => feat.category))].sort(sortCategories);
  return categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
}

function levelOptions() {
  const levels = [...new Set(featPayload.feats.map((feat) => feat.level).filter(Number.isFinite))].sort((a, b) => a - b);
  return levels.map((level) => `<option value="${level}">Level ${level}</option>`).join('');
}

function renderRulesetTabs() {
  const counts = featPayload.meta.counts;
  const tabs = [
    ['all', 'All Feats', counts.total],
    ['ashen', 'Ashen Realms', counts.ashen],
    ['2024', '2024 Rules', counts['2024']],
    ['2014', '2014 Rules', counts['2014']],
  ];

  return tabs.map(([value, label, count]) => `
    <button type="button" class="feat-ruleset-tab ${currentRuleset === value ? 'active' : ''}" data-ruleset="${value}" aria-pressed="${currentRuleset === value}">
      <span class="feat-tab-mark ${value}">${value === 'all' ? 'ALL' : RULESET_META[value].short}</span>
      <span class="feat-tab-copy"><strong>${label}</strong><small>${count} entries</small></span>
    </button>
  `).join('');
}

function renderShell() {
  const content = document.getElementById('content-body');
  content.innerHTML = `
    <div class="feats-container">
      <header class="feats-header">
        <button type="button" class="feats-back-btn" id="feats-back-btn">
          <i data-lucide="arrow-left"></i><span>Back</span>
        </button>
        <div class="feats-title-area">
          <span class="feats-kicker">Character Options</span>
          <h1 class="feats-title">Feat Compendium</h1>
          <p class="feats-subtitle">Official 2014 and 2024 rules beside the complete Ashen Realms catalogue.</p>
        </div>
        <div class="feats-ledger" aria-label="Compendium total">
          <strong>${featPayload.meta.counts.total}</strong>
          <span>feats &amp; boons</span>
        </div>
      </header>

      <nav class="feat-ruleset-tabs" id="feat-ruleset-tabs" aria-label="Choose a feat ruleset">
        ${renderRulesetTabs()}
      </nav>

      <section class="feats-controls" aria-label="Feat filters">
        <div class="feats-search-wrapper">
          <i data-lucide="search"></i>
          <label class="sr-only" for="feat-search">Search feats</label>
          <input type="search" id="feat-search" placeholder="Search names, rules, or prerequisites…" autocomplete="off" value="${escapeHtml(currentSearch)}">
          <kbd>/</kbd>
        </div>
        <div class="feats-filters">
          <label class="sr-only" for="feat-category-filter">Filter by type</label>
          <select id="feat-category-filter" class="feat-filter-select">
            <option value="all">All Types</option>
            ${categoryOptions()}
          </select>
          <label class="sr-only" for="feat-level-filter">Filter by required level</label>
          <select id="feat-level-filter" class="feat-filter-select">
            <option value="all">Any Level</option>
            <option value="none">No Level Requirement</option>
            ${levelOptions()}
          </select>
          <label class="sr-only" for="feat-source-filter">Filter by source book</label>
          <select id="feat-source-filter" class="feat-filter-select feat-source-select">
            <option value="all">All Sources</option>
            ${sourceOptions()}
          </select>
          <button type="button" class="feat-clear-btn" id="feat-clear-btn">
            <i data-lucide="rotate-ccw"></i><span>Reset</span>
          </button>
        </div>
      </section>

      <div class="feats-status-row">
        <p id="feats-result-count" role="status" aria-live="polite"></p>
        <div class="feats-legend" aria-label="Ruleset key">
          <span><i class="legend-dot ashen"></i>Campaign exclusive</span>
          <span><i class="legend-dot rules-2024"></i>2024 rules</span>
          <span><i class="legend-dot rules-2014"></i>2014 rules</span>
        </div>
      </div>

      <div class="feats-layout">
        <aside class="feats-list" id="feats-list" aria-label="Feat results"></aside>
        <article class="feats-detail" id="feats-detail" aria-live="polite"></article>
      </div>
    </div>
  `;

  document.getElementById('feat-category-filter').value = currentCategory;
  document.getElementById('feat-level-filter').value = currentLevel;
  document.getElementById('feat-source-filter').value = currentSource;
}

function getFilteredFeats() {
  const terms = currentSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return featPayload.feats.filter((feat) => {
    if (currentRuleset !== 'all' && feat.ruleset !== currentRuleset) return false;
    if (currentCategory !== 'all' && feat.category !== currentCategory) return false;
    if (currentSource !== 'all' && feat.source !== currentSource) return false;
    if (currentLevel === 'none' && feat.level !== null) return false;
    if (currentLevel !== 'all' && currentLevel !== 'none' && feat.level !== Number(currentLevel)) return false;
    return terms.every((term) => feat.searchText.includes(term));
  }).sort((a, b) => (
    RULESET_ORDER.indexOf(a.ruleset) - RULESET_ORDER.indexOf(b.ruleset)
    || a.name.localeCompare(b.name)
    || a.source.localeCompare(b.source)
  ));
}

function shortPrerequisite(feat) {
  if (feat.prerequisite === 'None') return 'No prerequisite';
  if (feat.level) return `Level ${feat.level}+`;
  return feat.prerequisite;
}

function renderFeatCard(feat) {
  const meta = RULESET_META[feat.ruleset];
  return `
    <button type="button" class="feat-card ruleset-${feat.ruleset} ${selectedFeatId === feat.id ? 'selected' : ''}" data-feat-id="${escapeHtml(feat.id)}" aria-pressed="${selectedFeatId === feat.id}">
      <span class="feat-card-edition">${meta.short}</span>
      <span class="feat-card-copy">
        <strong class="feat-card-name">${escapeHtml(feat.name)}</strong>
        <span class="feat-card-meta">
          <span>${escapeHtml(feat.category)}</span>
          <i aria-hidden="true"></i>
          <span title="${escapeHtml(feat.prerequisite)}">${escapeHtml(shortPrerequisite(feat))}</span>
        </span>
      </span>
      <span class="feat-card-source">${escapeHtml(feat.source)}</span>
    </button>
  `;
}

function renderFeatGroups(feats) {
  if (!feats.length) {
    return `
      <div class="feats-empty-list">
        ${ICONS.spark}
        <strong>No feats found</strong>
        <p>Try removing a filter or using a broader search.</p>
        <button type="button" data-reset-feats>Clear all filters</button>
      </div>
    `;
  }

  return RULESET_ORDER.map((ruleset) => {
    const groupFeats = feats.filter((feat) => feat.ruleset === ruleset);
    if (!groupFeats.length) return '';
    const meta = RULESET_META[ruleset];
    const isOpen = openGroups.has(ruleset) || Boolean(currentSearch);
    return `
      <section class="feat-library ruleset-${ruleset} ${isOpen ? 'open' : ''}" data-library="${ruleset}">
        <button type="button" class="feat-library-header" aria-expanded="${isOpen}">
          <span class="feat-library-sigil">${meta.short}</span>
          <span class="feat-library-title"><strong>${meta.title}</strong><small>${meta.subtitle}</small></span>
          <span class="feat-library-count">${groupFeats.length}</span>
          <span class="feat-library-chevron">${ICONS.chevron}</span>
        </button>
        <div class="feat-library-items">${groupFeats.map(renderFeatCard).join('')}</div>
      </section>
    `;
  }).join('');
}

function renderSourceLine(feat) {
  const page = feat.page ? ` · p. ${feat.page}` : '';
  if (feat.ruleset === 'ashen') {
    return '<strong>Ashen Realms original</strong> · Final campaign catalogue';
  }
  return `<strong>${escapeHtml(feat.sourceName)}</strong>${page} · Local 5etools corpus`;
}

function renderFeatDetail(feat) {
  if (!feat) {
    return `
      <div class="feat-detail-empty">
        ${ICONS.badge}
        <h2>Choose a feat</h2>
        <p>Select an entry to read its prerequisites and complete rules.</p>
      </div>
    `;
  }

  const meta = RULESET_META[feat.ruleset];
  const extras = [
    feat.abilityIncrease ? `
      <div class="feat-fact ability">
        <span class="feat-fact-icon"><i data-lucide="trending-up"></i></span>
        <div><small>Ability Score Increase</small><p>${escapeHtml(feat.abilityIncrease)}</p></div>
      </div>` : '',
    feat.repeatable ? `
      <div class="feat-fact repeatable">
        <span class="feat-fact-icon"><i data-lucide="repeat-2"></i></span>
        <div><small>Repeatable</small><p>This feat can be taken more than once.</p></div>
      </div>` : '',
    feat.campaign && feat.ruleset !== 'ashen' ? `
      <div class="feat-fact campaign">
        <span class="feat-fact-icon"><i data-lucide="map"></i></span>
        <div><small>Campaign Requirement</small><p>${escapeHtml(feat.campaign)}</p></div>
      </div>` : '',
  ].filter(Boolean).join('');

  return `
    <button type="button" class="feat-mobile-back" onclick="closeMobileFeatDetail()">
      <i data-lucide="arrow-left"></i>Back to feats
    </button>
    <div class="feat-detail-panel ruleset-${feat.ruleset}">
      <header class="feat-detail-header">
        <div class="feat-detail-seal">${ICONS.badge}<span>${meta.short}</span></div>
        <div class="feat-detail-heading">
          <div class="feat-detail-eyebrow">${escapeHtml(meta.title)} · ${escapeHtml(feat.category)}</div>
          <h2>${escapeHtml(feat.name)}</h2>
          <div class="feat-badges">
            <span class="feat-badge ruleset-${feat.ruleset}">${escapeHtml(meta.title)}</span>
            <span class="feat-badge category">${escapeHtml(feat.category)}</span>
            <span class="feat-badge source">${escapeHtml(feat.source)}</span>
          </div>
        </div>
      </header>

      <section class="feat-prerequisite ${feat.prerequisite === 'None' ? 'none' : ''}">
        <span class="feat-prerequisite-label"><i data-lucide="key-round"></i>Prerequisite</span>
        <p>${escapeHtml(feat.prerequisite)}</p>
      </section>

      ${extras ? `<div class="feat-facts">${extras}</div>` : ''}

      <section class="feat-rules">
        <div class="feat-section-label"><span>Rules</span><i></i></div>
        ${feat.bodyHtml}
      </section>

      ${feat.reprintedAs?.length ? `
        <aside class="feat-reprint-note"><i data-lucide="copy-check"></i><span>Also printed as ${escapeHtml(feat.reprintedAs.join(', '))}.</span></aside>
      ` : ''}

      <footer class="feat-source-note ruleset-${feat.ruleset}">
        ${ICONS.book}
        <div><small>Source</small><p>${renderSourceLine(feat)}</p></div>
      </footer>
    </div>
  `;
}

function updateRulesetTabs() {
  document.querySelectorAll('.feat-ruleset-tab').forEach((tab) => {
    const active = tab.dataset.ruleset === currentRuleset;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
}

function updateView({ moveFocus = false } = {}) {
  const feats = getFilteredFeats();
  if (!feats.some((feat) => feat.id === selectedFeatId)) selectedFeatId = feats[0]?.id || null;
  const selected = feats.find((feat) => feat.id === selectedFeatId) || null;
  if (selected) openGroups.add(selected.ruleset);

  const list = document.getElementById('feats-list');
  const detail = document.getElementById('feats-detail');
  list.innerHTML = renderFeatGroups(feats);
  detail.innerHTML = renderFeatDetail(selected);

  const count = document.getElementById('feats-result-count');
  count.innerHTML = `<strong>${feats.length}</strong> of ${featPayload.meta.counts.total} feats shown`;
  updateRulesetTabs();
  refreshIcons();

  if (moveFocus && selected && window.matchMedia('(max-width: 1150px)').matches) {
    detail.classList.add('mobile-active');
    detail.querySelector('.feat-mobile-back')?.focus();
  }
}

function resetFilters() {
  currentRuleset = 'all';
  currentCategory = 'all';
  currentLevel = 'all';
  currentSource = 'all';
  currentSearch = '';
  selectedFeatId = null;
  document.getElementById('feat-search').value = '';
  document.getElementById('feat-category-filter').value = 'all';
  document.getElementById('feat-level-filter').value = 'all';
  document.getElementById('feat-source-filter').value = 'all';
  updateView();
}

function bindEvents() {
  document.getElementById('feats-back-btn').addEventListener('click', () => {
    window.location.hash = '';
  });

  document.getElementById('feat-ruleset-tabs').addEventListener('click', (event) => {
    const tab = event.target.closest('.feat-ruleset-tab');
    if (!tab) return;
    currentRuleset = tab.dataset.ruleset;
    currentSource = 'all';
    selectedFeatId = null;
    document.getElementById('feat-source-filter').value = 'all';
    updateView();
  });

  let searchTimer;
  const search = document.getElementById('feat-search');
  search.addEventListener('input', () => {
    currentSearch = search.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      selectedFeatId = null;
      updateView();
    }, 100);
  });

  document.getElementById('feat-category-filter').addEventListener('change', (event) => {
    currentCategory = event.target.value;
    selectedFeatId = null;
    updateView();
  });
  document.getElementById('feat-level-filter').addEventListener('change', (event) => {
    currentLevel = event.target.value;
    selectedFeatId = null;
    updateView();
  });
  document.getElementById('feat-source-filter').addEventListener('change', (event) => {
    currentSource = event.target.value;
    const selectedSourceFeat = featPayload.feats.find((feat) => feat.source === currentSource);
    if (selectedSourceFeat) currentRuleset = selectedSourceFeat.ruleset;
    selectedFeatId = null;
    updateView();
  });
  document.getElementById('feat-clear-btn').addEventListener('click', resetFilters);

  document.getElementById('feats-list').addEventListener('click', (event) => {
    const reset = event.target.closest('[data-reset-feats]');
    if (reset) {
      resetFilters();
      return;
    }

    const header = event.target.closest('.feat-library-header');
    if (header) {
      const library = header.closest('.feat-library');
      const ruleset = library.dataset.library;
      const opening = !library.classList.contains('open');
      library.classList.toggle('open', opening);
      header.setAttribute('aria-expanded', String(opening));
      if (opening) openGroups.add(ruleset);
      else openGroups.delete(ruleset);
      return;
    }

    const card = event.target.closest('.feat-card');
    if (!card) return;
    selectedFeatId = card.dataset.featId;
    document.querySelectorAll('.feat-card.selected').forEach((selectedCard) => {
      selectedCard.classList.remove('selected');
      selectedCard.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    const feat = featPayload.feats.find((candidate) => candidate.id === selectedFeatId);
    const detail = document.getElementById('feats-detail');
    detail.innerHTML = renderFeatDetail(feat);
    refreshIcons();
    if (window.matchMedia('(max-width: 1150px)').matches) {
      detail.classList.add('mobile-active');
      detail.querySelector('.feat-mobile-back')?.focus();
    }
  });

  document.removeEventListener('keydown', handleFeatKeyboard);
  document.addEventListener('keydown', handleFeatKeyboard);
}

function handleFeatKeyboard(event) {
  if (window.location.hash !== '#feats') return;
  if (event.key === 'Escape' && document.getElementById('feats-detail')?.classList.contains('mobile-active')) {
    closeMobileFeatDetail();
    return;
  }
  if (event.key !== '/' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  document.getElementById('feat-search')?.focus();
}

function closeMobileFeatDetail() {
  const detail = document.getElementById('feats-detail');
  detail?.classList.remove('mobile-active');
  document.querySelector(`.feat-card[data-feat-id="${CSS.escape(selectedFeatId || '')}"]`)?.focus();
}

window.closeMobileFeatDetail = closeMobileFeatDetail;

async function showFeats() {
  state.currentItem = null;
  state.currentCategory = null;
  destroySmoothScroll();

  const content = document.getElementById('content-body');
  content.classList.add('full-width');
  content.innerHTML = '<div class="feats-loading"><span></span><p>Opening the feat ledger…</p></div>';
  window.location.hash = 'feats';
  document.title = 'Feat Compendium — The Ashen Realms';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Browse every 2014, 2024, and Ashen Realms feat in one searchable compendium.');
  document.getElementById('breadcrumb').innerHTML = `
    <button type="button" class="breadcrumb-home" onclick="showWelcome()">Compendium</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">Feat Compendium</span>
  `;
  document.querySelectorAll('.nav-item.active').forEach((item) => item.classList.remove('active'));

  try {
    await loadFeatData();
    renderShell();
    bindEvents();
    updateView();
    refreshIcons();
  } catch (error) {
    console.error('Failed to load feat data:', error);
    content.innerHTML = `
      <div class="welcome-container">
        <h2 class="welcome-title">The Ledger Would Not Open</h2>
        <p class="welcome-subtitle">Feat data could not be loaded. Please refresh the page.</p>
      </div>
    `;
  }
}

export { showFeats };
