// ===== SPELL COMPENDIUM =====
import state from './state.js';
import { refreshIcons } from './icons.js';
import { destroySmoothScroll } from './smooth-scroll.js';

let spellsData = null;
let currentSpellClass = 'all';
let currentSpellLevel = 'all';
let currentSpellSchool = 'all';
let currentSpellSource = 'all';
let currentSpellSearch = '';
let selectedSpell = null;
let selectedSpellCard = null; // Track the DOM element for fast deselection

const SPELL_LEVEL_ORDER = ['Cantrips', '1st Level', '2nd Level', '3rd Level', '4th Level', '5th Level', '6th Level', '7th Level', '8th Level', '9th Level'];

const SCHOOL_ICONS = {
  'Abjuration': 'shield',
  'Conjuration': 'sparkles',
  'Divination': 'eye',
  'Enchantment': 'heart',
  'Evocation': 'zap',
  'Illusion': 'ghost',
  'Necromancy': 'skull',
  'Transmutation': 'repeat'
};

const CLASS_ICONS = {
  'Artificer': 'wrench',
  'Bard': 'music',
  'Cleric': 'cross',
  'Druid': 'leaf',
  'Paladin': 'shield',
  'Ranger': 'target',
  'Sorcerer': 'flame',
  'Warlock': 'moon',
  'Wizard': 'book-open'
};

// Pre-rendered SVG icons to avoid lucide.createIcons() call on every spell click
const SPELL_DETAIL_ICONS = {
  clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  target: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  package: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>',
  timer: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>',
  'trending-up': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  flame: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  skull: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
  sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  // School icons
  shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
  wand: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>',
  'book-open': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
  ghost: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>',
  skull2: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
  shuffle: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>',
  // Class icons
  wrench: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  music: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
  'book-marked': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><polyline points="10 2 10 10 13 7 16 10 16 2"/></svg>',
  leaf: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  axe: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7z"/></svg>',
  mountain: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
  compass: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  dices: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>',
  swords: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>',
  wand2: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>',
};

function setupSpellsLink() {
  const spellsLink = document.getElementById('spells-link');
  if (spellsLink) {
    spellsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showSpells();
      document.getElementById('sidebar').classList.remove('open');
    });
  }
}

async function loadSpellsData() {
  if (spellsData) return spellsData;
  try {
    const response = await fetch('spells-data.json');
    spellsData = await response.json();
    return spellsData;
  } catch (error) {
    console.error('Failed to load spells data:', error);
    return null;
  }
}

async function showSpells() {
  state.currentItem = null;
  state.currentCategory = null;

  await loadSpellsData();
  if (!spellsData) {
    document.getElementById('content-body').innerHTML = '<div class="welcome-container"><p>Failed to load spell data.</p></div>';
    return;
  }

  // Destroy Lenis completely for spell compendium (it interferes with panel scrolling)
  destroySmoothScroll();

  // Enable full-width mode
  document.getElementById('content-body').classList.add('full-width');

  // Update URL
  window.location.hash = 'spells';

  // Update breadcrumb
  document.getElementById('breadcrumb').innerHTML = `
    <button type="button" class="breadcrumb-home" onclick="showWelcome()">Compendium</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">Spell Compendium</span>
  `;

  // Clear active states
  document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-category.open').forEach(el => el.classList.remove('open'));

  renderSpellsView();
}

function getFilteredSpells() {
  let spells = [...spellsData.allSpells];

  // Filter by class
  if (currentSpellClass !== 'all') {
    spells = spells.filter(s => s.classes && s.classes.includes(currentSpellClass));
  }

  // Filter by level
  if (currentSpellLevel !== 'all') {
    spells = spells.filter(s => s.level === currentSpellLevel);
  }

  // Filter by school
  if (currentSpellSchool !== 'all') {
    spells = spells.filter(s => s.school === currentSpellSchool);
  }

  // Filter by source
  if (currentSpellSource === 'standard') {
    spells = spells.filter(s => s.source === 'standard');
  } else if (currentSpellSource === 'ashen-realms') {
    spells = spells.filter(s => s.source === 'ashen' || s.source === 'ashen-realms');
  }

  // Filter by search
  if (currentSpellSearch) {
    const search = currentSpellSearch.toLowerCase();
    spells = spells.filter(s =>
      s.name.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search) ||
      s.school.toLowerCase().includes(search)
    );
  }

  return spells;
}

