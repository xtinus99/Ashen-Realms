// ===== BONDS & STANDING =====
// Built from the DM's vault ledger by scripts/build-bonds.py. Six steps, no points:
// Enemy, Against you, Cold, Known, Trusted, Sworn. The data only carries what the players
// have unlocked, so nothing hidden here can leak through the page.
import state from './state.js';
import { refreshIcons } from './icons.js';
import { attachImageZoom } from './images.js';
import { prefersReducedMotion } from './smooth-scroll.js';

const STEPS = ['Enemy', 'Against you', 'Cold', 'Known', 'Trusted', 'Sworn'];
const STEP_RANK = Object.fromEntries(STEPS.map((s, i) => [s, i]));
const STEP_CLASS = {
  'Enemy': 'hostile',
  'Against you': 'hated',
  'Cold': 'wary',
  'Known': 'neutral',
  'Trusted': 'trusted',
  'Sworn': 'kindred'
};
const REWARD_STEPS = ['Known', 'Trusted', 'Sworn'];
const FALL_STEPS = ['Cold', 'Against you', 'Enemy'];
const PARTY = [
  ['farkas', 'Farkas'],
  ['veezara', 'Veezara'],
  ['anvil', 'Anvil']
];

let relationshipData = null;
let currentRepCharacter = 'farkas';
let currentRepFilter = 'all';
let currentBondSearch = '';
let selectedEntry = null;
let currentSort = 'standing'; // 'standing' or 'name'
let sortAscending = false;

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function setupBondsLink() {
  const bondsLink = document.getElementById('bonds-link');
  if (bondsLink) {
    bondsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showRelationships();
      document.getElementById('sidebar').classList.remove('open');
    });
  }
}

async function loadRelationshipData() {
  if (relationshipData) return relationshipData;
  try {
    const response = await fetch('relationships-data.json');
    relationshipData = await response.json();
    return relationshipData;
  } catch (error) {
    console.error('Failed to load relationship data:', error);
    return null;
  }
}

function stepOf(person) {
  return person.standing?.[currentRepCharacter] || null;
}

