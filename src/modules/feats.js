// ===== FEAT LEDGER =====
import state from './state.js';
import { refreshIcons } from './icons.js';
import { initSmoothScroll } from './smooth-scroll.js';

let featPayload = null;
let currentRuleset = 'all';
let currentRequirement = 'all';
let currentLevel = 'all';
let currentSource = 'all';
let currentSort = 'requirements';
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
  all: { label: 'All types', shortLabel: 'All', icon: 'list-filter' },
  none: { label: 'No requirements', shortLabel: 'None', icon: 'check-circle' },
  level: { label: 'Level only', shortLabel: 'Level', icon: 'chevrons-up' },
  ability: { label: 'Ability score', shortLabel: 'Ability', icon: 'gauge' },
  lineage: { label: 'Lineage', shortLabel: 'Lineage', icon: 'users' },
  training: { label: 'Training', shortLabel: 'Training', icon: 'swords' },
  magic: { label: 'Spellcasting', shortLabel: 'Magic', icon: 'sparkles' },
  feat: { label: 'Feat condition', shortLabel: 'Feat', icon: 'link' },
  earned: { label: 'Story or campaign', shortLabel: 'Story', icon: 'flag' },
};

const REQUIREMENT_ORDER = ['none', 'level', 'ability', 'lineage', 'training', 'magic', 'feat', 'earned'];

const LINEAGE_PATTERN = /\b(aasimar|bugbear|changeling|dhampir|dragonborn|drow|dwarf|eladrin|elf|genasi|gnome|goblin|goliath|half-elf|half-orc|halfling|hobgoblin|human|kenku|kobold|leonin|lizardfolk|minotaur|orc|satyr|shifter|small size|tabaxi|thalwynn|tiefling|tortle|triton|vampire|warforged|wood elf|yuan-ti|race|species|lineage|sun-line)\b/i;
const ABILITY_PATTERN = /\b(strength|dexterity|constitution|intelligence|wisdom|charisma|ability score|spellcasting ability)\b[^.;]*(?:\d{2}|\d\+)/i;
const MAGIC_PATTERN = /\b(spellcasting|pact magic|cast(?:ing)? (?:at least )?(?:one |a )?spell|cast a spell|ritual magic|spell as a ritual)\b/i;
const FEAT_PATTERN = /\b(feat|dragonmark)\b/i;
const TRAINING_PATTERN = /\b(proficien(?:cy|t)|martial weapon|simple weapon|melee weapon|ranged weapon|heavy weapon|armor proficiency|shield proficiency|thieves' tools|poisoner's kit|cartographer's tools|gaming set|sneak attack|fighting style|class level)\b/i;
const EARNED_PATTERN = /\b(campaign|origin|born|oath|sworn|survived|defeat|destroyed|died|returned|fought|paying crowd|fortune|lived|stood in|sovereign domains?|year under|won and|lost|experienced|bound|branded|caged|escaped)\b/i;

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

function requirementTypes(feat) {
  if (feat.prerequisite === 'None') return ['none'];

  const prerequisite = feat.prerequisite;
  const types = [];
  if (ABILITY_PATTERN.test(prerequisite)) types.push('ability');
  if (LINEAGE_PATTERN.test(prerequisite)) types.push('lineage');
  if (TRAINING_PATTERN.test(prerequisite)) types.push('training');
  if (MAGIC_PATTERN.test(prerequisite)) types.push('magic');
  if (FEAT_PATTERN.test(prerequisite)) types.push('feat');
  if (EARNED_PATTERN.test(prerequisite)) types.push('earned');

  const withoutLevel = prerequisite
    .replace(/\blevel\s+\d+\+?/gi, '')
    .replace(/[;,]/g, '')
    .replace(/\bor\b/gi, '')
    .trim();

  if (feat.level !== null && !withoutLevel) types.push('level');
  if (!types.length) types.push('earned');
  return [...new Set(types)];
}

function requirementState(feat) {
  return feat.prerequisite === 'None' ? 'none' : 'required';
}

function primaryRequirementType(feat) {
  return requirementTypes(feat).find((type) => type !== 'level') || requirementTypes(feat)[0];
}

function requirementBadge(feat) {
  const types = requirementTypes(feat);
  if (types[0] === 'none') return REQUIREMENT_META.none;

  const primary = primaryRequirementType(feat);
  const labels = types
    .filter((type) => type !== 'level')
    .map((type) => REQUIREMENT_META[type].shortLabel);
  if (!labels.length) labels.push('Level only');
  if (feat.level !== null && !types.includes('level')) labels.push(`Level ${feat.level}`);

  return {
    icon: REQUIREMENT_META[primary].icon,
    label: labels.length > 2 ? 'Mixed requirements' : labels.join(' · '),
  };
}

function matchesLevel(feat) {
  if (currentLevel === 'all') return true;
  if (currentLevel === 'none') return feat.level === null;
  return feat.level === null || feat.level <= Number(currentLevel);
}

function matchesSearch(feat) {
  const terms = currentSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return terms.every((term) => feat.searchText.includes(term));
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
  return levels.map((level) => `<option value="${level}">Level ${level} or lower</option>`).join('');
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
    && matchesLevel(feat)
    && matchesSearch(feat)
  ));
}

