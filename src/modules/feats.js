// ===== FEAT LEDGER =====
import state from './state.js';
import { refreshIcons } from './icons.js';
import { initSmoothScroll } from './smooth-scroll.js';
import {
  ABILITY_KEYS, ABILITY_NAMES, CLASSES, SKILLS, assessFeat, buildProfile, classKey, parsePrerequisite, titleCase,
} from './feat-requirements.js';

let featPayload = null;
let currentRuleset = 'all';
let currentEligibility = 'all';
let currentFeatType = 'all';
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
const REQUIREMENT_BADGE = {
  none: { label: 'No requirements', icon: 'check-circle' },
  required: { label: 'Requirements', icon: 'lock-keyhole' },
};
const FEAT_TYPE_META = {
  all: { label: 'All feats', resultTitle: 'All Feats', entryLabel: 'Feat', icon: 'library' },
  general: { label: 'General feats', resultTitle: 'General Feats', entryLabel: 'General Feat', icon: 'scroll-text' },
  origin: { label: 'Origin feats', resultTitle: 'Origin Feats', entryLabel: 'Origin Feat', icon: 'compass' },
  style: { label: 'Fighting styles', resultTitle: 'Fighting Styles', entryLabel: 'Fighting Style', icon: 'swords' },
  boon: { label: 'Epic Boons', resultTitle: 'Epic Boons', entryLabel: 'Epic Boon', icon: 'crown' },
};
const FEAT_TYPE_ORDER = ['general', 'origin', 'style', 'boon'];

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

// ===== FEAT FINDER: which feats can this character take? =====
// The choice lives in this browser only. Party presets read race, class and level from the party pages.
const FINDER_KEY = 'ashen-feat-finder-v1';
const FIT_OPTIONS = [
  ['check', 'Can take or check'],
  ['now', 'Can take now'],
  ['later', 'Higher level'],
  ['all', 'Every feat'],
];
const SPECIES_SUGGESTIONS = [
  'Aasimar', 'Bugbear', 'Changeling', 'Dhampir', 'Dragonborn', 'Drow', 'Dwarf', 'Eladrin', 'Elf', 'Fire Genasi',
  'Genasi', 'Gnome', 'Goblin', 'Goliath', 'Half-Elf', 'Half-Giant', 'Half-Orc', 'Halfling', 'High Elf', 'Hobgoblin',
  'Human', 'Kenku', 'Kobold', 'Leonin', 'Lizardfolk', 'Minotaur', 'Mountain Dwarf', 'Orc', 'Satyr', 'Sea Elf',
  'Shadar-kai', 'Shifter', 'Tabaxi', 'Thalwynn', 'Tiefling', 'Tortle', 'Triton', 'Vampire', 'Warforged',
  'Wood Elf', 'Yuan-Ti',
];

function defaultFinder() {
  return {
    active: null,
    fit: 'check',
    open: false,
    custom: { level: 4, className: '', subclass: '', species: '' },
    details: {},
  };
}

function loadFinder() {
  const base = defaultFinder();
  try {
    const saved = JSON.parse(localStorage.getItem(FINDER_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      return { ...base, ...saved, custom: { ...base.custom, ...(saved.custom || {}) }, details: saved.details || {} };
    }
  } catch (error) {
    // Storage blocked or unreadable: start fresh.
  }
  return base;
}

function saveFinder() {
  try {
    localStorage.setItem(FINDER_KEY, JSON.stringify(finder));
  } catch (error) {
    // Storage blocked: the choice simply lasts for this visit.
  }
}

let finder = loadFinder();
let finderProfile = null;
const verdicts = new Map();

function partyPresets() {
  const items = (state.allData || state.data)?.Party?.items || [];
  return items
    .filter((item) => item.frontmatter?.class && item.frontmatter?.level)
    .map((item) => {
      const classText = String(item.frontmatter.class);
      return {
        id: item.id,
        title: item.title,
        image: item.image || '',
        level: Number(item.frontmatter.level) || 1,
        classText,
        className: classKey(classText),
        subclass: (classText.match(/\(([^)]+)\)/) || [])[1] || '',
        species: String(item.frontmatter.race || ''),
      };
    });
}

function detailsFor(id) {
  if (!finder.details[id]) finder.details[id] = {};
  return finder.details[id];
}

