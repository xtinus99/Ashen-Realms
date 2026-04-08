import state from './state.js';
import { refreshIcons } from './icons.js';
import { updateHash } from './hash-routing.js';
import { getThumbnailPath } from './images.js';
import { initSmoothScroll } from './smooth-scroll.js';

// Handler injection to avoid circular imports (showItem lives in article.js)
let handlers = {};
export function setNavigationHandlers(h) { handlers = h; }

// ===== NAVIGATION =====
export function buildNavigation() {
    const nav = document.getElementById('nav-categories');
    nav.innerHTML = '';

    for (const [categoryName, categoryData] of Object.entries(state.data)) {
        const category = document.createElement('div');
        category.className = 'nav-category';
        category.dataset.category = categoryName;

        const header = document.createElement('div');
        header.className = 'nav-category-header';
        header.innerHTML = `
            <div class="cat-name-area">
                <i data-lucide="${categoryData.info.icon || 'folder'}" class="cat-icon"></i>
                <span class="cat-name">${categoryName}</span>
                <span class="cat-count">${categoryData.items.length}</span>
            </div>
            <div class="cat-toggle">
                <i data-lucide="chevron-down" class="chevron"></i>
            </div>
        `;

        // Clicking the name area opens the category page
        const nameArea = header.querySelector('.cat-name-area');
        nameArea.addEventListener('click', (e) => {
            e.stopPropagation();
            openCategory(categoryName);
            // Also ensure the dropdown is open
            if (!category.classList.contains('open')) {
                document.querySelectorAll('.nav-category.open').forEach(c => {
                    if (c !== category) c.classList.remove('open');
                });
                category.classList.add('open');
            }
        });

        // Clicking the chevron toggles the dropdown without changing pages
        const toggleArea = header.querySelector('.cat-toggle');
        toggleArea.addEventListener('click', (e) => {
            e.stopPropagation();
            category.classList.toggle('open');
        });

        const items = document.createElement('div');
        items.className = 'nav-category-items';

        // Check for subcategories (e.g., Locations -> Crownfall -> items)
        if (categoryData.subcategories) {
            for (const [subName, subData] of Object.entries(categoryData.subcategories)) {
                const subSection = document.createElement('div');
                subSection.className = 'nav-subcategory';

                const subHeader = document.createElement('div');
                subHeader.className = 'nav-subcategory-header';

                // Choose icon based on subcategory name
                let subIcon = 'folder';
                if (subName.toLowerCase().includes('crownfall')) {
                    subIcon = 'castle';  // Capital city
                } else if (subName.toLowerCase().includes('vein')) {
                    subIcon = 'heart';
                }

                subHeader.innerHTML = `
                    <i data-lucide="${subIcon}" class="sub-icon"></i>
                    <span class="sub-name">${subName}</span>
                    <span class="sub-toggle"><i data-lucide="chevron-right" class="nav-item-chevron"></i></span>
                `;

                // Click on chevron toggles expand/collapse
                subHeader.querySelector('.sub-toggle').addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    subSection.classList.toggle('expanded');
                    refreshIcons();
                });

                // Click on name shows the parent location (first item in subcategory with matching name)
                subHeader.querySelector('.sub-name').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parentItem = subData.find(i => i.title === subName);
                    if (parentItem) {
                        handlers.showItem(categoryName, parentItem, null);
                    } else {
                        // Just expand if no parent item
                        subSection.classList.toggle('expanded');
                        refreshIcons();
                    }
                });

                const subItems = document.createElement('div');
                subItems.className = 'nav-subcategory-items';

                subData.forEach(item => {
                    const navItem = document.createElement('div');
                    navItem.className = 'nav-item nav-item-child';
                    navItem.dataset.id = item.id;
                    navItem.dataset.subcategory = subName;
                    navItem.textContent = item.title;
                    navItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        handlers.showItem(categoryName, item, navItem);
                    });
                    subItems.appendChild(navItem);
                });

                subSection.appendChild(subHeader);
                subSection.appendChild(subItems);
                items.appendChild(subSection);
            }
        }

        // Check if category has regions for grouping
        if (categoryData.info && categoryData.info.hasRegions && categoryData.info.regions) {
            const regionOrder = categoryData.info.regions;
            const itemsByRegion = {};

            // Initialize regions
            regionOrder.forEach(region => {
                itemsByRegion[region] = [];
            });

            // Group items by region
            categoryData.items.forEach(item => {
                const region = item.region || 'Other';
                if (!itemsByRegion[region]) {
                    itemsByRegion[region] = [];
                }
                itemsByRegion[region].push(item);
            });

            // Build region subsections
            regionOrder.forEach(region => {
                if (itemsByRegion[region] && itemsByRegion[region].length > 0) {
                    const regionSection = document.createElement('div');
                    regionSection.className = 'nav-subcategory nav-region';

                    const regionHeader = document.createElement('div');
                    regionHeader.className = 'nav-subcategory-header';

                    // Choose icon based on region name
                    let regionIcon = 'map-pin';
                    if (region === 'World') regionIcon = 'globe';
                    else if (region === 'Deceased') regionIcon = 'skull';
                    else if (region === 'Other') regionIcon = 'help-circle';
                    else if (region.includes('Clockwork')) regionIcon = 'clock';
                    else if (region.includes('Blooming')) regionIcon = 'flower-2';
                    else if (region.includes('Ancient')) regionIcon = 'landmark';

                    regionHeader.innerHTML = `
                        <i data-lucide="${regionIcon}" class="sub-icon"></i>
                        <span class="sub-name">${region}</span>
                        <span class="sub-count">${itemsByRegion[region].length}</span>
                        <span class="sub-toggle"><i data-lucide="chevron-right" class="nav-item-chevron"></i></span>
                    `;

                    // Click on header toggles expand/collapse
                    regionHeader.addEventListener('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        regionSection.classList.toggle('expanded');
                        refreshIcons();
                    });

                    const regionItems = document.createElement('div');
                    regionItems.className = 'nav-subcategory-items';

                    itemsByRegion[region].forEach(item => {
                        const navItem = document.createElement('div');
                        navItem.className = 'nav-item nav-item-child';
                        navItem.dataset.id = item.id;
                        navItem.dataset.region = region;
                        navItem.textContent = item.title;
                        navItem.addEventListener('click', (e) => {
                            e.stopPropagation();
                            handlers.showItem(categoryName, item, navItem);
                        });
                        regionItems.appendChild(navItem);
                    });

                    regionSection.appendChild(regionHeader);
                    regionSection.appendChild(regionItems);
                    items.appendChild(regionSection);
                }
            });
        } else {
            // Regular items (not in subcategories or regions)
            categoryData.items.forEach(item => {
                const navItem = document.createElement('div');
                navItem.className = 'nav-item';
                navItem.dataset.id = item.id;
                navItem.textContent = item.title;
                navItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handlers.showItem(categoryName, item, navItem);
                });
                items.appendChild(navItem);
            });
        }

        category.appendChild(header);
        category.appendChild(items);
        nav.appendChild(category);
    }

    refreshIcons();
}