function renderSpellsView() {
  const spells = getFilteredSpells();

  // Group spells by level
  const spellsByLevel = {};
  for (const level of SPELL_LEVEL_ORDER) {
    spellsByLevel[level] = spells.filter(s => s.level === level);
  }

  // Keep selection and the visible accordion in sync.
  if (!selectedSpell || !spells.find(s => s.name === selectedSpell)) {
    const firstVisibleLevel = currentSpellLevel === 'all'
      ? SPELL_LEVEL_ORDER.find((level) => spellsByLevel[level].length)
      : currentSpellLevel;
    selectedSpell = (spellsByLevel[firstVisibleLevel] || spells)[0]?.name || null;
  }

  const selectedSpellData = spells.find(s => s.name === selectedSpell);

  document.getElementById('content-body').innerHTML = `
    <div class="spells-container">
      <div class="spells-header">
        <button class="spells-back-btn" id="spells-back-btn">
          <i data-lucide="arrow-left"></i>
          <span>Back</span>
        </button>
        <div class="spells-title-area">
          <h1 class="spells-title">Spell Compendium</h1>
          <p class="spells-subtitle">${spells.length} spells found</p>
        </div>
      </div>

      <div class="spells-controls">
        <div class="spells-search-wrapper">
          <i data-lucide="search"></i>
          <label class="sr-only" for="spell-search">Search spells</label>
          <input type="text" id="spell-search" placeholder="Search spells..." value="${currentSpellSearch}">
        </div>

        <div class="spells-filters">
          <label class="sr-only" for="filter-class">Filter by class</label>
          <select id="filter-class" class="spell-filter-select" aria-label="Filter spells by class">
            <option value="all" ${currentSpellClass === 'all' ? 'selected' : ''}>All Classes</option>
            ${Object.keys(spellsData.classes).map(c => `
              <option value="${c}" ${currentSpellClass === c ? 'selected' : ''}>${c}</option>
            `).join('')}
          </select>

          <label class="sr-only" for="filter-level">Filter by level</label>
          <select id="filter-level" class="spell-filter-select" aria-label="Filter spells by level">
            <option value="all" ${currentSpellLevel === 'all' ? 'selected' : ''}>All Levels</option>
            ${SPELL_LEVEL_ORDER.map(l => `
              <option value="${l}" ${currentSpellLevel === l ? 'selected' : ''}>${l}</option>
            `).join('')}
          </select>

          <label class="sr-only" for="filter-school">Filter by school</label>
          <select id="filter-school" class="spell-filter-select" aria-label="Filter spells by school">
            <option value="all" ${currentSpellSchool === 'all' ? 'selected' : ''}>All Schools</option>
            ${spellsData.schools.map(s => `
              <option value="${s}" ${currentSpellSchool === s ? 'selected' : ''}>${s}</option>
            `).join('')}
          </select>

          <label class="sr-only" for="filter-source">Filter by source</label>
          <select id="filter-source" class="spell-filter-select" aria-label="Filter spells by source">
            <option value="all" ${currentSpellSource === 'all' ? 'selected' : ''}>All Sources</option>
            <option value="standard" ${currentSpellSource === 'standard' ? 'selected' : ''}>Standard</option>
            <option value="ashen-realms" ${currentSpellSource === 'ashen-realms' ? 'selected' : ''}>Ashen Realms</option>
          </select>
          <button type="button" class="ashen-spells-toggle ${currentSpellSource === 'ashen-realms' ? 'active' : ''}" id="ashen-spells-toggle" aria-pressed="${currentSpellSource === 'ashen-realms'}">
            <i data-lucide="flame"></i> Ashen Realms only
          </button>
        </div>
      </div>

      <div class="spells-layout">
        <div class="spells-list" id="spells-list">
          ${currentSpellLevel === 'all' ?
            SPELL_LEVEL_ORDER.map((level, levelIndex) => {
              const levelSpells = spellsByLevel[level];
              if (levelSpells.length === 0) return '';
              const isOpen = selectedSpellData?.level === level;
              return `
                <div class="spell-level-section ${isOpen ? 'open' : ''}" data-level="${level}">
                  <button class="spell-level-header" type="button" aria-expanded="${isOpen}">
                    <span class="level-name">${level}</span>
                    <span class="level-count">${levelSpells.length}</span>
                    <svg class="level-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                  <div class="spell-level-spells" data-rendered="${isOpen}">
                    ${isOpen ? levelSpells.map((spell, index) => renderSpellCard(spell, index)).join('') : ''}
                  </div>
                </div>
              `;
            }).join('')
            :
            `<div class="spell-level-spells">
              ${spells.map((spell, index) => renderSpellCard(spell, index)).join('')}
            </div>`
          }
        </div>
        <div class="spells-detail" id="spells-detail">
          ${selectedSpellData ? renderSpellDetail(selectedSpellData) : '<div class="detail-empty"><i data-lucide="sparkles"></i><p>Select a spell to view details</p></div>'}
        </div>
      </div>
    </div>
  `;

  // Setup event listeners
  document.getElementById('spells-back-btn').addEventListener('click', () => {
    window.location.hash = '';
  });

  let spellSearchDebounce;
  document.getElementById('spell-search').addEventListener('input', (e) => {
    currentSpellSearch = e.target.value;
    clearTimeout(spellSearchDebounce);
    spellSearchDebounce = setTimeout(() => {
      const cursorPos = e.target.selectionStart;
      renderSpellsView();
      // Refocus search input and restore cursor position
      const searchInput = document.getElementById('spell-search');
      searchInput.focus();
      searchInput.setSelectionRange(cursorPos, cursorPos);
    }, 150);
  });

  document.getElementById('filter-class').addEventListener('change', (e) => {
    currentSpellClass = e.target.value;
    selectedSpell = null;
    selectedSpellCard = null;
    renderSpellsView();
  });

  document.getElementById('filter-level').addEventListener('change', (e) => {
    currentSpellLevel = e.target.value;
    selectedSpell = null;
    selectedSpellCard = null;
    renderSpellsView();
  });

  document.getElementById('filter-school').addEventListener('change', (e) => {
    currentSpellSchool = e.target.value;
    selectedSpell = null;
    selectedSpellCard = null;
    renderSpellsView();
  });

  document.getElementById('filter-source').addEventListener('change', (e) => {
    currentSpellSource = e.target.value;
    selectedSpell = null;
    selectedSpellCard = null;
    renderSpellsView();
  });

  document.getElementById('ashen-spells-toggle').addEventListener('click', () => {
    currentSpellSource = currentSpellSource === 'ashen-realms' ? 'all' : 'ashen-realms';
    selectedSpell = null;
    selectedSpellCard = null;
    renderSpellsView();
  });

  // Create spell lookup map for O(1) access
  const spellMap = new Map(spells.map(s => [s.name, s]));
  const detailPanel = document.getElementById('spells-detail');
  const spellList = document.getElementById('spells-list');

  // Use event delegation on the spell list for both cards and level headers
  spellList.addEventListener('click', (e) => {
    // Handle level header toggle (collapsible sections)
    const header = e.target.closest('.spell-level-header');
    if (header) {
      const section = header.closest('.spell-level-section');
      if (section) {
        const opening = !section.classList.contains('open');
        section.classList.toggle('open', opening);
        header.setAttribute('aria-expanded', String(opening));
        const levelContainer = section.querySelector('.spell-level-spells');
        if (opening && levelContainer?.dataset.rendered !== 'true') {
          const levelSpells = spellsByLevel[section.dataset.level] || [];
          levelContainer.innerHTML = levelSpells.map((spell, index) => renderSpellCard(spell, index)).join('');
          levelContainer.dataset.rendered = 'true';
          refreshIcons();
        }
      }
      return;
    }

    // Handle spell card selection
    const card = e.target.closest('.spell-card');
    if (!card) return;

    selectedSpell = card.dataset.name;
    const spell = spellMap.get(selectedSpell);

    // Fast deselection - only touch the previously selected card
    if (selectedSpellCard && selectedSpellCard !== card) {
      selectedSpellCard.classList.remove('selected');
      selectedSpellCard.setAttribute('aria-pressed', 'false');
    }
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    selectedSpellCard = card;

    detailPanel.innerHTML = renderSpellDetail(spell);
    detailPanel.classList.add('mobile-active');
    // Icons are now pre-rendered as inline SVGs - no lucide.createIcons() needed
  });

  refreshIcons();
}