function activeCharacter() {
  if (!finder.active) return null;
  const details = finder.details[finder.active] || {};
  const extras = {
    abilities: details.abilities || {},
    skills: details.skills || [],
    casts: details.casts,
    martial: details.martial,
    heavy: details.heavy,
  };
  if (finder.active === 'custom') {
    const custom = finder.custom;
    const label = CLASSES[custom.className]?.label || 'No class';
    return { id: 'custom', name: 'This character', classText: label, ...custom, ...extras };
  }
  const preset = partyPresets().find((p) => p.id === finder.active);
  if (!preset) return null;
  return {
    id: preset.id,
    name: preset.title,
    level: preset.level,
    className: preset.className,
    subclass: preset.subclass,
    classText: preset.classText,
    species: preset.species,
    ...extras,
  };
}

function refreshVerdicts() {
  verdicts.clear();
  const character = activeCharacter();
  finderProfile = character ? buildProfile(character) : null;
}

function featClauses(feat) {
  if (!feat.clauses) feat.clauses = parsePrerequisite(feat.prerequisite);
  return feat.clauses;
}

function verdictFor(feat) {
  if (!finderProfile) return null;
  if (!verdicts.has(feat.id)) verdicts.set(feat.id, assessFeat(featClauses(feat), finderProfile));
  return verdicts.get(feat.id);
}

function matchesFit(feat) {
  const verdict = verdictFor(feat);
  if (!verdict || finder.fit === 'all') return true;
  if (finder.fit === 'now') return verdict.status === 'qualify';
  if (finder.fit === 'later') return verdict.status === 'later';
  return ['qualify', 'check', 'dm'].includes(verdict.status);
}

function characterName(character) {
  return character.id === 'custom' ? 'This character' : character.name;
}

function renderFinderPicks() {
  const picks = partyPresets().map((preset) => `
    <button type="button" class="ledger-finder-pick ${finder.active === preset.id ? 'active' : ''}" data-pick="${escapeHtml(preset.id)}" aria-pressed="${finder.active === preset.id}">
      ${preset.image ? `<img src="${escapeHtml(preset.image)}" alt="" loading="lazy">` : '<i data-lucide="user"></i>'}
      <span><strong>${escapeHtml(preset.title)}</strong><small>${escapeHtml(CLASSES[preset.className]?.label || preset.classText)} ${preset.level}</small></span>
    </button>
  `).join('');

  return `
    ${picks}
    <button type="button" class="ledger-finder-pick ${finder.active === 'custom' ? 'active' : ''}" data-pick="custom" aria-pressed="${finder.active === 'custom'}">
      <i data-lucide="user-plus"></i>
      <span><strong>Someone else</strong><small>Any level, class, species</small></span>
    </button>
    ${finder.active ? `
      <button type="button" class="ledger-finder-clear" data-pick="none">
        <i data-lucide="x"></i><span>Stop</span>
      </button>` : ''}
  `;
}

function renderFinderSheet(character) {
  if (character.id !== 'custom') {
    return `
      <div class="ledger-finder-sheet">
        <small>From the party page</small>
        <p><strong>${escapeHtml(character.name)}</strong> <span>${escapeHtml(character.species)} · ${escapeHtml(character.classText)} · Level ${character.level}</span></p>
      </div>
    `;
  }

  const levelOptions = Array.from({ length: 20 }, (_, index) => index + 1)
    .map((level) => `<option value="${level}" ${Number(character.level) === level ? 'selected' : ''}>${level}</option>`)
    .join('');
  const classOptions = Object.entries(CLASSES)
    .map(([key, cls]) => `<option value="${key}" ${character.className === key ? 'selected' : ''}>${cls.label}</option>`)
    .join('');

  return `
    <label class="ledger-select-wrap ledger-finder-level">
      <span>Level</span>
      <select class="ledger-select" data-custom="level">${levelOptions}</select>
    </label>
    <label class="ledger-select-wrap">
      <span>Class</span>
      <select class="ledger-select" data-custom="className"><option value="">Choose…</option>${classOptions}</select>
    </label>
    <label class="ledger-select-wrap">
      <span>Subclass</span>
      <input class="ledger-select ledger-finder-text" data-custom="subclass" value="${escapeHtml(character.subclass || '')}" placeholder="Optional" autocomplete="off">
    </label>
    <label class="ledger-select-wrap">
      <span>Species</span>
      <input class="ledger-select ledger-finder-text" data-custom="species" list="feat-species-list" value="${escapeHtml(character.species || '')}" placeholder="e.g. Half-Elf" autocomplete="off">
      <datalist id="feat-species-list">${SPECIES_SUGGESTIONS.map((name) => `<option value="${name}"></option>`).join('')}</datalist>
    </label>
  `;
}

