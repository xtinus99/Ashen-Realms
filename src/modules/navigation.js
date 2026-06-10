import state from './state.js';
import { refreshIcons } from './icons.js';
import { updateHash } from './hash-routing.js';
import { getThumbnailPath } from './images.js';
import { initSmoothScroll } from './smooth-scroll.js';

// Handler injection to avoid circular imports (showItem lives in article.js)
let handlers = {};
export function setNavigationHandlers(h) { handlers = h; }

// Build the inner markup for a nav entry: small portrait (or monogram) + label.
// Uses a regex (not DOM parse) so we never kick off full-size image loads for
// every item at startup — only the small thumbnails actually render.
function navEntryHTML(item) {
    const m = (item.content || '').match(/<img[^>]+src="([^"]+)"/i);
    let portrait;
    if (m) {
        portrait = `<span class="nav-item-portrait"><img src="${getThumbnailPath(m[1])}" alt="" loading="lazy" decoding="async"></span>`;
    } else {
        const glyph = item.unknownPortrait ? '?' : (item.title || '?').charAt(0);
        portrait = `<span class="nav-item-portrait nav-item-monogram">${glyph}</span>`;
    }
    return `${portrait}<span class="nav-item-label">${item.title}</span>`;
}

// Partition a region's items into named subgroups (e.g. Houses) + loose items,
// preserving first-seen order. Items opt in via an item.subgroup string.
function groupBySubgroup(items) {
    const groups = new Map();
    const loose = [];
    items.forEach(it => {
        if (it.subgroup) {
            if (!groups.has(it.subgroup)) groups.set(it.subgroup, []);
            groups.get(it.subgroup).push(it);
        } else {
            loose.push(it);
        }
    });
    return { groups, loose };
}

// Build a single sidebar child nav-item (portrait + label + click-through).
function buildNavChild(categoryName, item) {
    const navItem = document.createElement('div');
    navItem.className = 'nav-item nav-item-child has-portrait';
    navItem.dataset.id = item.id;
    navItem.innerHTML = navEntryHTML(item);
    wireToken(navItem, item);
    navItem.addEventListener('click', (e) => {
        e.stopPropagation();
        handlers.showItem(categoryName, item, navItem);
    });
    return navItem;
}

// Pop the full house crest into a lightbox when the small nav sigil is clicked
// (the rest of the header bar still toggles the dropdown).
function openCrestLightbox(src, name) {
    const overlay = document.createElement('div');
    overlay.className = 'crest-lightbox';
    overlay.innerHTML = `<div class="crest-lightbox-inner">
        <img src="${src}" alt="${name}">
        <div class="crest-lightbox-name">${name}</div>
    </div>`;
    const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 240); };
    overlay.addEventListener('click', close);
    const esc = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
}
window.openCrestLightbox = openCrestLightbox;

// Pop the full portrait into the lightbox when the small nav token is clicked
// (the rest of the nav-item still navigates to the entry). Mirrors the crest behaviour.
function wireToken(navItem, item) {
    const m = (item.content || '').match(/<img[^>]+src="([^"]+)"/i);
    if (!m) return; // monogram — nothing to enlarge
    const token = navItem.querySelector('.nav-item-portrait');
    if (!token) return;
    token.style.cursor = 'zoom-in';
    token.addEventListener('click', (ev) => {
        ev.stopPropagation();
        openCrestLightbox(m[1], item.title);
    });
}

