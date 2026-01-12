// =====================================================
// RELATIONSHIPS TRACKER - The Ashen Realms
// WoW-style Reputation System
// =====================================================

// Reputation tier thresholds (WoW-style scaling)
const TIERS = [
    { name: 'Hated', min: 0, max: 3000, class: 'hated' },
    { name: 'Hostile', min: 3000, max: 6000, class: 'hostile' },
    { name: 'Unfriendly', min: 6000, max: 9000, class: 'unfriendly' },
    { name: 'Neutral', min: 9000, max: 15000, class: 'neutral' },
    { name: 'Cordial', min: 15000, max: 21000, class: 'cordial' },
    { name: 'Friendly', min: 21000, max: 33000, class: 'friendly' },
    { name: 'Trusted', min: 33000, max: 45000, class: 'trusted' },
    { name: 'Devoted', min: 45000, max: 51000, class: 'devoted' },
    { name: 'Soulbound', min: 51000, max: 57000, class: 'soulbound' }
];

const MAX_REP = 57000;

// Current character being viewed
let currentCharacter = 'jonas';
let currentFilter = 'all';

// DOM Elements
const container = document.getElementById('relationships-container');
const charTabs = document.querySelectorAll('.char-tab');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadRelationshipData();
    setupEventListeners();
    renderRelationships();
});

// Relationship data - will be populated from JSON
let relationshipData = null;

async function loadRelationshipData() {
    try {
        const response = await fetch('relationships-data.json');
        relationshipData = await response.json();
    } catch (error) {
        console.error('Failed to load relationship data:', error);
        relationshipData = getDefaultData();
    }
}

function setupEventListeners() {
    // Character tabs
    charTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            charTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCharacter = tab.dataset.character;
            renderRelationships();
        });
    });

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderRelationships();
        });
    });
}

function getTier(reputation) {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (reputation >= TIERS[i].min) {
            return TIERS[i];
        }
    }
    return TIERS[0];
}

function getProgressInTier(reputation) {
    const tier = getTier(reputation);
    const tierIndex = TIERS.indexOf(tier);

    // If at max tier
    if (tierIndex === TIERS.length - 1) {
        return {
            current: reputation - tier.min,
            needed: tier.max - tier.min,
            percentage: Math.min(100, ((reputation - tier.min) / (tier.max - tier.min)) * 100)
        };
    }

    const tierRange = tier.max - tier.min;
    const progress = reputation - tier.min;

    return {
        current: progress,
        needed: tierRange,
        percentage: (progress / tierRange) * 100
    };
}

function renderRelationships() {
    if (!relationshipData) return;

    const characterData = relationshipData[currentCharacter];
    if (!characterData) return;

    // Filter relationships
    let relationships = characterData.relationships;
    if (currentFilter !== 'all') {
        relationships = relationships.filter(r => r.category === currentFilter);
    }

    // Sort by reputation (highest first, but enemies at the top)
    relationships.sort((a, b) => {
        if (a.permanentEnemy && !b.permanentEnemy) return -1;
        if (!a.permanentEnemy && b.permanentEnemy) return 1;
        return b.reputation - a.reputation;
    });

    container.innerHTML = relationships.map(rel => renderCard(rel)).join('');

    // Re-initialize Lucide icons for new content
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderCard(rel) {
    const tier = getTier(rel.reputation);
    const progress = getProgressInTier(rel.reputation);
    const initial = rel.name.charAt(0).toUpperCase();

    const permanentEnemyClass = rel.permanentEnemy ? 'permanent-enemy' : '';
    const permanentEnemyBadge = rel.permanentEnemy
        ? `<div class="permanent-enemy-badge"><i data-lucide="skull"></i> Permanent Enemy</div>`
        : '';

    const romanceIndicator = rel.romanceAvailable
        ? `<span class="romance-available"><i data-lucide="heart"></i></span>`
        : '';

    // Render likes/dislikes
    const likesHtml = rel.likes && rel.likes.length > 0
        ? `<div class="pref-column likes">
            <h4><i data-lucide="thumbs-up"></i> Likes</h4>
            <ul>${rel.likes.map(l => `<li>${l}</li>`).join('')}</ul>
           </div>`
        : '';

    const dislikesHtml = rel.dislikes && rel.dislikes.length > 0
        ? `<div class="pref-column dislikes">
            <h4><i data-lucide="thumbs-down"></i> Dislikes</h4>
            <ul>${rel.dislikes.map(d => `<li>${d}</li>`).join('')}</ul>
           </div>`
        : '';

    // Render history
    const historyHtml = rel.history && rel.history.length > 0
        ? `<div class="rel-history">
            <h4>Recent History</h4>
            ${rel.history.slice(0, 3).map(h => `
                <div class="history-entry">
                    <span class="history-change ${h.change >= 0 ? 'positive' : 'negative'}">
                        ${h.change >= 0 ? '+' : ''}${h.change.toLocaleString()}
                    </span>
                    <span class="history-reason">${h.reason}</span>
                </div>
            `).join('')}
           </div>`
        : '';

    // Render unlocks
    const unlocksHtml = rel.unlocks && rel.unlocks.length > 0
        ? `<div class="rel-unlocks">
            <h4>Reputation Rewards</h4>
            ${rel.unlocks.map(u => {
                const unlocked = rel.reputation >= u.threshold;
                return `
                    <div class="unlock-item ${unlocked ? 'unlocked' : 'locked'}">
                        <span class="unlock-tier">${getTier(u.threshold).name}:</span>
                        <span class="unlock-reward">${unlocked ? u.reward : '???'}</span>
                    </div>
                `;
            }).join('')}
           </div>`
        : '';

    // Portrait (use image if available, otherwise initial)
    const portraitContent = rel.portrait
        ? `<img src="${rel.portrait}" alt="${rel.name}">`
        : initial;

    return `
        <div class="rel-card ${permanentEnemyClass}">
            <div class="rel-card-header">
                <div class="rel-portrait">${portraitContent}</div>
                <div class="rel-info">
                    <div class="rel-name">${rel.name}${romanceIndicator}</div>
                    <div class="rel-type">${rel.type}</div>
                </div>
                ${permanentEnemyBadge || `<span class="rel-tier-badge tier-badge-${tier.class}">${tier.name}</span>`}
            </div>
            <div class="rel-card-body">
                <div class="rep-bar-container tier-${tier.class}">
                    <div class="rep-bar-header">
                        <span class="rep-tier-name">${tier.name}</span>
                        <span class="rep-values">${progress.current.toLocaleString()} / ${progress.needed.toLocaleString()}</span>
                    </div>
                    <div class="rep-bar-track">
                        <div class="rep-bar-fill" style="width: ${progress.percentage}%"></div>
                    </div>
                </div>

                ${rel.description ? `<p class="rel-description">"${rel.description}"</p>` : ''}

                ${(likesHtml || dislikesHtml) ? `
                    <div class="rel-preferences">
                        ${likesHtml}
                        ${dislikesHtml}
                    </div>
                ` : ''}

                ${historyHtml}
                ${unlocksHtml}
            </div>
        </div>
    `;
}

// Default data structure (fallback if JSON fails to load)
function getDefaultData() {
    return {
        jonas: { relationships: [] },
        sol: { relationships: [] },
        fursen: { relationships: [] }
    };
}
