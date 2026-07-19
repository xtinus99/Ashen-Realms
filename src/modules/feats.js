// ===== FEAT LEDGER =====
import state from './state.js';
import { refreshIcons } from './icons.js';
import { initSmoothScroll } from './smooth-scroll.js';

let featPayload = null;
let currentRuleset = 'all';
let currentRequirement = 'all';
let currentLevel = 'all';
let currentSource = 'all';
let currentSearch = '';
const featReferenceCache = new Map();

const RULESET_ORDER = ['ashen', '2024', '2014'];
const RULESET_META = {
  ashen: {
    code: 'AR',
    title: 'Ashen Realms',
    shelf: 'Campaign Catalogue',
    label: 'Campaign Exclusive',
    description: 'Campaign-exclusive feats written for the Ashen Realms.',
  },
  '2024': {
    code: '24',
    title: 'Official 2024',
    shelf: 'Current Rules',
    label: 'Official · 2024',
    description: 'Official feats indexed from the current 2024 rules.',
  },
  '2014': {
    code: '14',
    title: 'Official 2014',
    shelf: 'Legacy Rules',
    label: 'Official · 2014',
    description: 'Official feats indexed from legacy sourcebooks.',
  },
};
const REQUIREMENT_META = {
  required: { label: 'Requirements', icon: 'key-round' },
  none: { label: 'No requirements', icon: 'check-circle' },
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
  RULESET_ORDER.forEach((ruleset) => {
    featPayload.feats
      .filter((feat) => feat.ruleset === ruleset)
      .sort((a, b) => a.name.localeCompare(b.name) || a.source.localeCompare(b.source))
      .forEach((feat, index) => {
        featReferenceCache.set(feat.id, `${RULESET_META[ruleset].code}-${String(index + 1).padStart(3, '0')}`);
      });
  });
  return featPayload;
}

function requirementState(feat) {
  return feat.prerequisite === 'None' ? 'none' : 'required';
}

function getSourceRecords() {
  return [...new Map(featPayload.feats.map((feat) => [feat.source, feat])).values()]
    .sort((a, b) => (
      RULESET_ORDER.indexOf(a.ruleset) - RULESET_ORDER.indexOf(b.ruleset)
      || a.sourceName.localeCompare(b.sourceName)
    ));
}

function sourceOptions() {
  return getSourceRecords().map((feat) => (
    `<option value="${escapeHtml(feat.source)}">${escapeHtml(RULESET_META[feat.ruleset].code)} · ${escapeHtml(feat.sourceName)}</option>`
  )).join('');
}

function levelOptions() {
  const levels = [...new Set(featPayload.feats.map((feat) => feat.level).filter(Number.isFinite))].sort((a, b) => a - b);
  return levels.map((level) => `<option value="${level}">Level ${level}</option>`).join('');
}

function renderRulesetTabs() {
  const counts = featPayload.meta.counts;
  const tabs = [
    ['all', 'Everything', counts.total, 'Complete index'],
    ['ashen', 'Ashen Realms', counts.ashen, 'Campaign exclusive'],
    ['2024', 'Official 2024', counts['2024'], 'Current rules'],
    ['2014', 'Official 2014', counts['2014'], 'Legacy rules'],
  ];

  return tabs.map(([value, title, count, subtitle]) => `
    <button type="button" class="ledger-tab ${currentRuleset === value ? 'active' : ''}" data-ruleset="${value}" aria-pressed="${currentRuleset === value}">
      <span><strong>${title}</strong><small>${subtitle}</small></span>
      <b>${count}</b>
    </button>
  `).join('');
}

function recordsForRequirementCounts() {
  return featPayload.feats.filter((feat) => (
    (currentRuleset === 'all' || feat.ruleset === currentRuleset)
    && (currentSource === 'all' || feat.source === currentSource)
  ));
}

function renderRequirementChips() {
  const records = recordsForRequirementCounts();
  const requiredCount = records.filter((feat) => requirementState(feat) === 'required').length;
  const noRequirementCount = records.length - requiredCount;
  const options = [
    ['all', 'All feats', records.length, 'list'],
    ['required', 'Requirements', requiredCount, 'key-round'],
    ['none', 'No requirements', noRequirementCount, 'check-circle'],
  ];

  return options.map(([value, label, count, icon]) => `
    <button type="button" class="ledger-requirement-chip ${currentRequirement === value ? 'active' : ''}" data-requirement="${value}" aria-pressed="${currentRequirement === value}">
      <i data-lucide="${icon}"></i>${label} <span>${count}</span>
    </button>
  `).join('');
}