function renderTrainingSelect(key, label, value) {
  const current = typeof value === 'boolean' ? String(value) : 'auto';
  return `
    <label class="ledger-select-wrap">
      <span>${label}</span>
      <select class="ledger-select" data-train="${key}">
        <option value="auto" ${current === 'auto' ? 'selected' : ''}>From class</option>
        <option value="true" ${current === 'true' ? 'selected' : ''}>Yes</option>
        <option value="false" ${current === 'false' ? 'selected' : ''}>No</option>
      </select>
    </label>
  `;
}

function renderFinderBody(character) {
  const abilityInputs = ABILITY_KEYS.map((ability) => `
    <label>
      <span>${ABILITY_NAMES[ability].slice(0, 3)}</span>
      <input type="number" min="1" max="30" inputmode="numeric" data-ability="${ability}" value="${character.abilities[ability] ?? ''}" aria-label="${ABILITY_NAMES[ability]} score">
    </label>
  `).join('');
  const skillChips = SKILLS.map((skill) => {
    const on = character.skills.includes(skill);
    return `<button type="button" class="ledger-type-chip ${on ? 'active' : ''}" data-skill="${skill}" aria-pressed="${on}">${titleCase(skill)}</button>`;
  }).join('');

  return `
    <div class="ledger-finder-body">
      <div class="ledger-finder-fields">
        ${renderFinderSheet(character)}
        <label class="ledger-select-wrap ledger-finder-show">
          <span>Show</span>
          <select class="ledger-select" id="feat-fit-filter">
            ${FIT_OPTIONS.map(([value, label]) => `<option value="${value}" ${finder.fit === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select>
        </label>
      </div>
      <details class="ledger-finder-more" ${finder.open ? 'open' : ''}>
        <summary>
          <i data-lucide="sliders-horizontal"></i>
          <span>Ability scores, skills and training</span>
          <small>Optional. Settles the feats marked Check. Saved in this browser only.</small>
        </summary>
        <div class="ledger-finder-grid">
          <div class="ledger-finder-abilities">${abilityInputs}</div>
          <div class="ledger-finder-training">
            ${renderTrainingSelect('casts', 'Spellcasting', character.casts)}
            ${renderTrainingSelect('martial', 'Martial weapons', character.martial)}
            ${renderTrainingSelect('heavy', 'Heavy armor', character.heavy)}
          </div>
        </div>
        <div class="ledger-finder-skills" role="group" aria-label="Skill proficiencies">
          <span class="ledger-filter-label">Skills</span>
          ${skillChips}
        </div>
      </details>
      <p class="ledger-finder-summary" id="feat-finder-summary" role="status" aria-live="polite"></p>
    </div>
  `;
}

function renderFinder() {
  const character = activeCharacter();
  return `
    <div class="ledger-finder-head">
      <div class="ledger-finder-intro">
        <span class="ledger-filter-label">Find feats for</span>
        <p>Pick a character and every feat shows whether they can take it.</p>
      </div>
      <div class="ledger-finder-picks" role="group" aria-label="Choose a character">
        ${renderFinderPicks()}
      </div>
    </div>
    ${character ? renderFinderBody(character) : ''}
  `;
}

function updateFinderSummary() {
  const summary = document.getElementById('feat-finder-summary');
  if (!summary) return;
  const character = activeCharacter();
  if (!character || !finderProfile) {
    summary.innerHTML = '';
    return;
  }
  const records = featPayload.feats.filter((feat) => (
    (currentRuleset === 'all' || feat.ruleset === currentRuleset)
    && (currentSource === 'all' || feat.source === currentSource)
    && matchesEligibility(feat)
    && matchesFeatType(feat)
    && matchesSearch(feat)
  ));
  const tally = { qualify: 0, check: 0, dm: 0, later: 0, no: 0 };
  records.forEach((feat) => { tally[verdictFor(feat).status] += 1; });
  summary.innerHTML = `
    <strong>${escapeHtml(characterName(character))}</strong>
    <span><b>${tally.qualify}</b> can take now</span>
    <span><b>${tally.check}</b> to check</span>
    <span><b>${tally.dm}</b> DM's call</span>
    <span><b>${tally.later}</b> at a higher level</span>
    <span><b>${tally.no}</b> not available</span>
  `;
}

function fitNote(verdict, character) {
  if (!verdict || verdict.status === 'qualify') return '';
  const parts = [];
  if (verdict.status === 'later') parts.push(`Opens at level ${verdict.atLevel}.`);
  else if (verdict.missing.length) parts.push(`Missing: ${verdict.missing.join('; ')}.`);
  if (verdict.dm.length) parts.push(`The DM rules on: ${verdict.dm.join('; ')}.`);
  if (verdict.toCheck.length) parts.push(`To check: ${verdict.toCheck.join('; ')}.`);
  return `
    <p class="ledger-entry-fit-note">
      <strong>${escapeHtml(characterName(character))}:</strong>
      <span>${escapeHtml(parts.join(' '))}</span>
    </p>
  `;
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

function requirementBadge(feat) {
  return REQUIREMENT_BADGE[requirementState(feat)];
}

function matchesSearch(feat) {
  const terms = currentSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return terms.every((term) => feat.searchText.includes(term));
}

function featType(feat) {
  if (feat.category === 'Epic Boon') return 'boon';
  if (feat.category === 'Fighting Style') return 'style';
  if (feat.category === 'Origin') return 'origin';
  return 'general';
}

function matchesFeatType(feat) {
  return currentFeatType === 'all' || featType(feat) === currentFeatType;
}

function matchesEligibility(feat) {
  return currentEligibility === 'all' || requirementState(feat) === currentEligibility;
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

function recordsForFeatTypeCounts() {
  return featPayload.feats.filter((feat) => (
    (currentRuleset === 'all' || feat.ruleset === currentRuleset)
    && (currentSource === 'all' || feat.source === currentSource)
    && matchesEligibility(feat)
    && matchesFit(feat)
    && matchesSearch(feat)
  ));
}

function renderFeatTypeChips() {
  const records = recordsForFeatTypeCounts();
  const options = [
    ['all', records.length],
    ...FEAT_TYPE_ORDER.map((type) => [
      type,
      records.filter((feat) => featType(feat) === type).length,
    ]),
  ].filter(([value, count]) => value === 'all' || count > 0 || currentFeatType === value);

  return options.map(([value, count]) => `
    <button type="button" class="ledger-type-chip ${currentFeatType === value ? 'active' : ''}" data-feat-type="${value}" aria-pressed="${currentFeatType === value}">
      <i data-lucide="${FEAT_TYPE_META[value].icon}"></i>${FEAT_TYPE_META[value].label} <span>${count}</span>
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

      <section class="ledger-finder ${finder.active ? 'is-active' : ''}" id="feat-finder" aria-label="Find feats for a character">
        ${renderFinder()}
      </section>

      <section class="ledger-filter-dock" aria-label="Search and filter feats">
        <div class="ledger-filter-row">
          <div class="ledger-search">
            <i data-lucide="search"></i>
            <label class="sr-only" for="feat-search">Search feats</label>
            <input type="search" id="feat-search" placeholder="Search a name, prerequisite, or rule…" autocomplete="off" value="${escapeHtml(currentSearch)}">
            <kbd>/</kbd>
          </div>
          <label class="ledger-select-wrap">
            <span>Requirements</span>
            <select id="feat-eligibility-filter" class="ledger-select">
              <option value="all">Any requirements</option>
              <option value="none">No requirements</option>
              <option value="required">Has requirements</option>
            </select>
          </label>
          <label class="ledger-select-wrap order">
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
        <div class="ledger-type-row">
          <span class="ledger-filter-label">Feat type</span>
          <div class="ledger-type-strip" id="feat-type-strip" aria-label="Filter by feat type">
            ${renderFeatTypeChips()}
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

  document.getElementById('feat-eligibility-filter').value = currentEligibility;
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
    if (!matchesEligibility(feat)) return false;
    if (!matchesFeatType(feat)) return false;
    if (!matchesFit(feat)) return false;
    if (currentSource !== 'all' && feat.source !== currentSource) return false;
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
  const type = FEAT_TYPE_META[featType(feat)];
  const reference = featReferenceCache.get(feat.id) || meta.code;
  const [referencePrefix, referenceNumber = ''] = reference.split('-');
  const verdict = verdictFor(feat);
  const character = verdict ? activeCharacter() : null;
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
            <em>${type.entryLabel}</em>
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
          ${fitNote(verdict, character)}
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
  const character = finderProfile ? activeCharacter() : null;
  if (character && finder.fit !== 'all') {
    const name = character.id === 'custom' ? 'This Character' : character.name;
    if (finder.fit === 'now') return `Feats ${name} Can Take`;
    if (finder.fit === 'later') return `Feats ${name} Can Take Later`;
    return `Feats for ${name}`;
  }
  if (currentFeatType !== 'all') return FEAT_TYPE_META[currentFeatType].resultTitle;
  if (currentEligibility === 'none') return 'Feats Without Requirements';
  if (currentEligibility === 'required') return 'Feats With Requirements';
  if (currentRuleset !== 'all') return RULESET_META[currentRuleset].title;
  return 'All Feats';
}

function updateTabsAndTypes() {
  document.querySelectorAll('.ledger-tab').forEach((tab) => {
    const active = tab.dataset.ruleset === currentRuleset;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-pressed', String(active));
  });
  document.getElementById('feat-type-strip').innerHTML = renderFeatTypeChips();
}

function updateCatalog() {
  const feats = getFilteredFeats();
  document.getElementById('feat-catalog').innerHTML = renderCatalog(feats);
  document.getElementById('feats-result-count').innerHTML = `<strong>${feats.length}</strong><span>of ${featPayload.meta.counts.total} shown</span>`;
  document.getElementById('ledger-results-title').textContent = activeResultsTitle();
  updateTabsAndTypes();
  updateFinderSummary();
  refreshIcons();
}

function rerenderFinder() {
  const host = document.getElementById('feat-finder');
  if (!host) return;
  host.classList.toggle('is-active', Boolean(finder.active));
  host.innerHTML = renderFinder();
  refreshIcons();
}

function finderChanged({ panel = false } = {}) {
  saveFinder();
  refreshVerdicts();
  if (panel) rerenderFinder();
  updateCatalog();
}

function bindFinderEvents() {
  const host = document.getElementById('feat-finder');
  let typingTimer;

  host.addEventListener('click', (event) => {
    const pick = event.target.closest('[data-pick]');
    if (pick) {
      const id = pick.dataset.pick;
      finder.active = id === 'none' || finder.active === id ? null : id;
      finderChanged({ panel: true });
      return;
    }

    const skillChip = event.target.closest('[data-skill]');
    if (skillChip && finder.active) {
      const details = detailsFor(finder.active);
      const skills = new Set(details.skills || []);
      const skill = skillChip.dataset.skill;
      if (skills.has(skill)) skills.delete(skill);
      else skills.add(skill);
      details.skills = [...skills];
      skillChip.classList.toggle('active', skills.has(skill));
      skillChip.setAttribute('aria-pressed', String(skills.has(skill)));
      finderChanged();
    }
  });

  host.addEventListener('change', (event) => {
    const target = event.target;
    if (target.id === 'feat-fit-filter') {
      finder.fit = target.value;
      finderChanged();
      return;
    }
    if (target.dataset.custom) {
      finder.custom[target.dataset.custom] = target.dataset.custom === 'level' ? Number(target.value) : target.value;
      finderChanged();
      return;
    }
    if (target.dataset.train && finder.active) {
      const details = detailsFor(finder.active);
      if (target.value === 'auto') delete details[target.dataset.train];
      else details[target.dataset.train] = target.value === 'true';
      finderChanged();
    }
  });

  host.addEventListener('input', (event) => {
    const target = event.target;
    if (target.dataset.ability && finder.active) {
      const details = detailsFor(finder.active);
      details.abilities = { ...(details.abilities || {}) };
      const value = Number(target.value);
      if (target.value === '' || !Number.isFinite(value)) delete details.abilities[target.dataset.ability];
      else details.abilities[target.dataset.ability] = value;
    } else if (target.dataset.custom === 'species' || target.dataset.custom === 'subclass') {
      finder.custom[target.dataset.custom] = target.value;
    } else {
      return;
    }
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => finderChanged(), 250);
  });

  host.addEventListener('toggle', (event) => {
    if (event.target.matches?.('details.ledger-finder-more')) {
      finder.open = event.target.open;
      saveFinder();
    }
  }, true);
}

