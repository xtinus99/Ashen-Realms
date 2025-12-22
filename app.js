// Ashen Realms Player Compendium - App Logic

let data = {};
let currentItem = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    buildNavigation();
    setupSearch();
    setupMobileMenu();
    lucide.createIcons();
    showWelcome();
});

async function loadData() {
    try {
        const response = await fetch('data.json');
        data = await response.json();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

function buildNavigation() {
    const nav = document.getElementById('nav-categories');
    nav.innerHTML = '';

    for (const [categoryName, categoryData] of Object.entries(data)) {
        const category = document.createElement('div');
        category.className = 'nav-category';

        const header = document.createElement('div');
        header.className = 'nav-category-header';
        header.innerHTML = `
            <i data-lucide="${categoryData.info.icon || 'folder'}"></i>
            <span>${categoryName}</span>
            <i data-lucide="chevron-down" class="chevron"></i>
        `;
        header.addEventListener('click', () => {
            category.classList.toggle('open');
        });

        const items = document.createElement('div');
        items.className = 'nav-category-items';

        categoryData.items.forEach(item => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            navItem.textContent = item.title;
            navItem.addEventListener('click', () => showItem(categoryName, item));
            items.appendChild(navItem);
        });

        category.appendChild(header);
        category.appendChild(items);
        nav.appendChild(category);
    }

    lucide.createIcons();
}

function showWelcome() {
    document.getElementById('content-title').textContent = 'Welcome';

    // Calculate stats
    let totalItems = 0;
    let stats = {};
    for (const [name, cat] of Object.entries(data)) {
        stats[name] = cat.items.length;
        totalItems += cat.items.length;
    }

    const statsHtml = Object.entries(stats).map(([name, count]) => `
        <div class="stat-card">
            <div class="number">${count}</div>
            <div class="label">${name}</div>
        </div>
    `).join('');

    document.getElementById('content-body').innerHTML = `
        <div class="welcome-screen">
            <div class="welcome-icon">
                <i data-lucide="book-open"></i>
            </div>
            <h2>Welcome to the Ashen Realms</h2>
            <p>This is your compendium of campaign knowledge. Select a category from the sidebar to explore.</p>
            <blockquote>
                <em>"This is the era where the world begins to wake."</em>
            </blockquote>
            <div class="quick-stats">
                ${statsHtml}
            </div>
        </div>
    `;

    lucide.createIcons();
}

function showItem(categoryName, item) {
    currentItem = item;

    // Update active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    // Update header
    document.getElementById('content-title').textContent = item.title;

    // Build meta info
    let metaHtml = '';
    if (item.frontmatter) {
        const fm = item.frontmatter;
        if (fm.class) metaHtml += `<span><i data-lucide="sword"></i> ${fm.class}</span>`;
        if (fm.status) metaHtml += `<span><i data-lucide="activity"></i> ${fm.status}</span>`;
        if (fm.level) metaHtml += `<span><i data-lucide="trending-up"></i> Level ${fm.level}</span>`;
        if (fm.location) metaHtml += `<span><i data-lucide="map-pin"></i> ${fm.location}</span>`;
        if (fm.organ) metaHtml += `<span><i data-lucide="heart"></i> ${fm.organ}</span>`;
        if (fm.domain) metaHtml += `<span><i data-lucide="map"></i> ${fm.domain}</span>`;
    }

    // Update content
    document.getElementById('content-body').innerHTML = `
        <article class="article">
            <div class="article-header">
                <h1>${item.title}</h1>
                <div class="article-meta">
                    <span><i data-lucide="folder"></i> ${categoryName}</span>
                    ${metaHtml}
                </div>
            </div>
            <div class="article-body">
                ${item.content}
            </div>
        </article>
    `;

    // Setup wiki links
    document.querySelectorAll('.wiki-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target.toLowerCase();
            navigateToItem(target);
        });
    });

    lucide.createIcons();

    // Close mobile menu
    document.querySelector('.sidebar').classList.remove('open');
}

function navigateToItem(targetName) {
    const normalizedTarget = targetName.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const [categoryName, categoryData] of Object.entries(data)) {
        for (const item of categoryData.items) {
            const normalizedItem = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedItem.includes(normalizedTarget) || normalizedTarget.includes(normalizedItem)) {
                showItem(categoryName, item);
                return;
            }
        }
    }

    // Not found - show message
    alert(`"${targetName}" not found in the compendium. It may be DM-only information.`);
}

function setupSearch() {
    const searchInput = document.getElementById('search');
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(e.target.value);
        }, 300);
    });
}

function performSearch(query) {
    if (!query || query.length < 2) {
        showWelcome();
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
                    titleMatch: titleMatch
                });
            }
        }
    }

    // Sort: title matches first
    results.sort((a, b) => b.titleMatch - a.titleMatch);

    document.getElementById('content-title').textContent = `Search Results (${results.length})`;

    if (results.length === 0) {
        document.getElementById('content-body').innerHTML = `
            <div class="search-results">
                <p>No results found for "${query}"</p>
            </div>
        `;
        return;
    }

    const resultsHtml = results.slice(0, 20).map(r => `
        <div class="search-result" data-category="${r.category}" data-id="${r.item.id}">
            <h3>${r.item.title}</h3>
            <span class="category">${r.category}</span>
            <p class="preview">${r.item.raw.substring(0, 150)}...</p>
        </div>
    `).join('');

    document.getElementById('content-body').innerHTML = `
        <div class="search-results">
            ${resultsHtml}
        </div>
    `;

    // Add click handlers
    document.querySelectorAll('.search-result').forEach(el => {
        el.addEventListener('click', () => {
            const category = el.dataset.category;
            const id = el.dataset.id;
            const item = data[category].items.find(i => i.id === id);
            if (item) showItem(category, item);
        });
    });
}

function setupMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}
