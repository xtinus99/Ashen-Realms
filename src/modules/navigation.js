import state from './state.js';
import { refreshIcons } from './icons.js';
import { updateHash } from './hash-routing.js';
import { getThumbnailPath } from './images.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { setPageAudioTrack } from './audio.js';

// Handler injection to avoid circular imports (showItem lives in article.js)
let handlers = {};
export function setNavigationHandlers(h) { handlers = h; }

// Build the inner markup for a nav entry: small portrait (or monogram) + label.
// Uses a regex (not DOM parse) so we never kick off full-size image loads for
// every item at startup — only the small thumbnails actually render.
function navEntryHTML(item) {
    let portrait;
    if (item.image) {
        portrait = `<span class="nav-item-portrait"><img data-src="${getThumbnailPath(item.image)}" alt="" decoding="async"></span>`;
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
    const navItem = document.createElement('button');
    navItem.type = 'button';
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
    const m = item.image ? [null, item.image] : null;
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
function hydrateNavImages(category) {
    category?.querySelectorAll('img[data-src]').forEach((img) => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
    });
}

function setNavCategoryOpen(category, isOpen) {
    if (!category) return;
    category.classList.toggle('open', isOpen);
    const toggle = category.querySelector('.cat-toggle');
    const name = category.dataset.category || 'category';
    if (toggle) {
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', `${isOpen ? 'Collapse' : 'Expand'} ${name}`);
    }
}

function wireCardImageFallbacks(container) {
    container?.querySelectorAll('.roster-card-portrait img[data-fallback-src]').forEach((img) => {
        img.addEventListener('error', () => {
            const fallbackSrc = img.dataset.fallbackSrc;
            if (fallbackSrc && img.getAttribute('src') !== fallbackSrc) {
                img.src = fallbackSrc;
                return;
            }

            const portrait = img.closest('.roster-card-portrait');
            const glyph = img.dataset.fallbackGlyph || '?';
            img.remove();
            if (portrait) {
                portrait.classList.add('roster-card-noimg');
                portrait.innerHTML = `<span>${glyph}</span>`;
            }
        });
    });
}

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
        const itemsId = `nav-category-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-items`;
        const categoryHref = `#${encodeURIComponent(categoryName)}`;
        header.innerHTML = `
            <a class="cat-name-area" href="${categoryHref}" aria-label="Open ${categoryName} overview">
                <i data-lucide="${categoryData.info.icon || 'folder'}" class="cat-icon"></i>
                <span class="cat-name">${categoryName}</span>
                <span class="cat-count">${categoryData.items.length}</span>
            </a>
            <button type="button" class="cat-toggle" aria-expanded="false" aria-controls="${itemsId}" aria-label="Expand ${categoryName}">
                <i data-lucide="chevron-down" class="chevron"></i>
            </button>
        `;

        // The label opens the overview and remains a real link for middle-click.
        // The adjacent chevron controls only the sidebar dropdown.
        header.querySelector('.cat-name-area').addEventListener('click', (e) => {
            if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            e.stopPropagation();
            openCategory(categoryName);
        });

        header.querySelector('.cat-toggle').addEventListener('click', (e) => {
            e.stopPropagation();
            const shouldOpen = !category.classList.contains('open');
            if (shouldOpen) {
                document.querySelectorAll('.nav-category.open').forEach(c => {
                    if (c !== category) setNavCategoryOpen(c, false);
                });
                hydrateNavImages(category);
            }
            setNavCategoryOpen(category, shouldOpen);
            refreshIcons();
        });

        const items = document.createElement('div');
        items.className = 'nav-category-items';
        items.id = itemsId;

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
                    <button type="button" class="sub-name">${subName}</button>
                    <button type="button" class="sub-toggle" aria-label="Expand ${subName}"><i data-lucide="chevron-right" class="nav-item-chevron"></i></button>
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
                    const navItem = document.createElement('button');
                    navItem.type = 'button';
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

                    const regionHeader = document.createElement('button');
                    regionHeader.type = 'button';
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
                        const sgHeader = document.createElement('button');
                        sgHeader.type = 'button';
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
                const navItem = document.createElement('button');
                navItem.type = 'button';
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
    setPageAudioTrack();

    // Re-enable Lenis smooth scroll (may have been destroyed for spell compendium)
    initSmoothScroll();

    // Disable full-width mode
    document.getElementById('content-body').classList.remove('full-width');

    // Update URL hash
    if (!skipHash) {
        updateHash(categoryName);
    }

    // Open the sidebar category
    document.querySelectorAll('.nav-category.open').forEach(c => setNavCategoryOpen(c, false));
    const sidebarCategory = document.querySelector(`.nav-category[data-category="${categoryName}"]`);
    if (sidebarCategory) {
        setNavCategoryOpen(sidebarCategory, true);
        hydrateNavImages(sidebarCategory);
    }

    // Clear active nav items
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));

    // Update breadcrumb
    document.getElementById('breadcrumb').innerHTML = `
        <button type="button" class="breadcrumb-home" onclick="showWelcome()">Compendium</button>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${categoryName}</span>
    `;

    // Helper: build a portrait-forward roster card
    function buildItemCard(item) {
        let portraitHtml;
        if (item.image) {
            const thumbSrc = getThumbnailPath(item.image);
            const glyph = item.unknownPortrait ? '?' : (item.title || '?').charAt(0);
            portraitHtml = `<div class="roster-card-portrait"><img src="${thumbSrc}" data-fallback-src="${item.image}" data-fallback-glyph="${glyph}" alt="${item.title}" loading="lazy" decoding="async"></div>`;
        } else {
            portraitHtml = `<div class="roster-card-portrait roster-card-noimg"><span>${item.unknownPortrait ? '?' : (item.title || '?').charAt(0)}</span></div>`;
        }

        const fm = item.frontmatter || {};
        const role = fm.role || fm.domain || fm.type || fm.organ || '';
        const loc = fm.location || fm.parent || '';
        const status = fm.status || '';
        const tag = fm.allegiance || fm.faction || '';
        const meta = [role, loc, status].filter(Boolean).join(' &middot; ');

        return `
            <button type="button" class="roster-card" data-name="${(item.title || '').toLowerCase()}" onclick="navigateToItemById('${categoryName}', '${item.id}')">
                ${portraitHtml}
                <div class="roster-card-body">
                    <h3 class="roster-card-name">${item.title}</h3>
                    ${meta ? `<div class="roster-card-meta">${meta}</div>` : ''}
                    ${tag ? `<span class="roster-card-tag">${tag}</span>` : ''}
                </div>
            </button>
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
        ? `<div class="category-filter"><i data-lucide="search"></i><label class="sr-only" for="category-filter-input">Filter ${categoryName}</label><input type="text" id="category-filter-input" placeholder="Filter ${categoryName}..." autocomplete="off"></div>`
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

    wireCardImageFallbacks(document.getElementById('content-body'));
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

        const keyEvents = session.timelineEvents || [];

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
                    <button type="button" class="timeline-item ${i % 2 === 0 ? 'left' : 'right'}" onclick="navigateToItemById('Sessions', '${event.id}')">
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
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

// Navigate to a specific item by category and ID
export function navigateToItemById(categoryName, itemId) {
    const categoryData = state.data[categoryName];
    if (!categoryData) return;

    let item = categoryData.items.find(i => i.id === itemId);
    if (!item && categoryData.subcategories) {
        for (const items of Object.values(categoryData.subcategories)) {
            item = items.find((candidate) => candidate.id === itemId);
            if (item) break;
        }
    }
    if (item) {
        const navItem = document.querySelector(`.nav-item[data-id="${itemId}"]`);
        handlers.showItem(categoryName, item, navItem);
    }
}

// Assign to window for onclick handlers in innerHTML
window.openCategory = openCategory;
window.navigateToItemById = navigateToItemById;