function renderShell() {
  document.getElementById('content-body').innerHTML = `
    <div class="feat-ledger-page">
      <header class="ledger-hero">
        <button type="button" class="ledger-back" id="feats-back-btn" aria-label="Return to compendium">
          <i data-lucide="arrow-left"></i><span>Compendium</span>
        </button>
        <div class="ledger-hero-icon" aria-hidden="true"><i data-lucide="scroll-text"></i></div>
        <div class="ledger-hero-copy">
          <span class="ledger-kicker">Player Index · Character Options</span>
          <h1>The Feat Ledger</h1>
          <p>Every prerequisite and complete rule is printed directly in the catalogue. Search, filter, and read without opening anything.</p>
        </div>
        <div class="ledger-totals" aria-label="Feat catalogue totals">
          <span><strong>${featPayload.meta.counts.ashen}</strong>Ashen</span>
          <span><strong>${featPayload.meta.counts['2024']}</strong>2024</span>
          <span><strong>${featPayload.meta.counts['2014']}</strong>2014</span>
        </div>
      </header>

      <nav class="ledger-tabs" id="feat-ruleset-tabs" aria-label="Choose a feat catalogue">
        ${renderRulesetTabs()}
      </nav>

      <section class="ledger-filter-dock" aria-label="Search and filter feats">
        <div class="ledger-filter-row">
          <div class="ledger-search">
            <i data-lucide="search"></i>
            <label class="sr-only" for="feat-search">Search feats</label>
            <input type="search" id="feat-search" placeholder="Search a name, prerequisite, or rule…" autocomplete="off" value="${escapeHtml(currentSearch)}">
            <kbd>/</kbd>
          </div>
          <label class="ledger-select-wrap">
            <span>Required level</span>
            <select id="feat-level-filter" class="ledger-select">
              <option value="all">Any level</option>
              <option value="none">No level requirement</option>
              ${levelOptions()}
            </select>
          </label>
          <label class="ledger-select-wrap source">
            <span>Source book</span>
            <select id="feat-source-filter" class="ledger-select">
              <option value="all">All sources</option>
              ${sourceOptions()}
            </select>
          </label>
          <button type="button" class="ledger-reset" id="feat-clear-btn">
            <i data-lucide="rotate-ccw"></i><span>Reset</span>
          </button>
        </div>
        <div class="ledger-requirement-strip" id="feat-requirement-strip" aria-label="Filter by requirement">
          ${renderRequirementChips()}
        </div>
      </section>

      <div class="ledger-results-heading">
        <div>
          <span>Indexed results</span>
          <h2 id="ledger-results-title">All Feats</h2>
        </div>
        <p id="feats-result-count" role="status" aria-live="polite"></p>
      </div>

      <main class="ledger-catalog" id="feat-catalog" aria-labelledby="ledger-results-title"></main>
    </div>
  `;

  document.getElementById('feat-level-filter').value = currentLevel;
  document.getElementById('feat-source-filter').value = currentSource;
}