function imageStem(person) {
  if (!person.image) return null;
  return person.image.replace(/^images\//, '').replace(/\.webp$/i, '');
}

async function showRelationships() {
  state.currentItem = null;
  state.currentCategory = null;

  await loadRelationshipData();
  if (!relationshipData?.people) {
    document.getElementById('content-body').innerHTML = '<div class="welcome-container"><p>Failed to load relationship data.</p></div>';
    return;
  }

  document.getElementById('content-body').classList.add('full-width');
  window.location.hash = 'bonds';
  document.getElementById('breadcrumb').innerHTML = `
    <button type="button" class="breadcrumb-home" onclick="showWelcome()">Compendium</button>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">Bonds & Standing</span>
  `;
  document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-category.open').forEach(el => el.classList.remove('open'));

  renderRelationshipsView();
}

function visiblePeople() {
  let people = relationshipData.people.filter(p => stepOf(p));
  if (currentRepFilter === 'people') people = people.filter(p => p.kind !== 'faction' && p.realm !== 'eve');
  if (currentRepFilter === 'factions') people = people.filter(p => p.kind === 'faction');
  if (currentRepFilter === 'eve') people = people.filter(p => p.realm === 'eve');
  if (currentBondSearch) {
    const q = currentBondSearch.toLowerCase();
    people = people.filter(p => [p.name, p.who, p.where].some(v => (v || '').toLowerCase().includes(q)));
  }
  people.sort((a, b) => {
    const result = currentSort === 'name'
      ? a.name.localeCompare(b.name)
      : (STEP_RANK[stepOf(b)] - STEP_RANK[stepOf(a)]) || a.name.localeCompare(b.name);
    return sortAscending ? -result : result;
  });
  return people;
}

function renderRelationshipsView() {
  const people = visiblePeople();
  if (!selectedEntry || !people.find(p => p.name === selectedEntry)) {
    selectedEntry = people[0]?.name || null;
  }
  const selected = people.find(p => p.name === selectedEntry);
  const charName = Object.fromEntries(PARTY)[currentRepCharacter];

  document.getElementById('content-body').innerHTML = `
    <div class="bonds-container">
      <div class="bonds-header">
        <button class="bonds-back-btn" id="bonds-back-btn">
          <i data-lucide="arrow-left"></i>
          <span>Back</span>
        </button>
        <div class="bonds-title-area">
          <h1 class="bonds-title">Bonds & Standing</h1>
          <p class="bonds-subtitle">Who stands with ${charName}, and what they'll do for him</p>
        </div>
      </div>

      <div class="bonds-controls">
        <div class="char-tabs">
          <span class="char-group-label">Party</span>
          ${PARTY.map(([key, label]) => `
            <button class="char-tab ${currentRepCharacter === key ? 'active' : ''}" data-char="${key}">
              <span class="tab-name">${label}</span>
            </button>`).join('')}
        </div>

        <div class="bonds-filters">
          <button class="filter-chip ${currentRepFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
          <button class="filter-chip ${currentRepFilter === 'people' ? 'active' : ''}" data-filter="people">People</button>
          <button class="filter-chip ${currentRepFilter === 'factions' ? 'active' : ''}" data-filter="factions">Factions</button>
          <button class="filter-chip ${currentRepFilter === 'eve' ? 'active' : ''}" data-filter="eve">Before the Usurpation</button>
          <div class="filter-divider"></div>
          <button class="sort-chip ${currentSort === 'standing' ? 'active' : ''}" data-sort="standing">
            <i data-lucide="${currentSort === 'standing' ? (sortAscending ? 'arrow-up' : 'arrow-down') : 'trending-up'}"></i> Standing
          </button>
          <button class="sort-chip ${currentSort === 'name' ? 'active' : ''}" data-sort="name">
            <i data-lucide="${currentSort === 'name' ? (sortAscending ? 'arrow-up' : 'arrow-down') : 'a-large-small'}"></i> Name
          </button>
        </div>
      </div>

      <div class="bonds-search-row">
        <div class="bonds-search">
          <i data-lucide="search"></i>
          <label class="sr-only" for="bonds-search-input">Search bonds</label>
          <input id="bonds-search-input" type="search" placeholder="Find a person or faction..." value="${escapeHtml(currentBondSearch)}">
        </div>
        <span class="bonds-result-count" aria-live="polite">${people.length} bonds</span>
      </div>

      <div class="bonds-layout">
        <div class="bonds-list">
          ${people.map((p, i) => renderBondCard(p, i)).join('') || '<div class="detail-empty"><p>No bonds here yet.</p></div>'}
        </div>
        <div class="bonds-detail" id="bonds-detail">
          ${selected ? renderBondDetail(selected) : '<div class="detail-empty"><i data-lucide="users"></i><p>Select a bond to view details</p></div>'}
        </div>
      </div>
    </div>
  `;

  document.getElementById('bonds-back-btn').addEventListener('click', () => { window.location.hash = ''; });

  let searchTimer;
  document.getElementById('bonds-search-input').addEventListener('input', (event) => {
    currentBondSearch = event.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderRelationshipsView(), 120);
  });

  document.querySelectorAll('.char-tab').forEach(tab => tab.addEventListener('click', () => {
    currentRepCharacter = tab.dataset.char;
    selectedEntry = null;
    renderRelationshipsView();
  }));

  document.querySelectorAll('.filter-chip').forEach(btn => btn.addEventListener('click', () => {
    currentRepFilter = btn.dataset.filter;
    selectedEntry = null;
    renderRelationshipsView();
  }));

  document.querySelectorAll('.sort-chip').forEach(btn => btn.addEventListener('click', () => {
    if (currentSort === btn.dataset.sort) sortAscending = !sortAscending;
    else { currentSort = btn.dataset.sort; sortAscending = false; }
    renderRelationshipsView();
  }));

  document.querySelectorAll('.bond-card').forEach(card => card.addEventListener('click', () => {
    selectedEntry = card.dataset.name;
    const person = people.find(p => p.name === selectedEntry);
    document.querySelectorAll('.bond-card').forEach(c => {
      c.classList.remove('selected');
      c.setAttribute('aria-pressed', 'false');
    });
    card.classList.add('selected');
    card.setAttribute('aria-pressed', 'true');
    const detailPanel = document.getElementById('bonds-detail');
    detailPanel.innerHTML = renderBondDetail(person);
    detailPanel.classList.add('mobile-active');
    refreshIcons();
    attachImageZoom();
    animateDetailPanel();
  }));

  refreshIcons();
  animateBondCards();
  animateDetailPanel();
}

