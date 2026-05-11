// ===== BONDS & STANDING (REPUTATION TRACKER) =====
import state from './state.js';
import { refreshIcons } from './icons.js';
import { attachImageZoom } from './images.js';
import gsap from 'gsap';

const REP_TIERS = [
  { name: 'Hostile', min: 0, max: 5000, class: 'hostile' },
  { name: 'Hated', min: 5000, max: 7500, class: 'hated' },
  { name: 'Wary', min: 7500, max: 10000, class: 'wary' },
  { name: 'Neutral', min: 10000, max: 12500, class: 'neutral' },
  { name: 'Cordial', min: 12500, max: 17500, class: 'cordial' },
  { name: 'Friendly', min: 17500, max: 25000, class: 'friendly' },
  { name: 'Trusted', min: 25000, max: 35000, class: 'trusted' },
  { name: 'Sworn', min: 35000, max: 45000, class: 'sworn' },
  { name: 'Kindred', min: 45000, max: Infinity, class: 'kindred' }
];

let relationshipData = null;
let currentRepCharacter = 'sol';
let currentRepFilter = 'all';

// Image name mapping for NPCs whose file names don't match their display names
const REP_IMAGE_MAP = {
  "Kael's Echo": "Kael",
  "Aedwynn the Maker": "Aedwynn Fragment - Golden Tree",
  "Talaris Bloomrend": "Talaris Bloomrend the Verdant King",
  "The Church of Mareatha": null,
  "Galheran the Unmoved": "Galheran",
  "Seraphine Vale": "Seraphine - Returned"
};

// Character display names
const CHAR_NAMES = {
  sol: 'Sol Raven',
  fursen: 'Fursen',
  teldryn: 'Teldryn'
};

let selectedEntry = null;
let currentSort = 'reputation'; // 'reputation' or 'name'
let sortAscending = false; // false = descending (highest first), true = ascending (lowest first)

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
    const response = await fetch('relationships-data.json?v=' + Date.now());
    relationshipData = await response.json();
    return relationshipData;
  } catch (error) {
    console.error('Failed to load relationship data:', error);
    return null;
  }
}

function getRepTier(reputation) {
  for (let i = REP_TIERS.length - 1; i >= 0; i--) {
    if (reputation >= REP_TIERS[i].min) {
      return REP_TIERS[i];
    }
  }
  return REP_TIERS[0];
}

function getRepProgress(reputation) {
  const tier = getRepTier(reputation);
  const tierRange = tier.max - tier.min;
  const progress = reputation - tier.min;
  return {
    current: progress,
    needed: tierRange,
    percentage: Math.min(100, (progress / tierRange) * 100)
  };
}

async function showRelationships() {
  state.currentItem = null;
  state.currentCategory = null;

  await loadRelationshipData();
  if (!relationshipData) {
    document.getElementById('content-body').innerHTML = '<div class="welcome-container"><p>Failed to load relationship data.</p></div>';
    return;
  }

  // Enable full-width mode
  document.getElementById('content-body').classList.add('full-width');

  // Update URL
  window.location.hash = 'bonds';

  // Update breadcrumb
  document.getElementById('breadcrumb').innerHTML = `
    <span class="breadcrumb-home" style="cursor:pointer" onclick="showWelcome()">Compendium</span>
    <span class="breadcrumb-sep">/</span>
    <span class="breadcrumb-current">Bonds & Standing</span>
  `;

  // Clear active states
  document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-category.open').forEach(el => el.classList.remove('open'));

  renderRelationshipsView();
}

