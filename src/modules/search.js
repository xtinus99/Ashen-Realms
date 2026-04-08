import state from './state.js';
import { refreshIcons } from './icons.js';

// Handler injection to avoid circular imports (showItem lives in article.js)
let handlers = {};
export function setSearchHandlers(h) { handlers = h; }

// ===== SEARCH =====
let selectedSearchIndex = -1;

// Track active search filters
let activeSearchFilters = new Set();

export function setupSearch() {
    const searchInput = document.getElementById('search');
    const modalSearchInput = document.getElementById('modal-search');
    const searchModal = document.getElementById('search-modal');
    let debounceTimer;

    // Sidebar search - opens modal
    searchInput.addEventListener('focus', () => {
        openSearchModal();
    });

    // Modal search
    modalSearchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        selectedSearchIndex = -1;
        debounceTimer = setTimeout(() => {
            performModalSearch(e.target.value);
        }, 150);
    });

    // Keyboard navigation in search
    modalSearchInput.addEventListener('keydown', (e) => {
        const results = document.querySelectorAll('.search-result-item');
        const chips = document.querySelectorAll('.search-filter-chip');

        // Number keys 1-9 toggle filter chips
        if (e.key >= '1' && e.key <= '9') {
            const chipIndex = parseInt(e.key) - 1;
            if (chipIndex < chips.length) {
                e.preventDefault();
                chips[chipIndex].click();
            }
            return;
        }

        // 0 or ` to clear all filters
        if (e.key === '0' || e.key === '`') {
            e.preventDefault();
            clearAllFilters();
            return;
        }

        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSearchIndex = Math.min(selectedSearchIndex + 1, results.length - 1);
            updateSearchSelection(results);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSearchIndex = Math.max(selectedSearchIndex - 1, -1);
            updateSearchSelection(results);
        } else if (e.key === 'Enter' && selectedSearchIndex >= 0) {
            e.preventDefault();
            results[selectedSearchIndex].click();
        }
    });

    // Close modal on backdrop click
    document.querySelector('.search-modal-backdrop').addEventListener('click', closeSearchModal);
}

function updateSearchSelection(results) {
    results.forEach((el, i) => {
        if (i === selectedSearchIndex) {
            el.classList.add('selected');
            el.scrollIntoView({ block: 'nearest' });
        } else {
            el.classList.remove('selected');
        }
    });
}

function clearAllFilters() {
    activeSearchFilters.clear();
    document.querySelectorAll('.search-filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    // Re-run search
    const query = document.getElementById('modal-search').value;
    if (query.length >= 2) {
        performModalSearch(query);
    }
}

export function openSearchModal() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('modal-search');
    modal.classList.add('open');
    input.focus();
    input.value = '';
    activeSearchFilters.clear();

    // Build filter chips with number hints (none active = search all)
    const filtersContainer = document.getElementById('search-filters');
    const categories = Object.keys(state.data);
    filtersContainer.innerHTML = categories.map((cat, index) => {
        const icon = state.data[cat]?.info?.icon || 'folder';
        const keyHint = index < 9 ? `<kbd class="chip-key">${index + 1}</kbd>` : '';
        return `
            <button class="search-filter-chip" data-category="${cat}">
                ${keyHint}
                <i data-lucide="${icon}"></i>
                ${cat}
            </button>
        `;
    }).join('') + `<button class="search-filter-clear" title="Clear all filters (0)"><kbd class="chip-key">0</kbd> Clear</button>`;

    // Add click handlers for filters (click to filter to ONLY that category)
    filtersContainer.querySelectorAll('.search-filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const category = chip.dataset.category;
            if (activeSearchFilters.has(category)) {
                // Clicking active filter deselects it
                activeSearchFilters.delete(category);
                chip.classList.remove('active');
            } else {
                // Clicking inactive filter selects it (adds to filter)
                activeSearchFilters.add(category);
                chip.classList.add('active');
            }
            // Re-run search with new filters
            const query = document.getElementById('modal-search').value;
            if (query.length >= 2) {
                performModalSearch(query);
            }
        });
    });

    // Clear all button
    const clearBtn = filtersContainer.querySelector('.search-filter-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters);
    }

    document.getElementById('modal-search-results').innerHTML = `
        <div class="search-empty">Start typing to search the chronicles...</div>
    `;
    refreshIcons();
}

export function closeSearchModal() {
    document.getElementById('search-modal').classList.remove('open');
    document.getElementById('search').blur();
}

function performModalSearch(query) {
    const resultsContainer = document.getElementById('modal-search-results');

    if (!query || query.length < 2) {
        resultsContainer.innerHTML = `
            <div class="search-empty">Start typing to search the chronicles...</div>
        `;
        return;
    }

    const results = [];
    const queryLower = query.toLowerCase();
    for (const [categoryName, categoryData] of Object.entries(state.data)) {
        // Skip categories that aren't selected (if filters have been set up)
        if (activeSearchFilters.size > 0 && !activeSearchFilters.has(categoryName)) {
            continue;
        }

        // Search main items
        if (categoryData.items) {
            for (const item of categoryData.items) {
                const titleMatch = item.title.toLowerCase().includes(queryLower);
                const contentMatch = (item.raw || '').toLowerCase().includes(queryLower);

                if (titleMatch || contentMatch) {
                    results.push({
                        category: categoryName,
                        item: item,
                        score: titleMatch ? 2 : 1
                    });
                }
            }
        }

        // Search subcategories
        if (categoryData.subcategories) {
            for (const [subName, subItems] of Object.entries(categoryData.subcategories)) {
                for (const item of subItems) {
                    const titleMatch = item.title.toLowerCase().includes(queryLower);
                    const contentMatch = (item.raw || '').toLowerCase().includes(queryLower);

                    if (titleMatch || contentMatch) {
                        results.push({
                            category: categoryName,
                            item: item,
                            score: titleMatch ? 2 : 1
                        });
                    }
                }
            }
        }
    }

    // Sort by relevance
    results.sort((a, b) => b.score - a.score);
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-empty">No chronicles found for "${query}"</div>
        `;
        document.getElementById('modal-search').focus();
        return;
    }

    resultsContainer.innerHTML = results.slice(0, 15).map(r => `
        <div class="search-result-item" data-category="${r.category}" data-id="${r.item.id}">
            <div class="search-result-title">${highlightMatch(r.item.title, query)}</div>
            <div class="search-result-category">${r.category}</div>
            <div class="search-result-preview">${getPreview(r.item.raw || '', query)}</div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
            const category = el.dataset.category;
            const id = el.dataset.id;

            // Search in main items first
            let item = state.data[category].items?.find(i => i.id === id);

            // If not found, search in subcategories
            if (!item && state.data[category].subcategories) {
                for (const subItems of Object.values(state.data[category].subcategories)) {
                    item = subItems.find(i => i.id === id);
                    if (item) break;
                }
            }

            if (item) {
                closeSearchModal();
                const navItem = document.querySelector(`.nav-item[data-id="${id}"]`);
                handlers.showItem(category, item, navItem);
            }
        });
    });

    // Ensure focus stays on input after DOM update
    document.getElementById('modal-search').focus();
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark style="background: var(--blood); color: var(--parchment); padding: 0 2px; border-radius: 2px;">$1</mark>');
}

function getPreview(text, query) {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);

    if (index === -1) {
        return text.substring(0, 120) + '...';
    }

    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + query.length + 80);
    let preview = text.substring(start, end);

    if (start > 0) preview = '...' + preview;
    if (end < text.length) preview = preview + '...';

    return highlightMatch(preview, query);
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