function stepPips(step) {
  const rank = STEP_RANK[step];
  return STEPS.map((s, i) => {
    const on = rank >= STEP_RANK.Known ? (i >= STEP_RANK.Known && i <= rank) : (i >= rank && i < STEP_RANK.Known);
    return `<span class="step-pip ${on ? `on tier-${STEP_CLASS[step]}` : ''} ${i === rank ? 'current' : ''}" title="${s}"></span>`;
  }).join('');
}

function renderBondCard(person, index) {
  const step = stepOf(person);
  const stem = imageStem(person);
  const isSelected = selectedEntry === person.name;
  const isEnemy = step === 'Enemy';
  return `
    <button type="button" class="bond-card ${isSelected ? 'selected' : ''} ${isEnemy ? 'enemy' : ''} tier-${STEP_CLASS[step]}"
         data-name="${escapeHtml(person.name)}" data-index="${index}" aria-pressed="${isSelected}">
      <div class="card-portrait">
        ${stem ? `<img src="thumbnails/faces/${stem}.webp" alt="" loading="lazy" decoding="async" onerror="if (this.dataset.fellBack) { this.style.display='none'; } else { this.dataset.fellBack='1'; this.src='thumbnails/${stem}.webp'; }">` : ''}
        <span class="card-initial">${escapeHtml(person.name.replace(/^The /, '').charAt(0))}</span>
        ${isEnemy ? '<div class="enemy-overlay"><i data-lucide="skull"></i></div>' : ''}
      </div>
      <div class="card-info">
        <div class="card-name">${escapeHtml(person.name)}${person.romance ? ' <i data-lucide="heart" class="card-romance" aria-label="Romance"></i>' : ''}</div>
        <div class="card-type">${escapeHtml(person.where || '')}${person.realm === 'eve' ? ' · Before the Usurpation' : ''}</div>
        <div class="card-standing">
          <span class="step-pips">${stepPips(step)}</span>
          <span class="standing-text tier-${STEP_CLASS[step]}">${step}</span>
        </div>
      </div>
      <div class="card-indicator"><i data-lucide="chevron-right"></i></div>
    </button>
  `;
}

