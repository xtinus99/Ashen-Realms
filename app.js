// =====================================================
// THE ASHEN REALMS - Interactive Compendium
// =====================================================

let data = {};
let currentItem = null;
let currentCategory = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    buildNavigation();
    setupSearch();
    setupMobileMenu();
    setupKeyboardShortcuts();
    setupLogoClick();
    lucide.createIcons();
    showWelcome();
});

function setupLogoClick() {
    const logo = document.querySelector('.logo-container');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            showWelcome();
            // Close mobile sidebar if open
            document.getElementById('sidebar').classList.remove('open');
        });
    }
}

async function loadData() {
    try {
        const response = await fetch('data.json');
        data = await response.json();
    } catch (error) {
        console.error('Failed to load compendium data:', error);
        document.getElementById('content-body').innerHTML = `
            <div class="welcome-container">
                <h2 class="welcome-title">Failed to Load</h2>
                <p class="welcome-subtitle">The chronicles could not be retrieved. Please refresh the page.</p>
            </div>
        `;
    }
}

// ===== NAVIGATION =====
function buildNavigation() {
    const nav = document.getElementById('nav-categories');
    nav.innerHTML = '';

    for (const [categoryName, categoryData] of Object.entries(data)) {
        const category = document.createElement('div');
        category.className = 'nav-category';
        category.dataset.category = categoryName;

        const header = document.createElement('div');
        header.className = 'nav-category-header';
        header.innerHTML = `
            <i data-lucide="${categoryData.info.icon || 'folder'}" class="cat-icon"></i>
            <span class="cat-name">${categoryName}</span>
            <span class="cat-count">${categoryData.items.length}</span>
            <i data-lucide="chevron-down" class="chevron"></i>
        `;
        header.addEventListener('click', () => {
            // Close other categories
            document.querySelectorAll('.nav-category.open').forEach(c => {
                if (c !== category) c.classList.remove('open');
            });
            category.classList.toggle('open');
        });

        const items = document.createElement('div');
        items.className = 'nav-category-items';

        categoryData.items.forEach(item => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.dataset.id = item.id;
            navItem.textContent = item.title;
            navItem.addEventListener('click', (e) => {
                e.stopPropagation();
                showItem(categoryName, item, navItem);
            });
            items.appendChild(navItem);
        });

        category.appendChild(header);
        category.appendChild(items);
        nav.appendChild(category);
    }

    lucide.createIcons();
}