function renderSourceLine(feat) {
  if (feat.ruleset === 'ashen') return '<strong>Ashen Realms original</strong><span>Campaign catalogue</span>';
  const page = feat.page ? `, page ${feat.page}` : '';
  return `<strong>${escapeHtml(feat.sourceName)}${page}</strong><span>Official ${feat.ruleset} rules · 5etools index</span>`;
}

function resetFilters() {
  currentRuleset = 'all';
  currentEligibility = 'all';
  currentFeatType = 'all';
  currentSource = 'all';
  currentSort = 'requirements';
  currentSearch = '';
  document.getElementById('feat-search').value = '';
  document.getElementById('feat-eligibility-filter').value = 'all';
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
    document.getElementById('feat-source-filter').value = 'all';
    updateCatalog();
  });

  document.getElementById('feat-type-strip').addEventListener('click', (event) => {
    const chip = event.target.closest('.ledger-type-chip');
    if (!chip) return;
    currentFeatType = chip.dataset.featType;
    updateCatalog();
  });

  let searchTimer;
  const search = document.getElementById('feat-search');
  search.addEventListener('input', () => {
    currentSearch = search.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(updateCatalog, 100);
  });

  document.getElementById('feat-eligibility-filter').addEventListener('change', (event) => {
    currentEligibility = event.target.value;
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

  bindFinderEvents();

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
    refreshVerdicts();
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