function getFilteredFeats() {
  const terms = currentSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return featPayload.feats.filter((feat) => {
    if (currentRuleset !== 'all' && feat.ruleset !== currentRuleset) return false;
    if (currentRequirement !== 'all' && requirementState(feat) !== currentRequirement) return false;
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

function prerequisiteLabel(feat) {
  return feat.prerequisite === 'None' ? 'No requirements' : feat.prerequisite;
}

function renderFeatEntry(feat) {
  const meta = RULESET_META[feat.ruleset];
  const requirement = REQUIREMENT_META[requirementState(feat)];
  const reference = featReferenceCache.get(feat.id) || meta.code;
  const facts = [
    feat.abilityIncrease ? `
      <div><small>Ability Score Increase</small><p>${escapeHtml(feat.abilityIncrease)}</p></div>` : '',
    feat.repeatable ? `
      <div><small>Repeatable</small><p>This feat can be taken more than once.</p></div>` : '',
    feat.campaign && feat.ruleset !== 'ashen' ? `
      <div><small>Campaign Requirement</small><p>${escapeHtml(feat.campaign)}</p></div>` : '',
  ].filter(Boolean).join('');

  return `
    <article class="ledger-entry ruleset-${feat.ruleset}" id="feat-${escapeHtml(feat.id)}">
      <span class="ledger-entry-ruleline" aria-hidden="true"></span>
      <aside class="ledger-entry-rail">
        <span class="ledger-entry-icon" aria-hidden="true"><i data-lucide="${requirement.icon}"></i></span>
        <div class="ledger-entry-kind">
          <strong>${requirement.label}</strong>
        </div>
        <b>${escapeHtml(reference)}</b>
      </aside>

      <div class="ledger-entry-sheet">
        <header class="ledger-entry-header">
          <div class="ledger-entry-topline">
            <span class="ledger-entry-origin">${escapeHtml(meta.label)}</span>
            <span class="ledger-entry-source-code">${escapeHtml(feat.source)}</span>
          </div>
          <h3>${escapeHtml(feat.name)}</h3>
          <div class="ledger-entry-tags">
            ${feat.level ? `<em>Level ${feat.level}+</em>` : ''}
            ${feat.abilityIncrease ? '<em>Ability increase</em>' : ''}
            ${feat.repeatable ? '<em>Repeatable</em>' : ''}
          </div>
        </header>

        <section class="ledger-entry-prerequisite ${feat.prerequisite === 'None' ? 'none' : ''}">
          <div><i data-lucide="${requirement.icon}"></i><small>${requirement.label}</small></div>
          <p>${escapeHtml(prerequisiteLabel(feat))}</p>
        </section>

        ${facts ? `<div class="ledger-entry-facts">${facts}</div>` : ''}

        <div class="ledger-entry-section-title"><span>Feat rules</span><i></i></div>
        <section class="ledger-entry-rules feat-rules" aria-label="${escapeHtml(feat.name)} rules">
          ${feat.bodyHtml}
        </section>

        ${feat.reprintedAs?.length ? `
          <aside class="ledger-entry-reprint">Also printed as ${escapeHtml(feat.reprintedAs.join(', '))}.</aside>
        ` : ''}

        <footer class="ledger-entry-source">
          <i data-lucide="book-open" aria-hidden="true"></i>
          <div>${renderSourceLine(feat)}</div>
        </footer>
      </div>
    </article>
  `;
}

function renderShelf(ruleset, feats) {
  const meta = RULESET_META[ruleset];
  return `
    <section class="ledger-shelf ruleset-${ruleset}" aria-labelledby="shelf-${ruleset}">
      <header class="ledger-shelf-header">
        <span class="ledger-shelf-code">${meta.code}</span>
        <div>
          <small>${meta.shelf}</small>
          <h2 id="shelf-${ruleset}">${meta.title}</h2>
          <p>${meta.description}</p>
        </div>
        <strong>${feats.length}<span>entries</span></strong>
      </header>
      <div class="ledger-entry-list">${feats.map(renderFeatEntry).join('')}</div>
    </section>
  `;
}

function renderCatalog(feats) {
  if (!feats.length) {
    return `
      <div class="ledger-empty">
        <i data-lucide="scroll-text"></i>
        <h2>No matching feats</h2>
        <p>Try a broader search or clear the current filters.</p>
        <button type="button" data-reset-feats>Clear filters</button>
      </div>
    `;
  }

  return RULESET_ORDER.map((ruleset) => {
    const shelfFeats = feats.filter((feat) => feat.ruleset === ruleset);
    return shelfFeats.length ? renderShelf(ruleset, shelfFeats) : '';
  }).join('');
}

function activeResultsTitle() {
  if (currentRequirement !== 'all') return REQUIREMENT_META[currentRequirement].label;
  if (currentRuleset !== 'all') return RULESET_META[currentRuleset].title;
  return 'All Feats';
}

function updateTabsAndRequirements() {
  document.querySelectorAll('.ledger-tab').forEach((tab) => {
    const active = tab.dataset.ruleset === currentRuleset;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
  document.getElementById('feat-requirement-strip').innerHTML = renderRequirementChips();
}

function updateCatalog() {
  const feats = getFilteredFeats();
  document.getElementById('feat-catalog').innerHTML = renderCatalog(feats);
  document.getElementById('feats-result-count').innerHTML = `<strong>${feats.length}</strong><span>of ${featPayload.meta.counts.total} shown</span>`;
  document.getElementById('ledger-results-title').textContent = activeResultsTitle();
  updateTabsAndRequirements();
  refreshIcons();
}

function renderSourceLine(feat) {
  if (feat.ruleset === 'ashen') return '<strong>Ashen Realms original</strong><span>Campaign catalogue</span>';
  const page = feat.page ? `, page ${feat.page}` : '';
  return `<strong>${escapeHtml(feat.sourceName)}${page}</strong><span>Official ${feat.ruleset} rules · 5etools index</span>`;
}

function resetFilters() {
  currentRuleset = 'all';
  currentRequirement = 'all';
  currentLevel = 'all';
  currentSource = 'all';
  currentSearch = '';
  document.getElementById('feat-search').value = '';
  document.getElementById('feat-level-filter').value = 'all';
  document.getElementById('feat-source-filter').value = 'all';
  updateCatalog();
}

function bindEvents() {
  document.getElementById('feats-back-btn').addEventListener('click', () => {
    window.location.hash = '';
  });

  document.getElementById('feat-ruleset-tabs').addEventListener('click', (event) => {
    const tab = event.target.closest('.ledger-tab');
    if (!tab) return;
    currentRuleset = tab.dataset.ruleset;
    currentSource = 'all';
    currentRequirement = 'all';
    document.getElementById('feat-source-filter').value = 'all';
    updateCatalog();
  });

  document.getElementById('feat-requirement-strip').addEventListener('click', (event) => {
    const chip = event.target.closest('.ledger-requirement-chip');
    if (!chip) return;
    currentRequirement = chip.dataset.requirement;
    updateCatalog();
  });

  let searchTimer;
  const search = document.getElementById('feat-search');
  search.addEventListener('input', () => {
    currentSearch = search.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(updateCatalog, 100);
  });

  document.getElementById('feat-level-filter').addEventListener('change', (event) => {
    currentLevel = event.target.value;
    updateCatalog();
  });

  document.getElementById('feat-source-filter').addEventListener('change', (event) => {
    currentSource = event.target.value;
    const sourceFeat = featPayload.feats.find((feat) => feat.source === currentSource);
    if (sourceFeat) currentRuleset = sourceFeat.ruleset;
    updateCatalog();
  });

  document.getElementById('feat-clear-btn').addEventListener('click', resetFilters);

  document.getElementById('feat-catalog').addEventListener('click', (event) => {
    const reset = event.target.closest('[data-reset-feats]');
    if (reset) {
      resetFilters();
    }
  });

  document.removeEventListener('keydown', handleFeatKeyboard);
  document.addEventListener('keydown', handleFeatKeyboard);
}

function handleFeatKeyboard(event) {
  if (window.location.hash !== '#feats') return;
  if (event.key !== '/') return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  document.getElementById('feat-search')?.focus();
}

async function showFeats() {
  state.currentItem = null;
  state.currentCategory = null;
  initSmoothScroll();

  const content = document.getElementById('content-body');
  content.classList.add('full-width');
  content.innerHTML = '<div class="feats-loading"><span></span><p>Opening the feat ledger…</p></div>';
  window.location.hash = 'feats';
  document.title = 'The Feat Ledger — The Ashen Realms';
  document.querySelector('meta[name="description"]')?.setAttribute('content', 'Compare every official 2014, official 2024, and Ashen Realms feat in one searchable player index.');
  document.getElementById('breadcrumb').innerHTML = `
    <button type="button" class="breadcrumb-home" onclick="showWelcome()">Compendium</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">The Feat Ledger</span>
  `;
  document.querySelectorAll('.nav-item.active').forEach((item) => item.classList.remove('active'));

  try {
    await loadFeatData();
    renderShell();
    bindEvents();
    updateCatalog();
    refreshIcons();
    window.scrollTo({ top: 0, behavior: 'auto' });
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