// ===== WELCOME SCREEN =====
function showWelcome() {
    currentItem = null;
    currentCategory = null;

    // Update breadcrumb
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-home">Compendium</span>
    `;

    // Clear active states
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));

    // Calculate stats
    let stats = {};
    for (const [name, cat] of Object.entries(data)) {
        stats[name] = cat.items.length;
    }

    const statsHtml = Object.entries(stats).map(([name, count]) => `
        <div class="stat-card" data-category="${name}" onclick="openCategory('${name}')" style="cursor: pointer;">
            <div class="stat-number">${count}</div>
            <div class="stat-label">${name}</div>
        </div>
    `).join('');

    document.getElementById('content-body').innerHTML = `
        <div class="welcome-container">
            <svg class="welcome-sigil" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="1" opacity="0.3"/>
                <circle cx="50" cy="50" r="35" stroke="currentColor" stroke-width="1" opacity="0.4"/>
                <circle cx="50" cy="50" r="25" stroke="currentColor" stroke-width="1" opacity="0.5"/>
                <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.9"/>
                <path d="M50 5 L50 15 M50 85 L50 95 M5 50 L15 50 M85 50 L95 50" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
                <path d="M50 20 L50 30 M50 70 L50 80 M20 50 L30 50 M70 50 L80 50" stroke="currentColor" stroke-width="1" opacity="0.5"/>
                <path d="M22 22 L30 30 M70 70 L78 78 M22 78 L30 70 M70 30 L78 22" stroke="currentColor" stroke-width="1" opacity="0.3"/>
            </svg>

            <h1 class="welcome-title">The Ashen Realms</h1>
            <p class="welcome-subtitle">
                A chronicle of thirteen thrones built on the corpse of a murdered god,
                and those who dare to walk between them.
            </p>

            <div class="welcome-quote">
                <p>The Maker is dead. The Sovereigns reign. And somewhere in the ash and bone,
                something ancient begins to stir.</p>
            </div>

            <div class="welcome-stats">
                ${statsHtml}
            </div>
        </div>
    `;

    lucide.createIcons();
}

// ===== CATEGORY OVERVIEW =====
function openCategory(categoryName) {
    const categoryData = data[categoryName];
    if (!categoryData) return;

    currentItem = null;
    currentCategory = categoryName;

    // Open the sidebar category
    document.querySelectorAll('.nav-category.open').forEach(c => c.classList.remove('open'));
    const sidebarCategory = document.querySelector(`.nav-category[data-category="${categoryName}"]`);
    if (sidebarCategory) {
        sidebarCategory.classList.add('open');
    }

    // Clear active nav items
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));

    // Update breadcrumb
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-home" style="cursor:pointer" onclick="showWelcome()">Compendium</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${categoryName}</span>
    `;

    // Build item cards
    const itemsHtml = categoryData.items.map(item => {
        // Get a preview from the content (first paragraph or description)
        let preview = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content;
        const firstP = tempDiv.querySelector('p');
        if (firstP) {
            preview = firstP.textContent.substring(0, 120);
            if (firstP.textContent.length > 120) preview += '...';
        }

        // Get meta info
        let metaText = '';
        if (item.frontmatter) {
            const fm = item.frontmatter;
            if (fm.role) metaText = fm.role;
            else if (fm.status) metaText = fm.status;
            else if (fm.domain) metaText = fm.domain;
            else if (fm.type) metaText = fm.type;
            else if (fm.organ) metaText = fm.organ;
        }

        return `
            <div class="category-item-card" onclick="navigateToItemById('${categoryName}', '${item.id}')">
                <h3 class="category-item-title">${item.title}</h3>
                ${metaText ? `<div class="category-item-meta">${metaText}</div>` : ''}
                ${preview ? `<p class="category-item-preview">${preview}</p>` : ''}
            </div>
        `;
    }).join('');

    document.getElementById('content-body').innerHTML = `
        <div class="category-overview">
            <header class="category-header">
                <i data-lucide="${categoryData.info.icon || 'folder'}" class="category-icon"></i>
                <div>
                    <h1 class="category-title">${categoryName}</h1>
                    <p class="category-description">${categoryData.info.description || ''}</p>
                </div>
            </header>
            <div class="category-items-grid">
                ${itemsHtml}
            </div>
        </div>
    `;

    lucide.createIcons();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToItemById(categoryName, itemId) {
    const categoryData = data[categoryName];
    if (!categoryData) return;

    const item = categoryData.items.find(i => i.id === itemId);
    if (item) {
        const navItem = document.querySelector(`.nav-item[data-id="${itemId}"]`);
        showItem(categoryName, item, navItem);
    }
}

// ===== ARTICLE DISPLAY =====
function showItem(categoryName, item, navElement = null) {
    currentItem = item;
    currentCategory = categoryName;

    // Update active state in navigation
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
    if (navElement) {
        navElement.classList.add('active');
    }

    // Open the category if not already open
    const category = document.querySelector(`.nav-category[data-category="${categoryName}"]`);
    if (category && !category.classList.contains('open')) {
        category.classList.add('open');
    }

    // Update breadcrumb
    const categoryInfo = data[categoryName]?.info || {};
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-home" style="cursor:pointer" onclick="showWelcome()">Compendium</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${categoryName}</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${item.title}</span>
    `;

    // Build meta tags
    let metaTags = [];
    if (item.frontmatter) {
        const fm = item.frontmatter;
        if (fm.race) metaTags.push({ icon: 'user', text: fm.race });
        if (fm.class) metaTags.push({ icon: 'sword', text: fm.class });
        if (fm.role) metaTags.push({ icon: 'shield', text: fm.role });
        if (fm.status) metaTags.push({ icon: 'activity', text: fm.status });
        if (fm.organ) metaTags.push({ icon: 'heart', text: fm.organ });
        if (fm.domain) metaTags.push({ icon: 'map', text: fm.domain });
        if (fm.allegiance) metaTags.push({ icon: 'flag', text: fm.allegiance });
    }

    const metaHtml = metaTags.map(tag => `
        <span class="meta-tag">
            <i data-lucide="${tag.icon}"></i>
            ${tag.text}
        </span>
    `).join('');

    // Render article
    document.getElementById('content-body').innerHTML = `
        <article class="article">
            <header class="article-header">
                <div class="article-category">
                    <i data-lucide="${categoryInfo.icon || 'file'}"></i>
                    ${categoryName}
                </div>
                <h1 class="article-title">${item.title}</h1>
                ${metaTags.length > 0 ? `<div class="article-meta">${metaHtml}</div>` : ''}
            </header>
            <div class="article-body">
                ${item.content}
            </div>
        </article>
    `;

    // Setup internal wiki links
    document.querySelectorAll('.wiki-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            navigateToItem(target);
        });
    });

    lucide.createIcons();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateToItem(targetName) {
    const normalizedTarget = targetName.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const [categoryName, categoryData] of Object.entries(data)) {
        for (const item of categoryData.items) {
            const normalizedItem = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedItem.includes(normalizedTarget) || normalizedTarget.includes(normalizedItem)) {
                // Find the nav element
                const navItem = document.querySelector(`.nav-item[data-id="${item.id}"]`);
                showItem(categoryName, item, navItem);
                return;
            }
        }
    }

    // Not found - show subtle notification
    showNotification(`"${targetName}" is not in the compendium — it may be hidden knowledge.`);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background: var(--stone);
        color: var(--bone);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--border-normal);
        font-family: var(--font-ui);
        font-size: 0.9rem;
        z-index: 1000;
        animation: fadeInUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOutDown 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== SEARCH =====
function setupSearch() {
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
        debounceTimer = setTimeout(() => {
            performModalSearch(e.target.value);
        }, 150);
    });

    // Close modal on backdrop click
    document.querySelector('.search-modal-backdrop').addEventListener('click', closeSearchModal);
}

function openSearchModal() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('modal-search');
    modal.classList.add('open');
    input.focus();
    input.value = '';
    document.getElementById('modal-search-results').innerHTML = `
        <div class="search-empty">Start typing to search the chronicles...</div>
    `;
    lucide.createIcons();
}

function closeSearchModal() {
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

    for (const [categoryName, categoryData] of Object.entries(data)) {
        for (const item of categoryData.items) {
            const titleMatch = item.title.toLowerCase().includes(queryLower);
            const contentMatch = item.raw.toLowerCase().includes(queryLower);

            if (titleMatch || contentMatch) {
                results.push({
                    category: categoryName,
                    item: item,
                    score: titleMatch ? 2 : 1
                });
            }
        }
    }

    // Sort by relevance
    results.sort((a, b) => b.score - a.score);

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="search-empty">No chronicles found for "${query}"</div>
        `;
        return;
    }

    resultsContainer.innerHTML = results.slice(0, 15).map(r => `
        <div class="search-result-item" data-category="${r.category}" data-id="${r.item.id}">
            <div class="search-result-title">${highlightMatch(r.item.title, query)}</div>
            <div class="search-result-category">${r.category}</div>
            <div class="search-result-preview">${getPreview(r.item.raw, query)}</div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
            const category = el.dataset.category;
            const id = el.dataset.id;
            const item = data[category].items.find(i => i.id === id);
            if (item) {
                closeSearchModal();
                const navItem = document.querySelector(`.nav-item[data-id="${id}"]`);
                showItem(category, item, navItem);
            }
        });
    });
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
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

// ===== KEYBOARD SHORTCUTS =====
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }

        // Escape to close modal
        if (e.key === 'Escape') {
            closeSearchModal();
        }
    });
}

// ===== MOBILE MENU =====
function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// ===== ANIMATIONS (CSS will handle these) =====
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes fadeOutDown {
        from { opacity: 1; transform: translate(-50%, 0); }
        to { opacity: 0; transform: translate(-50%, 20px); }
    }
`;
document.head.appendChild(style);