function renderBondDetail(person) {
  if (!person) return '<div class="detail-empty"><i data-lucide="users"></i><p>Select a bond to view details</p></div>';
  const step = stepOf(person);
  const rank = STEP_RANK[step];
  const stem = imageStem(person);
  const isEnemy = step === 'Enemy';

  const ladder = STEPS.map((s, i) => `
    <div class="step-node ${i === rank ? 'current' : ''} ${i < STEP_RANK.Known ? 'fall' : 'rise'} tier-${STEP_CLASS[s]}">
      <span class="step-dot"></span>
      <span class="step-name">${s}</span>
    </div>`).join('');

  const rewards = REWARD_STEPS.filter(s => person.rewards?.[s]).map(s => {
    const unlocked = rank >= STEP_RANK[s];
    return `
      <div class="unlock-row ${unlocked ? 'unlocked' : 'locked'}">
        <span class="unlock-icon">${unlocked ? '<i data-lucide="check-circle"></i>' : '<i data-lucide="lock"></i>'}</span>
        <span class="unlock-tier tier-${STEP_CLASS[s]}">${s}</span>
        <span class="unlock-reward">${escapeHtml(person.rewards[s])}</span>
      </div>`;
  }).join('');

  const falls = rank < STEP_RANK.Known
    ? FALL_STEPS.filter(s => STEP_RANK[s] >= rank && person.falls?.[s]).map(s => `
      <div class="fall-row tier-${STEP_CLASS[s]}">
        <span class="unlock-tier tier-${STEP_CLASS[s]}">${s}</span>
        <span class="unlock-reward">${escapeHtml(person.falls[s])}</span>
      </div>`).join('')
    : '';

  const ask = person.ask && person.ask.told.includes(currentRepCharacter) ? person.ask.text : null;

  const chronicle = (person.chronicle || [])
    .filter(c => c.pcs.includes(currentRepCharacter))
    .slice().reverse()
    .map(c => `
      <div class="history-entry">
        <span class="history-session">${escapeHtml(c.session)}</span>
        <span class="history-reason">${escapeHtml(c.text)}</span>
      </div>`).join('') || '<div class="history-entry empty">Nothing written yet.</div>';

  return `
    <button class="detail-mobile-back" onclick="closeMobileDetail()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to list
    </button>
    <div class="detail-panel ${isEnemy ? 'enemy' : ''}">
      <div class="detail-hero">
        <div class="hero-portrait ${isEnemy ? 'enemy' : `tier-${STEP_CLASS[step]}`}">
          ${stem ? `<img src="images/${stem}.webp" alt="${escapeHtml(person.name)}" onerror="this.src='thumbnails/${stem}.webp'">` : `<span class="hero-initial">${escapeHtml(person.name.replace(/^The /, '').charAt(0))}</span>`}
        </div>
        <div class="hero-info">
          <h2 class="hero-name">${escapeHtml(person.name)}</h2>
          <div class="hero-type">${escapeHtml(person.who || '')}</div>
          ${person.where ? `<div class="hero-where"><i data-lucide="map-pin"></i> ${escapeHtml(person.where)}${person.realm === 'eve' ? ' · Before the Usurpation' : ''}</div>` : ''}
          ${person.romance ? '<div class="hero-romance"><i data-lucide="heart"></i> Romance</div>' : ''}
        </div>
      </div>

      <div class="standing-section">
        <div class="standing-header">
          <span class="standing-label">Standing</span>
          <span class="standing-value tier-${STEP_CLASS[step]}">${step}</span>
        </div>
        <div class="step-ladder">${ladder}</div>
      </div>

      ${person.says ? `
        <div class="quote-section">
          <div class="quote-icon"><i data-lucide="quote"></i></div>
          <p class="quote-text">${escapeHtml(person.says)}</p>
        </div>` : ''}

      ${person.wants ? `
        <div class="bond-wants">
          <h3 class="section-header"><i data-lucide="compass"></i> What they want</h3>
          <p>${escapeHtml(person.wants)}</p>
        </div>` : ''}

      ${ask ? `
        <div class="bond-ask">
          <h3 class="section-header"><i data-lucide="flag"></i> Their ask</h3>
          <p>${escapeHtml(ask)}</p>
        </div>` : ''}

      ${falls ? `
        <div class="bond-falls">
          <h3 class="section-header"><i data-lucide="shield-alert"></i> Where you stand</h3>
          <div class="unlocks-list">${falls}</div>
        </div>` : ''}

      ${rewards ? `
        <div class="unlocks-section">
          <h3 class="section-header"><i data-lucide="gift"></i> What they'll do for you</h3>
          <div class="unlocks-list">${rewards}</div>
        </div>` : ''}

      <div class="history-section">
        <h3 class="section-header"><i data-lucide="scroll-text"></i> Chronicle</h3>
        <div class="history-list">${chronicle}</div>
      </div>
    </div>
  `;
}

function animateBondCards() {
  if (prefersReducedMotion()) return;
  document.querySelectorAll('.bond-card').forEach((card, index) => {
    card.animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 280, delay: 35 * Math.min(index, 12), easing: 'ease-out', fill: 'both' }
    );
  });
}

function closeMobileDetail() {
  const detailPanel = document.getElementById('bonds-detail');
  if (detailPanel) detailPanel.classList.remove('mobile-active');
}

// Exposed for the onclick in the detail panel's back button
window.closeMobileDetail = closeMobileDetail;

function animateDetailPanel() {
  const panel = document.querySelector('.detail-panel');
  if (!panel) return;
  panel.style.opacity = '1';
  if (prefersReducedMotion()) return;
  panel.animate(
    [{ opacity: 0, transform: 'translateX(18px)' }, { opacity: 1, transform: 'translateX(0)' }],
    { duration: 260, easing: 'ease-out' }
  );
  [...document.querySelectorAll('.history-entry, .unlock-row, .fall-row')].forEach((row, index) => {
    row.animate(
      [{ opacity: 0, transform: 'translateX(-8px)' }, { opacity: 1, transform: 'translateX(0)' }],
      { duration: 220, delay: 300 + Math.min(index, 12) * 35, easing: 'ease-out', fill: 'both' }
    );
  });
}

export { setupBondsLink, showRelationships };