function renderRelationshipsView() {
  const characterData = relationshipData[currentRepCharacter];
  if (!characterData) return;

  let relationships = characterData.relationships;
  if (currentRepFilter !== 'all') {
    relationships = relationships.filter(r => r.category === currentRepFilter);
  }

  // Sort based on current sort mode and direction
  relationships.sort((a, b) => {
    if (a.permanentEnemy && !b.permanentEnemy) return -1;
    if (!a.permanentEnemy && b.permanentEnemy) return 1;

    let result;
    if (currentSort === 'name') {
      result = a.name.localeCompare(b.name);
    } else {
      result = b.reputation - a.reputation;
    }
    return sortAscending ? -result : result;
  });

  // Select first entry by default if none selected
  if (!selectedEntry || !relationships.find(r => r.name === selectedEntry)) {
    selectedEntry = relationships[0]?.name || null;
  }

  const selectedRel = relationships.find(r => r.name === selectedEntry);

  document.getElementById('content-body').innerHTML = `
    <div class="bonds-container">
      <div class="bonds-header">
        <button class="bonds-back-btn" id="bonds-back-btn">
          <i data-lucide="arrow-left"></i>
          <span>Back</span>
        </button>
        <div class="bonds-title-area">
          <h1 class="bonds-title">Bonds & Standing</h1>
          <p class="bonds-subtitle">The personal ledger of ${CHAR_NAMES[currentRepCharacter]}</p>
        </div>
      </div>

      <div class="bonds-controls">
        <div class="char-tabs">
          <button class="char-tab ${currentRepCharacter === 'sol' ? 'active' : ''}" data-char="sol">
            <span class="tab-name">Sol</span>
          </button>
          <button class="char-tab ${currentRepCharacter === 'fursen' ? 'active' : ''}" data-char="fursen">
            <span class="tab-name">Fursen</span>
          </button>
          <button class="char-tab ${currentRepCharacter === 'teldryn' ? 'active' : ''}" data-char="teldryn">
            <span class="tab-name">Teldryn</span>
          </button>
        </div>

        <div class="bonds-filters">
          <button class="filter-chip ${currentRepFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
          <button class="filter-chip ${currentRepFilter === 'sovereigns' ? 'active' : ''}" data-filter="sovereigns">Sovereigns</button>
          <button class="filter-chip ${currentRepFilter === 'npcs' ? 'active' : ''}" data-filter="npcs">NPCs</button>
          <button class="filter-chip ${currentRepFilter === 'factions' ? 'active' : ''}" data-filter="factions">Factions</button>
          <div class="filter-divider"></div>
          <button class="sort-chip ${currentSort === 'reputation' ? 'active' : ''}" data-sort="reputation">
            <i data-lucide="${currentSort === 'reputation' ? (sortAscending ? 'arrow-up' : 'arrow-down') : 'trending-up'}"></i> Standing
          </button>
          <button class="sort-chip ${currentSort === 'name' ? 'active' : ''}" data-sort="name">
            <i data-lucide="${currentSort === 'name' ? (sortAscending ? 'arrow-up' : 'arrow-down') : 'a-large-small'}"></i> Name
          </button>
        </div>
      </div>

      <div class="bonds-layout">
        <div class="bonds-list">
          ${relationships.map((rel, index) => renderBondCard(rel, index)).join('')}
        </div>
        <div class="bonds-detail" id="bonds-detail">
          ${selectedRel ? renderBondDetail(selectedRel) : '<div class="detail-empty"><i data-lucide="users"></i><p>Select a bond to view details</p></div>'}
        </div>
      </div>
    </div>
  `;

  // Setup event listeners
  document.getElementById('bonds-back-btn').addEventListener('click', () => {
    window.location.hash = '';
  });

  document.querySelectorAll('.char-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentRepCharacter = tab.dataset.char;
      selectedEntry = null;
      renderRelationshipsView();
    });
  });

  document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRepFilter = btn.dataset.filter;
      selectedEntry = null;
      renderRelationshipsView();
    });
  });

  document.querySelectorAll('.sort-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentSort === btn.dataset.sort) {
        // Same sort clicked - toggle direction
        sortAscending = !sortAscending;
      } else {
        // Different sort clicked - switch to it with default direction
        currentSort = btn.dataset.sort;
        sortAscending = false;
      }
      renderRelationshipsView();
    });
  });

  document.querySelectorAll('.bond-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedEntry = card.dataset.name;
      // Update detail panel without full re-render for smoother feel
      const rel = relationships.find(r => r.name === selectedEntry);
      document.querySelectorAll('.bond-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const detailPanel = document.getElementById('bonds-detail');
      detailPanel.innerHTML = renderBondDetail(rel);
      detailPanel.classList.add('mobile-active');
      refreshIcons();
      attachImageZoom();
      animateDetailPanel();
    });
  });

  refreshIcons();

  // Animate cards on initial load
  animateBondCards();
}