function renderSpellCard(spell, index) {
  const isSelected = selectedSpell === spell.name;
  const schoolIcon = SCHOOL_ICONS[spell.school] || 'sparkles';
  const isAshen = spell.source === 'ashen' || spell.source === 'ashen-realms';

  return `
    <button type="button" class="spell-card ${isSelected ? 'selected' : ''} ${isAshen ? 'ashen-realms' : ''} school-${spell.school?.toLowerCase()}"
         data-name="${spell.name}" data-index="${index}" aria-pressed="${isSelected}">
      <div class="spell-card-icon">
        <i data-lucide="${schoolIcon}"></i>
      </div>
      <div class="spell-card-info">
        <div class="spell-card-name">${spell.name}</div>
        <div class="spell-card-meta">
          <span class="spell-school">${spell.school || 'Unknown'}</span>
          ${spell.ritual ? '<span class="spell-tag ritual">Ritual</span>' : ''}
          ${spell.concentration ? '<span class="spell-tag concentration">C</span>' : ''}
          ${isAshen ? '<span class="spell-tag ashen">AR</span>' : ''}
        </div>
      </div>
      <div class="spell-card-indicator">
        <i data-lucide="chevron-right"></i>
      </div>
    </button>
  `;
}

function formatSpellDescription(description) {
  if (!description) return '';

  // Process the description line by line
  const lines = description.split('\n');
  let html = '';
  let inList = false;
  let currentParagraph = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line - close any open paragraph
    if (!line) {
      if (currentParagraph.length > 0) {
        html += `<p>${currentParagraph.join(' ')}</p>`;
        currentParagraph = [];
      }
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    // List item
    if (line.startsWith('- ')) {
      // Close any open paragraph first
      if (currentParagraph.length > 0) {
        html += `<p>${currentParagraph.join(' ')}</p>`;
        currentParagraph = [];
      }

      if (!inList) {
        html += '<ul>';
        inList = true;
      }

      // Process the list item content for bold/italic
      let itemContent = line.substring(2);
      itemContent = itemContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      itemContent = itemContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      html += `<li>${itemContent}</li>`;
    }
    // Bold section header (like **At Higher Levels:** or **Ashen Realms Notes:**)
    else if (line.startsWith('**') && line.includes(':**')) {
      // Close any open list
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      // Close any open paragraph
      if (currentParagraph.length > 0) {
        html += `<p>${currentParagraph.join(' ')}</p>`;
        currentParagraph = [];
      }

      // Process bold text
      let processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      html += `<p class="spell-note">${processedLine}</p>`;
    }
    // Regular paragraph line
    else {
      // Close any open list
      if (inList) {
        html += '</ul>';
        inList = false;
      }

      // Process bold/italic in the line
      let processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      currentParagraph.push(processedLine);
    }
  }

  // Close any remaining open elements
  if (currentParagraph.length > 0) {
    html += `<p>${currentParagraph.join(' ')}</p>`;
  }
  if (inList) {
    html += '</ul>';
  }

  return html;
}