// Icon for a region/section header, chosen by region name
function regionIcon(region) {
    const r = (region || '').toLowerCase();
    if (r === 'world') return 'globe';
    if (r === 'deceased') return 'skull';
    if (r === 'crownfall') return 'castle';
    if (r.includes('clockwork')) return 'clock';
    if (r.includes('blooming')) return 'flower-2';
    if (r.includes('ancient')) return 'landmark';
    if (r === 'other') return 'help-circle';
    if (r.includes('vein')) return 'heart';
    return 'map-pin';
}

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
        `;

        // The whole header bar toggles the category open/closed (no separate
        // chevron — matches the house headers). Opening also shows the category
        // page; accordion-closes any other open category.
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            if (category.classList.contains('open')) {
                category.classList.remove('open');
            } else {
                document.querySelectorAll('.nav-category.open').forEach(c => {
                    if (c !== category) c.classList.remove('open');
                });
                category.classList.add('open');
                openCategory(categoryName);
            }
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
                    navItem.className = 'nav-item nav-item-child has-portrait';
                    navItem.dataset.id = item.id;
                    navItem.dataset.subcategory = subName;
                    navItem.innerHTML = navEntryHTML(item);
                    wireToken(navItem, item);
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

                    const { groups: sgGroups, loose: sgLoose } = groupBySubgroup(itemsByRegion[region]);
                    const sgIcons = (categoryData.info && categoryData.info.subgroupIcons) || {};
                    // Named subgroups (e.g. Houses) sit at the TOP of the region as
                    // their own collapsible dropdowns
                    sgGroups.forEach((sgItems, sgName) => {
                        const sg = document.createElement('div');
                        sg.className = 'nav-subgroup';
                        const sgHeader = document.createElement('div');
                        sgHeader.className = 'nav-subgroup-header';
                        const sigil = sgIcons[sgName];
                        const iconHTML = sigil
                            ? `<img class="sub-sigil" src="${sigil}" alt="" loading="lazy" decoding="async">`
                            : `<i data-lucide="users" class="sub-icon"></i>`;
                        sgHeader.innerHTML = `
                            ${iconHTML}
                            <span class="sub-name">${sgName}</span>
                            <span class="sub-count">${sgItems.length}</span>
                        `;
                        sgHeader.addEventListener('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            sg.classList.toggle('expanded');
                            refreshIcons();
                        });
                        const crestImg = sgHeader.querySelector('.sub-sigil');
                        if (crestImg && sigil) {
                            crestImg.style.cursor = 'zoom-in';
                            crestImg.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                openCrestLightbox(sigil, sgName);
                            });
                        }
                        const sgItemsEl = document.createElement('div');
                        sgItemsEl.className = 'nav-subgroup-items';
                        sgItems.forEach(item => sgItemsEl.appendChild(buildNavChild(categoryName, item)));
                        sg.appendChild(sgHeader);
                        sg.appendChild(sgItemsEl);
                        regionItems.appendChild(sg);
                    });
                    // Loose (unaffiliated) items follow, directly under the region
                    sgLoose.forEach(item => regionItems.appendChild(buildNavChild(categoryName, item)));

                    regionSection.appendChild(regionHeader);
                    regionSection.appendChild(regionItems);
                    items.appendChild(regionSection);
                }
            });
        } else {
            // Regular items (not in subcategories or regions)
            categoryData.items.forEach(item => {
                const navItem = document.createElement('div');
                navItem.className = 'nav-item has-portrait';
                navItem.dataset.id = item.id;
                navItem.innerHTML = navEntryHTML(item);
                wireToken(navItem, item);
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

    // Helper: build a portrait-forward roster card
    function buildItemCard(item) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = item.content;

        const firstImg = tempDiv.querySelector('img');
        let portraitHtml;
        if (firstImg) {
            const thumbSrc = getThumbnailPath(firstImg.getAttribute('src'));
            portraitHtml = `<div class="roster-card-portrait"><img src="${thumbSrc}" alt="${item.title}" loading="lazy" decoding="async"></div>`;
        } else {
            portraitHtml = `<div class="roster-card-portrait roster-card-noimg"><span>${item.unknownPortrait ? '?' : (item.title || '?').charAt(0)}</span></div>`;
        }

        const fm = item.frontmatter || {};
        const role = fm.role || fm.status || fm.domain || fm.type || fm.organ || '';
        const loc = fm.location || '';
        const tag = fm.allegiance || '';
        const meta = [role, loc].filter(Boolean).join(' &middot; ');

        return `
            <div class="roster-card" data-name="${(item.title || '').toLowerCase()}" onclick="navigateToItemById('${categoryName}', '${item.id}')">
                ${portraitHtml}
                <div class="roster-card-body">
                    <h3 class="roster-card-name">${item.title}</h3>
                    ${meta ? `<div class="roster-card-meta">${meta}</div>` : ''}
                    ${tag ? `<span class="roster-card-tag">${tag}</span>` : ''}
                </div>
            </div>
        `;
    }

    // Render a region's contents: loose item cards first, then collapsible
    // subgroup (e.g. House) sections that reuse the region toggle machinery.
    const sgIcons = (categoryData.info && categoryData.info.subgroupIcons) || {};
    function renderRegionInner(items) {
        const { groups, loose } = groupBySubgroup(items);
        let html = '';
        // Subgroup (House) dropdowns sit at the TOP of the region
        groups.forEach((sgItems, sgName) => {
            const sigil = sgIcons[sgName];
            const iconHTML = sigil
                ? `<img class="subgroup-sigil" src="${sigil}" alt="" loading="lazy" decoding="async" style="cursor:zoom-in" onclick="event.stopPropagation(); openCrestLightbox('${sigil.replace(/'/g, "\\'")}', '${sgName.replace(/'/g, "\\'")}')">`
                : `<i data-lucide="users" class="region-icon"></i>`;
            html += `<div class="region-section subgroup-section" data-subgroup="${sgName}">
                <button class="region-header subgroup-header" onclick="toggleRegion(this)">
                    ${iconHTML}
                    <span class="region-name">${sgName}</span>
                    <span class="region-count">${sgItems.length}</span>
                </button>
                <div class="region-items">${sgItems.map(buildItemCard).join('')}</div>
            </div>`;
        });
        html += loose.map(buildItemCard).join('');
        return html;
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
                    <i data-lucide="${regionIcon(region)}" class="region-icon"></i>
                    <span class="region-name">${region}</span>
                    <span class="region-count">${itemCount}</span>
                </button>`;
                itemsHtml += `<div class="region-items">`;
                itemsHtml += renderRegionInner(itemsByRegion[region]);
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
                    <i data-lucide="${regionIcon(region)}" class="region-icon"></i>
                    <span class="region-name">${region}</span>
                    <span class="region-count">${itemCount}</span>
                </button>`;
                itemsHtml += `<div class="region-items">`;
                itemsHtml += renderRegionInner(itemsByRegion[region]);
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

    const filterHtml = categoryName !== 'Sessions'
        ? `<div class="category-filter"><i data-lucide="search"></i><input type="text" id="category-filter-input" placeholder="Filter ${categoryName}..." autocomplete="off"></div>`
        : '';

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
            ${filterHtml}
            <div class="category-items-grid">
                ${itemsHtml}
            </div>
        </div>
    `;

    refreshIcons();

    // Filter-as-you-type within the category
    const filterInput = document.getElementById('category-filter-input');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            const q = e.target.value.trim().toLowerCase();
            document.querySelectorAll('.roster-card').forEach((card) => {
                card.style.display = !q || card.dataset.name.includes(q) ? '' : 'none';
            });
            document.querySelectorAll('.region-section').forEach((sec) => {
                let vis = 0;
                sec.querySelectorAll('.roster-card').forEach((c) => { if (c.style.display !== 'none') vis++; });
                sec.style.display = q && vis === 0 ? 'none' : '';
                if (q && vis > 0) sec.classList.add('open');
            });
        });
    }

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