function renderBondCard(rel, index) {
  const tier = getRepTier(rel.reputation);
  const progress = getRepProgress(rel.reputation);
  let imageName = REP_IMAGE_MAP[rel.name];
  if (imageName === undefined) imageName = rel.name;

  const isSelected = selectedEntry === rel.name;
  const isEnemy = rel.permanentEnemy;

  return `
    <div class="bond-card ${isSelected ? 'selected' : ''} ${isEnemy ? 'enemy' : ''} tier-${tier.class}"
         data-name="${rel.name}" data-index="${index}">
      <div class="card-portrait">
        ${imageName ? `<img src="thumbnails/${imageName}.webp" alt="${rel.name}" onerror="this.style.display='none'">` : ''}
        <span class="card-initial">${rel.name.charAt(0)}</span>
        ${isEnemy ? '<div class="enemy-overlay"><i data-lucide="skull"></i></div>' : ''}
        ${tier.class === 'soulbound' || tier.class === 'devoted' ? '<div class="card-glow"></div>' : ''}
      </div>
      <div class="card-info">
        <div class="card-name">${rel.name}</div>
        <div class="card-type">${rel.type.replace(/^NPC\s*-\s*/i, '')}</div>
        <div class="card-standing">
          ${isEnemy ? `
            <span class="standing-text enemy">Eternal Enemy</span>
          ` : `
            <div class="standing-bar-mini">
              <div class="standing-fill-mini tier-${tier.class}" data-width="${progress.percentage}"></div>
            </div>
            <span class="standing-text tier-${tier.class}">${tier.name}</span>
          `}
        </div>
      </div>
      <div class="card-indicator">
        <i data-lucide="chevron-right"></i>
      </div>
    </div>
  `;
}

function renderBondDetail(rel) {
  if (!rel) return '<div class="detail-empty"><i data-lucide="users"></i><p>Select a bond to view details</p></div>';

  const tier = getRepTier(rel.reputation);
  const progress = getRepProgress(rel.reputation);
  let imageName = REP_IMAGE_MAP[rel.name];
  if (imageName === undefined) imageName = rel.name;
  const isEnemy = rel.permanentEnemy;

  // Build tier progress visualization
  const tierProgressHtml = REP_TIERS.map((t, i) => {
    const isCurrent = t.class === tier.class;
    const isPast = rel.reputation >= t.max;
    const isFuture = rel.reputation < t.min;
    return `<div class="tier-node ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''} tier-${t.class}" title="${t.name}"></div>`;
  }).join('');

  const historyHtml = rel.history?.length > 0
    ? rel.history.slice(0, 5).map(h => `
        <div class="history-entry">
          <span class="history-change ${h.change >= 0 ? 'positive' : 'negative'}">${h.change >= 0 ? '+' : ''}${h.change.toLocaleString()}</span>
          <span class="history-reason">${h.reason}</span>
        </div>
      `).join('')
    : '<div class="history-entry empty">No recorded history</div>';

  const unlocksHtml = rel.unlocks?.length > 0
    ? rel.unlocks.map(u => {
        const unlocked = rel.reputation >= u.threshold;
        const unlockTier = getRepTier(u.threshold);
        return `
          <div class="unlock-row ${unlocked ? 'unlocked' : 'locked'}">
            <span class="unlock-icon">${unlocked ? '<i data-lucide="check-circle"></i>' : '<i data-lucide="lock"></i>'}</span>
            <span class="unlock-tier tier-${unlockTier.class}">${unlockTier.name}</span>
            <span class="unlock-reward">${unlocked ? u.reward : '???'}</span>
          </div>
        `;
      }).join('')
    : '';

  return `
    <button class="detail-mobile-back" onclick="closeMobileDetail()">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      Back to list
    </button>
    <div class="detail-panel ${isEnemy ? 'enemy' : ''}">
      <div class="detail-hero">
        <div class="hero-portrait ${isEnemy ? 'enemy' : `tier-${tier.class}`}">
          ${imageName ? `<img src="images/${imageName}.webp" alt="${rel.name}" onerror="this.src='thumbnails/${imageName}.webp'">` : `<span class="hero-initial">${rel.name.charAt(0)}</span>`}
          ${tier.class === 'soulbound' || tier.class === 'devoted' ? '<div class="hero-particles"></div>' : ''}
        </div>
        <div class="hero-info">
          <h2 class="hero-name">${rel.name}</h2>
          <div class="hero-type">${rel.type}</div>
          ${rel.romanceAvailable ? '<div class="hero-romance"><i data-lucide="heart"></i> Romance Available</div>' : ''}
        </div>
      </div>

      ${isEnemy ? `
        <div class="enemy-banner">
          <i data-lucide="skull"></i>
          <span>ETERNAL ENEMY</span>
          <i data-lucide="skull"></i>
        </div>
      ` : `
        <div class="standing-section">
          <div class="standing-header">
            <span class="standing-label">Standing</span>
            <span class="standing-value tier-${tier.class}">${tier.name}</span>
          </div>
          <div class="standing-bar-large">
            <div class="standing-fill-large tier-${tier.class}" data-width="${progress.percentage}"></div>
            <div class="standing-glow tier-${tier.class}"></div>
          </div>
          <div class="standing-numbers">
            <span class="current-rep">${progress.current.toLocaleString()}</span>
            <span class="rep-divider">/</span>
            <span class="max-rep">${progress.needed.toLocaleString()}</span>
          </div>
          <div class="tier-progress">
            ${tierProgressHtml}
          </div>
        </div>
      `}

      ${rel.description ? `
        <div class="quote-section">
          <div class="quote-icon"><i data-lucide="quote"></i></div>
          <p class="quote-text">${rel.description}</p>
        </div>
      ` : ''}

      <div class="traits-section">
        ${rel.likes?.length ? `
          <div class="trait-group likes">
            <div class="trait-header"><i data-lucide="thumbs-up"></i> Appreciates</div>
            <div class="trait-tags">${rel.likes.map(l => `<span class="trait-tag">${l}</span>`).join('')}</div>
          </div>
        ` : ''}
        ${rel.dislikes?.length ? `
          <div class="trait-group dislikes">
            <div class="trait-header"><i data-lucide="thumbs-down"></i> Disdains</div>
            <div class="trait-tags">${rel.dislikes.map(d => `<span class="trait-tag">${d}</span>`).join('')}</div>
          </div>
        ` : ''}
      </div>

      <div class="history-section">
        <h3 class="section-header"><i data-lucide="scroll-text"></i> Chronicle</h3>
        <div class="history-list">
          ${historyHtml}
        </div>
      </div>

      ${unlocksHtml ? `
        <div class="unlocks-section">
          <h3 class="section-header"><i data-lucide="gift"></i> Reputation Rewards</h3>
          <div class="unlocks-list">
            ${unlocksHtml}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function animateBondCards() {
  // Animate cards appearing with stagger using GSAP
  gsap.fromTo('.bond-card',
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.05,
      delay: 0.1,
      ease: 'power2.out'
    }
  );

  // Animate mini standing bars filling
  gsap.delayedCall(0.3, () => {
    document.querySelectorAll('.standing-fill-mini').forEach(bar => {
      const targetWidth = bar.dataset.width;
      gsap.fromTo(bar,
        { width: '0%' },
        { width: targetWidth + '%', duration: 0.8, ease: 'power3.out' }
      );
    });
  });
}