// ===== CATEGORY OVERVIEW =====
export function openCategory(categoryName, skipHash = false, skipScrollToTop = false) {
    const categoryData = state.data[categoryName];
    if (!categoryData) return;

    state.currentItem = null;
    state.currentCategory = categoryName;

    // Re-enable Lenis smooth scroll (may have been destroyed for spell compendium)
    initSmoothScroll();

    // Disable full-width mode
    document.getElementById('content-body').classList.remove('full-width');

    // Update URL hash
    if (!skipHash) {
        updateHash(categoryName);
    }

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

    // Helper function to build a single item card
    function buildItemCard(item) {
        // Get a preview from the content (first paragraph or description)
        let preview = '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content;
        const firstP = tempDiv.querySelector('p');
        if (firstP) {
            preview = firstP.textContent.substring(0, 120);
            if (firstP.textContent.length > 120) preview += '...';
        }

        // Extract image from content for thumbnail
        let thumbnailHtml = '';
        const firstImg = tempDiv.querySelector('img');
        if (firstImg) {
            const originalSrc = firstImg.getAttribute('src');
            const thumbSrc = getThumbnailPath(originalSrc);
            thumbnailHtml = `<div class="category-item-thumb"><img src="${thumbSrc}" alt="${item.title}" loading="lazy" decoding="async"></div>`;
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
            <div class="category-item-card${thumbnailHtml ? ' has-thumb' : ''}" onclick="navigateToItemById('${categoryName}', '${item.id}')">
                ${thumbnailHtml}
                <div class="category-item-content">
                    <h3 class="category-item-title">${item.title}</h3>
                    ${metaText ? `<div class="category-item-meta">${metaText}</div>` : ''}
                    ${preview ? `<p class="category-item-preview">${preview}</p>` : ''}
                </div>
            </div>
        `;
    }

    // Build item cards - with region grouping if available
    let itemsHtml = '';
    if (categoryData.info.hasRegions) {
        // Group items by region
        const regionOrder = categoryData.info.regions || [];
        const itemsByRegion = {};

        categoryData.items.forEach(item => {
            const region = item.region || 'Other';
            if (!itemsByRegion[region]) itemsByRegion[region] = [];
            itemsByRegion[region].push(item);
        });

        // Build HTML with collapsible region dropdowns
        regionOrder.forEach((region, index) => {
            if (itemsByRegion[region] && itemsByRegion[region].length > 0) {
                const isOpen = index === 0 ? 'open' : ''; // First region open by default
                const itemCount = itemsByRegion[region].length;
                itemsHtml += `<div class="region-section ${isOpen}" data-region="${region}">`;
                itemsHtml += `<button class="region-header" onclick="toggleRegion(this)">
                    <i data-lucide="chevron-right" class="region-chevron"></i>
                    <i data-lucide="map-pin" class="region-icon"></i>
                    <span class="region-name">${region}</span>
                    <span class="region-count">${itemCount}</span>
                </button>`;
                itemsHtml += `<div class="region-items">`;
                itemsHtml += itemsByRegion[region].map(buildItemCard).join('');
                itemsHtml += `</div></div>`;
            }
        });

        // Any items not in regionOrder
        Object.keys(itemsByRegion).forEach(region => {
            if (!regionOrder.includes(region) && itemsByRegion[region].length > 0) {
                const itemCount = itemsByRegion[region].length;
                itemsHtml += `<div class="region-section" data-region="${region}">`;
                itemsHtml += `<button class="region-header" onclick="toggleRegion(this)">
                    <i data-lucide="chevron-right" class="region-chevron"></i>
                    <i data-lucide="map-pin" class="region-icon"></i>
                    <span class="region-name">${region}</span>
                    <span class="region-count">${itemCount}</span>
                </button>`;
                itemsHtml += `<div class="region-items">`;
                itemsHtml += itemsByRegion[region].map(buildItemCard).join('');
                itemsHtml += `</div></div>`;
            }
        });
    } else {
        // No regions - flat list
        itemsHtml = categoryData.items.map(buildItemCard).join('');
    }

    // Special timeline view for Sessions
    let timelineHtml = '';
    if (categoryName === 'Sessions') {
        timelineHtml = generateSessionTimeline(categoryData.items);
    }

    // Relationship map button for Party and NPCs
    let relationshipMapBtn = '';
    if (categoryName === 'Party' || categoryName === 'NPCs') {
        relationshipMapBtn = `
            <button class="relationship-map-btn" onclick="showRelationshipMap()">
                <i data-lucide="git-merge"></i>
                View Relationship Map
            </button>
        `;
    }

    document.getElementById('content-body').innerHTML = `
        <div class="category-overview">
            <header class="category-header">
                <i data-lucide="${categoryData.info.icon || 'folder'}" class="category-icon"></i>
                <div>
                    <h1 class="category-title">${categoryName}</h1>
                    <p class="category-description">${categoryData.info.description || ''}</p>
                </div>
                ${relationshipMapBtn}
            </header>
            ${timelineHtml}
            <div class="category-items-grid">
                ${itemsHtml}
            </div>
        </div>
    `;

    refreshIcons();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Scroll to top (unless restoring from hash with saved scroll position)
    if (!skipScrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===== SESSION TIMELINE =====
export function generateSessionTimeline(sessions) {
    // Extract key events from each session (look for major happenings)
    const timelineEvents = sessions.map((session, index) => {
        // Parse session number and title
        const match = session.title.match(/Session (\d+):\s*(.+)/);
        const sessionNum = match ? match[1] : (index + 1).toString().padStart(2, '0');
        const sessionTitle = match ? match[2] : session.title;

        // Extract key events from raw content (look for significant items)
        const keyEvents = [];
        const raw = session.raw || '';

        // Look for deaths
        if (raw.match(/\bdied\b|\bdeath\b|\bkilled\b|\bfell\b/i)) {
            const deathMatch = raw.match(/(\w+(?:\s+\w+)?)\s+(?:died|was killed|fell)/i);
            if (deathMatch) keyEvents.push({ type: 'death', text: deathMatch[0] });
        }

        // Look for major discoveries or acquisitions
        if (raw.match(/\bacquired\b|\bdiscovered\b|\bfound\b|\brevealed\b/i)) {
            keyEvents.push({ type: 'discovery', text: 'Major discovery' });
        }

        // Look for Sovereign encounters
        const sovereigns = ['Mareatha', 'Azerach', 'Talaris', 'Vor\'Kael', 'Imhuran', 'Kaedris', 'Karthayne', 'Ismara', 'Vortegas', 'Eredain', 'Ultharion', 'Nhalyra', 'Aral-Vyn'];
        for (const sov of sovereigns) {
            if (raw.includes(sov)) {
                keyEvents.push({ type: 'sovereign', text: sov });
                break;
            }
        }

        return {
            id: session.id,
            num: sessionNum,
            title: sessionTitle,
            events: keyEvents
        };
    });

    return `
        <div class="session-timeline">
            <h2><i data-lucide="git-branch"></i> Campaign Timeline</h2>
            <div class="timeline-container">
                <div class="timeline-line"></div>
                ${timelineEvents.map((event, i) => `
                    <div class="timeline-item ${i % 2 === 0 ? 'left' : 'right'}" onclick="navigateToItemById('Sessions', '${event.id}')">
                        <div class="timeline-marker">
                            <span class="timeline-num">${event.num}</span>
                        </div>
                        <div class="timeline-content">
                            <h3 class="timeline-title">${event.title}</h3>
                            ${event.events.length > 0 ? `
                                <div class="timeline-events">
                                    ${event.events.slice(0, 2).map(e => `
                                        <span class="timeline-event timeline-event-${e.type}">${e.text}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Navigate to a specific item by category and ID
export function navigateToItemById(categoryName, itemId) {
    const categoryData = state.data[categoryName];
    if (!categoryData) return;

    const item = categoryData.items.find(i => i.id === itemId);
    if (item) {
        const navItem = document.querySelector(`.nav-item[data-id="${itemId}"]`);
        handlers.showItem(categoryName, item, navItem);
    }
}

// Assign to window for onclick handlers in innerHTML
window.openCategory = openCategory;
window.navigateToItemById = navigateToItemById;