function renderRequirementChips() {
  const records = recordsForRequirementCounts();
  const options = [
    ['all', records.length],
    ...REQUIREMENT_ORDER.map((type) => [
      type,
      records.filter((feat) => requirementTypes(feat).includes(type)).length,
    ]),
  ].filter(([value, count]) => value === 'all' || count > 0 || currentRequirement === value);

  return options.map(([value, count]) => `
    <button type="button" class="ledger-requirement-chip ${currentRequirement === value ? 'active' : ''}" data-requirement="${value}" aria-pressed="${currentRequirement === value}">
      <i data-lucide="${REQUIREMENT_META[value].icon}"></i>${REQUIREMENT_META[value].label} <span>${count}</span>
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
          <span class="ledger-kicker">Character Options · ${featPayload.meta.counts.total} Entries</span>
          <h1>The Feat Ledger</h1>
          <p>Choose what you become. Know what it costs.</p>
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
            <span>Available by level</span>
            <select id="feat-level-filter" class="ledger-select">
              <option value="all">Any level</option>
              <option value="none">No level gate</option>
              ${levelOptions()}
            </select>
          </label>
          <label class="ledger-select-wrap">
            <span>Order</span>
            <select id="feat-sort" class="ledger-select">
              <option value="requirements">Lowest requirements first</option>
              <option value="alphabetical">Name A–Z</option>
              <option value="level-asc">Level: low to high</option>
              <option value="level-desc">Level: high to low</option>
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
        <div class="ledger-requirement-row">
          <span class="ledger-filter-label">Requirement type</span>
          <div class="ledger-requirement-strip" id="feat-requirement-strip" aria-label="Filter by requirement type">
            ${renderRequirementChips()}
          </div>
        </div>
      </section>

      <div class="ledger-results-heading">
        <div>
          <span>Current selection</span>
          <h2 id="ledger-results-title">All Feats</h2>
        </div>
        <p id="feats-result-count" role="status" aria-live="polite"></p>
      </div>

      <main class="ledger-catalog" id="feat-catalog" aria-labelledby="ledger-results-title"></main>
    </div>
  `;

  document.getElementById('feat-level-filter').value = currentLevel;
  document.getElementById('feat-sort').value = currentSort;
  document.getElementById('feat-source-filter').value = currentSource;
}

function requirementSortProfile(feat) {
  if (feat.prerequisite === 'None') return [-2, 0];
  const types = requirementTypes(feat);
  const level = feat.level ?? -1;
  const additionalRequirements = types.includes('level') ? 0 : types.length;
  return [level, additionalRequirements];
}

function compareFeats(a, b) {
  const rulesetDifference = RULESET_ORDER.indexOf(a.ruleset) - RULESET_ORDER.indexOf(b.ruleset);
  if (rulesetDifference) return rulesetDifference;

  if (currentSort === 'alphabetical') {
    return a.name.localeCompare(b.name) || a.source.localeCompare(b.source);
  }

  if (currentSort === 'level-asc') {
    return (a.level ?? -1) - (b.level ?? -1) || a.name.localeCompare(b.name);
  }

  if (currentSort === 'level-desc') {
    return (b.level ?? -1) - (a.level ?? -1) || a.name.localeCompare(b.name);
  }

  const [aLevel, aRequirements] = requirementSortProfile(a);
  const [bLevel, bRequirements] = requirementSortProfile(b);
  return aLevel - bLevel
    || aRequirements - bRequirements
    || a.name.localeCompare(b.name)
    || a.source.localeCompare(b.source);
}

function getFilteredFeats() {
  return featPayload.feats.filter((feat) => {
    if (currentRuleset !== 'all' && feat.ruleset !== currentRuleset) return false;
    if (currentRequirement !== 'all' && !requirementTypes(feat).includes(currentRequirement)) return false;
    if (currentSource !== 'all' && feat.source !== currentSource) return false;
    if (!matchesLevel(feat)) return false;
    return matchesSearch(feat);
  }).sort(compareFeats);
}

function prerequisiteLabel(feat) {
  return feat.prerequisite === 'None' ? 'No requirements' : feat.prerequisite;
}

function renderFeatEntry(feat) {
  const meta = RULESET_META[feat.ruleset];
  const requirementKey = requirementState(feat);
  const requirement = requirementBadge(feat);
  const reference = featReferenceCache.get(feat.id) || meta.code;
  const [referencePrefix, referenceNumber = ''] = reference.split('-');
  const facts = [
    feat.abilityIncrease ? `
      <div><small>Ability Score Increase</small><p>${escapeHtml(feat.abilityIncrease)}</p></div>` : '',
    feat.repeatable ? `
      <div><small>Repeatable</small><p>This feat can be taken more than once.</p></div>` : '',
    feat.campaign && feat.ruleset !== 'ashen' ? `
      <div><small>Campaign Requirement</small><p>${escapeHtml(feat.campaign)}</p></div>` : '',
  ].filter(Boolean).join('');

  return `
    <article class="ledger-entry ruleset-${feat.ruleset} requirement-${requirementKey}" id="feat-${escapeHtml(feat.id)}" data-reference="${escapeHtml(reference)}">
      <span class="ledger-entry-ruleline" aria-hidden="true"></span>
      <header class="ledger-entry-banner">
        <span class="ledger-entry-icon" aria-hidden="true"><i data-lucide="${requirement.icon}"></i></span>
        <div class="ledger-entry-identity">
          <div class="ledger-entry-topline">
            <span class="ledger-entry-origin">${escapeHtml(meta.label)}</span>
            <span class="ledger-entry-requirement"><i data-lucide="${requirement.icon}"></i>${requirement.label}</span>
            ${feat.source !== referencePrefix ? `<span class="ledger-entry-source-code">${escapeHtml(feat.source)}</span>` : ''}
          </div>
          <h3>${escapeHtml(feat.name)}</h3>
          <div class="ledger-entry-tags">
            ${feat.level ? `<em>Level ${feat.level}+</em>` : ''}
            ${feat.abilityIncrease ? '<em>Ability increase</em>' : ''}
            ${feat.repeatable ? '<em>Repeatable</em>' : ''}
          </div>
        </div>
        <div class="ledger-entry-stamp" aria-label="Catalogue reference ${escapeHtml(reference)}">
          <small>${escapeHtml(referencePrefix)}</small>
          <strong>${escapeHtml(referenceNumber)}</strong>
        </div>
      </header>

      <div class="ledger-entry-sheet">
        <section class="ledger-entry-prerequisite ${feat.prerequisite === 'None' ? 'none' : ''}">
          <div><i data-lucide="${requirement.icon}"></i><small>${feat.prerequisite === 'None' ? 'No requirements' : 'Requirements'}</small></div>
          <p>${escapeHtml(prerequisiteLabel(feat))}</p>
        </section>

        ${facts ? `<div class="ledger-entry-facts">${facts}</div>` : ''}

        <div class="ledger-entry-section-title"><span>Effect</span><i></i></div>
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
  if (currentRequirement !== 'all') return `${REQUIREMENT_META[currentRequirement].label} feats`;
  if (currentLevel === 'none') return 'Feats without a level gate';
  if (currentLevel !== 'all') return `Available by level ${currentLevel}`;
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
  currentSort = 'requirements';
  currentSearch = '';
  document.getElementById('feat-search').value = '';
  document.getElementById('feat-level-filter').value = 'all';
  document.getElementById('feat-sort').value = 'requirements';
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

  document.getElementById('feat-sort').addEventListener('change', (event) => {
    currentSort = event.target.value;
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