function closeMobileDetail() {
  const detailPanel = document.getElementById('bonds-detail');
  if (detailPanel) {
    detailPanel.classList.remove('mobile-active');
  }
}

// Expose closeMobileDetail on window for onclick in HTML
window.closeMobileDetail = closeMobileDetail;

function animateDetailPanel() {
  // Animate the detail panel content using GSAP
  gsap.fromTo('.detail-panel',
    { opacity: 0, x: 20 },
    { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
  );

  // Animate the large standing bar
  gsap.delayedCall(0.2, () => {
    document.querySelectorAll('.standing-fill-large').forEach(bar => {
      const targetWidth = bar.dataset.width;
      gsap.fromTo(bar,
        { width: '0%' },
        { width: targetWidth + '%', duration: 1, ease: 'power3.out' }
      );
    });
  });

  // Animate tier nodes
  gsap.fromTo('.tier-node',
    { scale: 0 },
    {
      scale: 1,
      duration: 0.3,
      stagger: 0.04,
      delay: 0.4,
      ease: 'back.out(1.7)'
    }
  );

  // Animate history entries
  gsap.fromTo('.history-entry',
    { opacity: 0, x: -10 },
    {
      opacity: 1,
      x: 0,
      duration: 0.3,
      stagger: 0.06,
      delay: 0.6,
      ease: 'power2.out'
    }
  );

  // Animate unlock rows
  gsap.fromTo('.unlock-row',
    { opacity: 0, x: -10 },
    {
      opacity: 1,
      x: 0,
      duration: 0.3,
      stagger: 0.06,
      delay: 0.7,
      ease: 'power2.out'
    }
  );
}

export { setupBondsLink, showRelationships };