function renderSpellDetail(spell) {
  if (!spell) return '<div class="detail-empty">' + SPELL_DETAIL_ICONS.sparkles + '<p>Select a spell to view details</p></div>';

  const schoolIcon = SCHOOL_ICONS[spell.school] || 'sparkles';
  const isAshen = spell.source === 'ashen' || spell.source === 'ashen-realms';

  // Format description with paragraphs and markdown support
  const formattedDescription = formatSpellDescription(spell.description);

  // Get the school icon SVG (use larger version)
  const schoolSvg = SPELL_DETAIL_ICONS[schoolIcon] || SPELL_DETAIL_ICONS.sparkles;

  return `
    <button class="detail-mobile-back" onclick="closeMobileSpellDetail()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to list
    </button>
    <div class="spell-detail-panel ${isAshen ? 'ashen-realms' : ''}">
      <div class="spell-detail-header">
        <div class="spell-icon-large school-${spell.school?.toLowerCase()}">
          ${schoolSvg}
        </div>
        <div class="spell-header-info">
          <h2 class="spell-detail-name">${spell.name}</h2>
          <div class="spell-detail-type">
            <span class="spell-level-badge">${spell.level}</span>
            <span class="spell-school-badge">${spell.school || 'Unknown'}</span>
            ${spell.ritual ? '<span class="spell-tag-badge ritual">Ritual</span>' : ''}
            ${spell.concentration ? '<span class="spell-tag-badge concentration">Concentration</span>' : ''}
            ${isAshen ? '<span class="spell-tag-badge ashen">Ashen Realms</span>' : ''}
          </div>
        </div>
      </div>

      <div class="spell-stats-grid">
        <div class="spell-stat">
          <div class="stat-label">${SPELL_DETAIL_ICONS.clock} Casting Time</div>
          <div class="stat-value">${spell.castingTime || '1 action'}</div>
        </div>
        <div class="spell-stat">
          <div class="stat-label">${SPELL_DETAIL_ICONS.target} Range</div>
          <div class="stat-value">${spell.range || 'Self'}</div>
        </div>
        <div class="spell-stat">
          <div class="stat-label">${SPELL_DETAIL_ICONS.package} Components</div>
          <div class="stat-value">${spell.components || 'V, S'}</div>
        </div>
        <div class="spell-stat">
          <div class="stat-label">${SPELL_DETAIL_ICONS.timer} Duration</div>
          <div class="stat-value">${spell.duration || 'Instantaneous'}</div>
        </div>
      </div>

      <div class="spell-description">
        ${formattedDescription}
      </div>

      ${spell.higherLevels ? `
        <div class="spell-higher-levels">
          <h4>${SPELL_DETAIL_ICONS['trending-up']} At Higher Levels</h4>
          <p>${spell.higherLevels}</p>
        </div>
      ` : ''}

      ${spell.ashenRealms ? `
        <div class="spell-ashen-component">
          <h4>${SPELL_DETAIL_ICONS.flame} Ashen Realms Component</h4>
          <p>${spell.ashenRealms}</p>
        </div>
      ` : ''}

      ${spell.sovereignAttention ? `
        <div class="spell-sovereign-attention">
          <h4>${SPELL_DETAIL_ICONS.eye} Sovereign Attention</h4>
          <p>${spell.sovereignAttention}</p>
        </div>
      ` : ''}

      ${spell.cost ? `
        <div class="spell-cost">
          <h4>${SPELL_DETAIL_ICONS.skull} Cost</h4>
          <p>${spell.cost}</p>
        </div>
      ` : ''}

      <div class="spell-classes">
        <h4>${SPELL_DETAIL_ICONS.users} Available To</h4>
        <div class="class-tags">
          ${spell.classes?.map(c => {
            const classIcon = CLASS_ICONS[c] || 'user';
            return `<span class="class-tag">${SPELL_DETAIL_ICONS[classIcon] || SPELL_DETAIL_ICONS.user} ${c}</span>`;
          }).join('') || '<span class="class-tag">Unknown</span>'}
        </div>
      </div>
    </div>
  `;
}

function closeMobileSpellDetail() {
  const detailPanel = document.getElementById('spells-detail');
  if (detailPanel) {
    detailPanel.classList.remove('mobile-active');
  }
}

// Expose closeMobileSpellDetail on window for onclick in HTML
window.closeMobileSpellDetail = closeMobileSpellDetail;

// Animations removed for performance - 669 spells is too many to animate

export { setupSpellsLink, showSpells };
