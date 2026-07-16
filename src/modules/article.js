import state from './state.js';
import { refreshIcons } from './icons.js';
import { updateHash } from './hash-routing.js';
import { loadItem } from './data-store.js';
import { realmContent } from './realm.js';
import { optimizeContentImages, attachImageZoom } from './images.js';
import { autoLinkWikiReferences, initWikiLinkTooltips } from './wiki-links.js';
import { initSmoothScroll, scrollBehavior } from './smooth-scroll.js';
import { showLoadingSkeleton, showNotification } from './ui.js';
import { updateBookmarkButton } from './bookmarks.js';

// ===== RELATIONSHIP MAP =====
export function showRelationshipMap() {
    // Remove existing modal
    const existing = document.getElementById('relationship-map-modal');
    if (existing) {
        existing.remove();
        return;
    }

    // Build nodes from Party, NPCs, and Sovereigns
    const nodes = [];
    const nodeMap = new Map();
    const nodeByKey = new Map();
    const categories = ['Party', 'NPCs', 'Sovereigns'];

    for (const cat of categories) {
        if (state.data[cat]) {
            for (const item of state.data[cat].items) {
                const node = {
                    id: item.id,
                    title: item.title,
                    category: cat,
                    raw: item.raw || '',
                    mentions: item.mentions || [],
                    connections: []
                };
                nodes.push(node);
                nodeByKey.set(`${cat}/${item.id}`, node);
                nodeMap.set(item.title, node);
                // Also map first name
                const firstName = item.title.split(' ')[0];
                if (firstName.length > 2 && firstName !== 'The') {
                    nodeMap.set(firstName, node);
                }
            }
        }
    }

    // Build connections based on mentions
    const edges = [];
    const edgeSet = new Set();

    for (const node of nodes) {
        for (const targetKey of node.mentions) {
            const targetNode = nodeByKey.get(targetKey);
            if (targetNode && targetNode.id !== node.id) {
                const edgeKey = [node.id, targetNode.id].sort().join('-');
                if (!edgeSet.has(edgeKey)) {
                    edgeSet.add(edgeKey);
                    edges.push({ source: node, target: targetNode });
                    node.connections.push(targetNode.id);
                    targetNode.connections.push(node.id);
                }
            }
        }
    }

    // Filter to only show nodes with connections
    const connectedNodes = nodes.filter(n => n.connections.length > 0);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'relationship-map-modal';
    modal.className = 'relationship-map-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'relationship-map-title');
    const previousFocus = document.activeElement;
    const textList = connectedNodes.map((node) => `
        <button type="button" class="relationship-list-item" data-id="${node.id}">
            <span>${node.title}</span><small>${node.category} · ${node.connections.length} connections</small>
        </button>
    `).join('');
    modal.innerHTML = `
        <div class="relationship-map-backdrop"></div>
        <div class="relationship-map-content">
            <div class="relationship-map-header">
                <h2 id="relationship-map-title"><i data-lucide="git-merge"></i> Character Relationships</h2>
                <div class="relationship-map-legend">
                    <span class="legend-item legend-party"><span class="legend-dot"></span> Party</span>
                    <span class="legend-item legend-npc"><span class="legend-dot"></span> NPCs</span>
                    <span class="legend-item legend-sovereign"><span class="legend-dot"></span> Sovereigns</span>
                    <span class="legend-item legend-connection"><span class="legend-line"></span> Recorded connection</span>
                </div>
                <button class="relationship-map-close" aria-label="Close">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <p class="relationship-map-help">Select a node to inspect it. Use Tab to move between nodes; press Enter to open an entry.</p>
            <div class="relationship-map-workspace">
                <div class="relationship-map-container">
                    <svg id="relationship-svg" role="group" aria-label="Interactive character relationship graph"></svg>
                </div>
                <aside class="relationship-map-details" id="relationship-map-details" aria-live="polite">
                    <span class="relationship-details-kicker">Selected connection</span>
                    <h3>Choose a character</h3>
                    <p>The graph will show their recorded connections here.</p>
                </aside>
            </div>
            <details class="relationship-text-alternative">
                <summary>Browse as a text list</summary>
                <div class="relationship-list">${textList}</div>
            </details>
        </div>
    `;

    document.body.appendChild(modal);
    refreshIcons();

    const closeModal = () => {
        modal.remove();
        if (previousFocus && document.contains(previousFocus)) previousFocus.focus();
    };
    modal.querySelector('.relationship-map-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.relationship-map-close').addEventListener('click', closeModal);
    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });
    modal.querySelectorAll('.relationship-list-item').forEach((button) => {
        button.addEventListener('click', () => {
            closeModal();
            navigateToItem(button.dataset.id);
        });
    });
    modal.querySelector('.relationship-map-close').focus();

    // Initialize the graph
    initRelationshipGraph(connectedNodes, edges);
}

function initRelationshipGraph(nodes, edges) {
    const svg = document.getElementById('relationship-svg');
    const container = svg.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Simple force simulation
    const centerX = width / 2;
    const centerY = height / 2;

    // Position nodes in a circle initially, with Party in center
    const partyNodes = nodes.filter(n => n.category === 'Party');
    const otherNodes = nodes.filter(n => n.category !== 'Party');

    // Place party members near center
    partyNodes.forEach((node, i) => {
        const angle = (i / partyNodes.length) * Math.PI * 2;
        const radius = 80;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
        node.vx = 0;
        node.vy = 0;
    });

    // Place others in outer ring
    otherNodes.forEach((node, i) => {
        const angle = (i / otherNodes.length) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.35;
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
        node.vx = 0;
        node.vy = 0;
    });

    // Simple physics simulation
    function simulate() {
        const iterations = 100;
        for (let iter = 0; iter < iterations; iter++) {
            // Repulsion between all nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 2000 / (dist * dist);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    nodes[i].vx -= fx;
                    nodes[i].vy -= fy;
                    nodes[j].vx += fx;
                    nodes[j].vy += fy;
                }
            }

            // Attraction along edges
            for (const edge of edges) {
                const dx = edge.target.x - edge.source.x;
                const dy = edge.target.y - edge.source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - 120) * 0.05;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                edge.source.vx += fx;
                edge.source.vy += fy;
                edge.target.vx -= fx;
                edge.target.vy -= fy;
            }

            // Center gravity
            for (const node of nodes) {
                node.vx += (centerX - node.x) * 0.01;
                node.vy += (centerY - node.y) * 0.01;
            }

            // Apply velocities with damping
            for (const node of nodes) {
                node.x += node.vx * 0.1;
                node.y += node.vy * 0.1;
                node.vx *= 0.9;
                node.vy *= 0.9;

                // Keep in bounds
                node.x = Math.max(50, Math.min(width - 50, node.x));
                node.y = Math.max(50, Math.min(height - 50, node.y));
            }
        }
    }

    simulate();

    // Render edges
    const edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgesGroup.classList.add('edges');
    for (const edge of edges) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', edge.source.x);
        line.setAttribute('y1', edge.source.y);
        line.setAttribute('x2', edge.target.x);
        line.setAttribute('y2', edge.target.y);
        line.classList.add('edge-line');
        edgesGroup.appendChild(line);
    }
    svg.appendChild(edgesGroup);

    // Render nodes
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.classList.add('nodes');
    for (const node of nodes) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('node-group');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        g.dataset.id = node.id;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const radius = node.category === 'Party' ? 20 : (node.category === 'Sovereigns' ? 16 : 12);
        circle.setAttribute('r', radius);
        circle.classList.add('node-circle', `node-${node.category.toLowerCase()}`);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('dy', radius + 14);
        text.classList.add('node-label');
        // Truncate long names
        const displayName = node.title.length > 21 ? node.title.substring(0, 18) + '…' : node.title;
        text.textContent = displayName;

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${node.title}, ${node.category}, ${node.connections.length} recorded connections`;
        g.appendChild(title);

        g.appendChild(circle);
        g.appendChild(text);

        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', title.textContent);
        g.style.cursor = 'pointer';
        const selectNode = () => {
            document.querySelectorAll('.node-group.selected').forEach((selected) => selected.classList.remove('selected'));
            g.classList.add('selected');
            const connectionNames = node.connections
                .map((id) => nodes.find((candidate) => candidate.id === id)?.title)
                .filter(Boolean);
            document.getElementById('relationship-map-details').innerHTML = `
                <span class="relationship-details-kicker">${node.category}</span>
                <h3>${node.title}</h3>
                <p>${connectionNames.length ? connectionNames.join(' · ') : 'No named connections.'}</p>
                <button type="button" class="relationship-open-entry">Open compendium entry <span aria-hidden="true">→</span></button>
            `;
            document.querySelector('.relationship-open-entry').addEventListener('click', () => {
                document.getElementById('relationship-map-modal')?.remove();
                navigateToItem(node.id);
            });
        };
        g.addEventListener('click', selectNode);
        g.addEventListener('focus', selectNode);
        g.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                document.getElementById('relationship-map-modal')?.remove();
                navigateToItem(node.id);
            }
        });

        nodesGroup.appendChild(g);
    }
    svg.appendChild(nodesGroup);
}

// ===== ARTICLE DISPLAY =====
export async function showItem(categoryName, itemStub, navElement = null, skipHash = false, skipScrollToTop = false) {
    if (!itemStub?.content) showLoadingSkeleton();
    let item;
    try {
        item = realmContent(await loadItem(itemStub), state.currentRealm || 'living');
    } catch (error) {
        console.error(error);
        showNotification(`The entry "${itemStub?.title || 'Unknown'}" could not be loaded.`);
        return;
    }
    state.currentItem = item;
    state.currentCategory = categoryName;

    // Re-enable Lenis smooth scroll (may have been destroyed for spell compendium)
    initSmoothScroll();

    // Disable full-width mode
    document.getElementById('content-body').classList.remove('full-width');

    // Update URL hash
    if (!skipHash) {
        updateHash(categoryName, item.id);
    }

    // Update active state in navigation
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
    if (navElement) {
        navElement.classList.add('active');
        // Keep the active item's branch open in the sidebar so navigating never collapses it
        for (let p = navElement.parentElement; p && p.id !== 'nav-categories'; p = p.parentElement) {
            if (p.classList.contains('nav-region') || p.classList.contains('nav-subcategory') || p.classList.contains('nav-subgroup')) {
                p.classList.add('expanded');
            }
            if (p.classList.contains('nav-category')) {
                p.classList.add('open');
            }
        }
    }

    // Open the category if not already open
    const category = document.querySelector(`.nav-category[data-category="${categoryName}"]`);
    if (category && !category.classList.contains('open')) {
        category.classList.add('open');
    }

    // Update breadcrumb
    const categoryInfo = state.data[categoryName]?.info || {};
    document.getElementById('breadcrumb').innerHTML = `
        <button type="button" class="breadcrumb-home" onclick="showWelcome()">Compendium</button>
        <span class="breadcrumb-sep">/</span>
        <button type="button" class="breadcrumb-category" onclick="openCategory('${categoryName}')">${categoryName}</button>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">${item.title}</span>
    `;

    // Build meta tags
    let metaTags = [];
    if (item.frontmatter) {
        const fm = item.frontmatter;
        if (fm.parent) metaTags.push({ icon: 'map-pin', text: fm.parent });
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

    // Check for sigil (sovereigns)
    const sigil = item.frontmatter?.sigil;
    const sigilHtml = sigil ? `
        <div class="article-sigil">
            <img src="${sigil}" alt="${item.title} Sigil" class="sigil-image">
        </div>
    ` : '';

    // Render article
    const contentBody = document.getElementById('content-body');
    contentBody.innerHTML = `
        <article class="article ${sigil ? 'has-sigil' : ''}">
            <header class="article-header">
                ${sigilHtml}
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

    // The renderer supplies the page H1; source-document H1s are always redundant.
    const articleBody = contentBody.querySelector('.article-body');
    const firstH1 = articleBody?.querySelector('h1:first-child');
    if (firstH1) firstH1.remove();

    // Wide rules tables remain usable on narrow screens.
    articleBody?.querySelectorAll('table').forEach((table) => {
        if (table.parentElement?.classList.contains('table-scroll')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'table-scroll';
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', 'Scrollable table');
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });

    // Setup easter egg click handler if present
    const easterEgg = articleBody?.querySelector('.easter-egg');
    if (easterEgg) {
        easterEgg.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.className = 'easter-egg-overlay';
            overlay.innerHTML = `
                <div class="easter-egg-modal">
                    <img src="images/fragment-aedwynn.webp" alt="Fragment of Aedwynn">
                    <p>Screenshot this and put it in the DND section</p>
                </div>
            `;
            overlay.addEventListener('click', () => overlay.remove());
            document.body.appendChild(overlay);
        });
    }

    // Optimize images (WebP conversion + lazy loading)
    optimizeContentImages(contentBody);

    // Generate table of contents for long articles
    generateTableOfContents(contentBody, categoryName, item.title);

    // Auto-link references to other entries
    if (articleBody) {
        autoLinkWikiReferences(articleBody, item.title);
    }

    // Setup internal wiki links (both manual and auto-generated)
    document.querySelectorAll('.wiki-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;
            navigateToItem(target);
        });
    });

    // Initialize tooltips on wiki-links
    initWikiLinkTooltips();

    // Attach image zoom to new images
    attachImageZoom();

    refreshIcons();

    // Update bookmark button state
    updateBookmarkButton();

    // Add related articles section
    addRelatedArticles(contentBody, categoryName, item);

    // Add session navigation for Sessions category
    if (categoryName === 'Sessions') {
        addSessionNavigation(contentBody, item);
    }

    // Initialize interactive world map if this is the map entry
    if (item.id === 'the-ashen-realms') {
        initWorldMap(contentBody);
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Scroll to top (unless restoring from hash with saved scroll position)
    if (!skipScrollToTop) {
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
    }

    document.title = `${item.title} — The Ashen Realms`;
    const description = (item.raw || '').replace(/\s+/g, ' ').trim().slice(0, 155);
    document.querySelector('meta[name="description"]')?.setAttribute('content', description || 'The Ashen Realms Player Compendium');
    const recent = JSON.parse(localStorage.getItem('recentArticles') || '[]')
        .filter((entry) => !(entry.category === categoryName && entry.id === item.id));
    recent.unshift({ category: categoryName, id: item.id, title: item.title, visitedAt: Date.now() });
    localStorage.setItem('recentArticles', JSON.stringify(recent.slice(0, 8)));
}

// ===== INTERACTIVE WORLD MAP =====
let worldMapInstance = null;
let mapDataCache = null;

export async function initWorldMap(contentBody) {
    // Find the world-map div and replace it
    const worldMapDiv = contentBody.querySelector('.world-map');
    if (!worldMapDiv) return;

    // Clean up any previous map instance
    if (worldMapInstance) {
        worldMapInstance.remove();
        worldMapInstance = null;
    }

    // Create iframe container — isolates the map from all website CSS/JS
    const mapContainer = document.createElement('div');
    mapContainer.id = 'world-map-container';
    mapContainer.setAttribute('data-lenis-prevent', '');
    worldMapDiv.replaceWith(mapContainer);

    const iframe = document.createElement('iframe');
    iframe.src = 'map-embed.html';
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    mapContainer.appendChild(iframe);

    worldMapInstance = iframe;

    // Listen for compendium navigation from the iframe
    window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'map-navigate') {
            // Use the navigation.js navigateToItemById via window
            window.navigateToItemById(e.data.category, e.data.id);
        }
    });
}

function addMapMarkers(map, mapData) {
    const partyLocationId = mapData.partyLocation;

    mapData.markers.forEach(marker => {
        const isParty = marker.id === partyLocationId;
        const markerType = marker.type || 'landmark';

        // Create custom div icon
        const size = markerType === 'landmark' ? 14 : 18;
        const icon = L.divIcon({
            className: `map-marker type-${markerType}${isParty ? ' party-location' : ''}`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -(size / 2 + 4)]
        });

        const leafletMarker = L.marker(marker.coords, { icon: icon }).addTo(map);

        // Build popup HTML
        let popupHtml = '<div class="map-popup">';
        popupHtml += `<div class="map-popup-name">${marker.name}</div>`;

        if (marker.subtitle) {
            popupHtml += `<div class="map-popup-subtitle">${marker.subtitle}</div>`;
        }

        if (marker.sovereign) {
            popupHtml += `<div class="map-popup-sovereign">${marker.sovereign}</div>`;
        }

        if (isParty) {
            popupHtml += `<div class="map-popup-organ" style="color: var(--gold-bright);">&#9733; Party is here</div>`;
        }

        if (marker.description) {
            popupHtml += `<div class="map-popup-desc">${marker.description}</div>`;
        }

        if (marker.link) {
            popupHtml += `<a class="map-popup-link" data-category="${marker.link.category}" data-id="${marker.link.id}">Open in Compendium &rarr;</a>`;
        }

        popupHtml += '</div>';

        leafletMarker.bindPopup(popupHtml, {
            maxWidth: 300,
            minWidth: 200
        });

        // Handle compendium link clicks inside popups
        leafletMarker.on('popupopen', () => {
            const popup = leafletMarker.getPopup();
            const link = popup.getElement().querySelector('.map-popup-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const category = link.dataset.category;
                    const id = link.dataset.id;
                    window.navigateToItemById(category, id);
                });
            }
        });
    });
}

function addMapLegend(container) {
    const legend = document.createElement('div');
    legend.className = 'map-legend';
    legend.innerHTML = `
        <div class="map-legend-title">Legend</div>
        <div class="map-legend-item">
            <div class="map-legend-dot sovereign"></div>
            <span>Sovereign Domain</span>
        </div>
        <div class="map-legend-item">
            <div class="map-legend-dot city"></div>
            <span>Independent City</span>
        </div>
        <div class="map-legend-item">
            <div class="map-legend-dot landmark"></div>
            <span>Landmark</span>
        </div>
        <div class="map-legend-item">
            <div class="map-legend-dot party"></div>
            <span>Party Location</span>
        </div>
    `;
    container.appendChild(legend);
}

// ===== RELATED ARTICLES =====
function addRelatedArticles(contentBody, currentCategory, currentItem) {
    const article = contentBody.querySelector('.article');
    if (!article) return;

    // Find articles that mention this item (incoming links)
    const incomingLinks = [];
    // Find articles this item mentions (outgoing links)
    const outgoingLinks = [];

    const currentTitle = currentItem.title;
    const currentId = currentItem.id;

    // Helper to check if text contains a name (with word boundaries)
    function containsName(text, name) {
        if (!text || !name || name.length < 4) return false;
        // Skip common words that might match accidentally
        const skipWords = ['The', 'And', 'For', 'With', 'From', 'This', 'That', 'Session'];
        if (skipWords.includes(name)) return false;
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Specific disambiguators: "The Hollow" must not match inside Sovereign titles
        // ("the Hollow Crown" = Karthayne, "the Hollow Empress" = Vor'Kael)
        if (name.toLowerCase() === 'the hollow') {
            const regex = new RegExp(`\\b${escapedName}\\b(?!\\s+(?:Crown|Empress))`, 'i');
            return regex.test(text);
        }
        // Use word boundary check
        const regex = new RegExp(`\\b${escapedName}\\b`, 'i');
        return regex.test(text);
    }

    const currentKey = `${currentCategory}/${currentId}`;

    // Search the precomputed mention graph from the lightweight index.
    for (const [categoryName, categoryData] of Object.entries(state.data)) {
        for (const item of categoryData.items) {
            // Skip self
            if (item.id === currentId) continue;

            if ((item.mentions || []).includes(currentKey)) {
                incomingLinks.push({
                    category: categoryName,
                    item: item,
                    icon: categoryData.info?.icon || 'file-text'
                });
            }

            if ((currentItem.mentions || []).includes(`${categoryName}/${item.id}`)) {
                outgoingLinks.push({
                    category: categoryName,
                    item: item,
                    icon: categoryData.info?.icon || 'file-text'
                });
            }
        }
    }

    // Remove duplicates (items that appear in both lists)
    const outgoingIds = new Set(outgoingLinks.map(l => l.item.id));
    const uniqueIncoming = incomingLinks.filter(l => !outgoingIds.has(l.item.id));

    // Combine all related
    const allRelated = [...outgoingLinks, ...uniqueIncoming];
    if (allRelated.length === 0) return;

    // Group by category
    const grouped = {};
    for (const rel of allRelated) {
        if (!grouped[rel.category]) {
            grouped[rel.category] = {
                icon: rel.icon,
                items: []
            };
        }
        grouped[rel.category].items.push(rel.item);
    }

    // Build grouped HTML
    const groupsHtml = Object.entries(grouped).map(([category, group]) => `
        <div class="related-group">
            <div class="related-group-header">
                <i data-lucide="${group.icon}"></i>
                <span>${category}</span>
            </div>
            <div class="related-group-items">
                ${group.items.map(item => `
                    <a href="#" class="related-article-link" data-target="${item.id}">
                        <span>${item.title}</span>
                    </a>
                `).join('')}
            </div>
        </div>
    `).join('');

    const relatedHtml = `
        <section class="related-articles">
            <h2><i data-lucide="link-2"></i> Related Articles</h2>
            <div class="related-groups">
                ${groupsHtml}
            </div>
        </section>
    `;

    article.insertAdjacentHTML('beforeend', relatedHtml);

    // Setup click handlers
    article.querySelectorAll('.related-article-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToItem(link.dataset.target);
        });
    });

    refreshIcons();
}

// ===== SESSION NAVIGATION =====
function addSessionNavigation(contentBody, currentItem) {
    const article = contentBody.querySelector('.article');
    if (!article) return;

    const sessions = state.data['Sessions']?.items || [];
    if (sessions.length <= 1) return;

    // Find current session index
    const currentIndex = sessions.findIndex(s => s.id === currentItem.id);
    if (currentIndex === -1) return;

    const prevSession = currentIndex > 0 ? sessions[currentIndex - 1] : null;
    const nextSession = currentIndex < sessions.length - 1 ? sessions[currentIndex + 1] : null;

    if (!prevSession && !nextSession) return;

    const navHtml = `
        <nav class="session-navigation">
            ${prevSession ? `
                <button class="session-nav-btn prev" data-id="${prevSession.id}">
                    <i data-lucide="chevron-left"></i>
                    <div class="session-nav-info">
                        <span class="session-nav-label">Previous Session</span>
                        <span class="session-nav-title">${prevSession.title}</span>
                    </div>
                </button>
            ` : '<div class="session-nav-spacer"></div>'}
            ${nextSession ? `
                <button class="session-nav-btn next" data-id="${nextSession.id}">
                    <div class="session-nav-info">
                        <span class="session-nav-label">Next Session</span>
                        <span class="session-nav-title">${nextSession.title}</span>
                    </div>
                    <i data-lucide="chevron-right"></i>
                </button>
            ` : '<div class="session-nav-spacer"></div>'}
        </nav>
    `;

    article.insertAdjacentHTML('beforeend', navHtml);

    // Add click handlers
    article.querySelectorAll('.session-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sessionId = btn.dataset.id;
            const session = sessions.find(s => s.id === sessionId);
            if (session) {
                const navItem = document.querySelector(`.nav-item[data-id="${sessionId}"]`);
                showItem('Sessions', session, navItem);
            }
        });
    });

    refreshIcons();
}

// ===== TABLE OF CONTENTS =====
function generateTableOfContents(contentBody, categoryName, itemTitle = '') {
    const articleBody = contentBody.querySelector('.article-body');
    if (!articleBody) return;

    // Only use h2 headings for TOC (main sections only, not subsections)
    const headings = articleBody.querySelectorAll('h2');

    // Only show TOC if there are 3+ main headings
    if (headings.length < 3) return;

    // Generate unique IDs for headings
    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = `heading-${index}`;
        }
    });

    // Build TOC HTML
    const tocItems = Array.from(headings).map(heading => {
        return `
            <a href="#${heading.id}" class="toc-item toc-h2" data-target="${heading.id}">
                ${heading.textContent}
            </a>
        `;
    }).join('');

    // Categories that should have image beside TOC
    const imageCategories = ['Party', 'Hall of the Dead', 'NPCs', 'Locations', 'Creatures', 'Felled Foes', 'Items', 'Lore'];
    // Specific items to exclude from image wrapping
    const excludeItems = ['The Silken Refuge'];

    const shouldWrapWithImage = imageCategories.includes(categoryName) && !excludeItems.includes(itemTitle);
    let firstImage = null;

    if (shouldWrapWithImage) {
        // Find the first image (npc-portrait, content-image, or any img)
        firstImage = articleBody.querySelector('.npc-portrait, img.content-image, img');
        if (firstImage) {
            firstImage.remove();
        }
    }

    const isCompact = headings.length <= 4;
    const tocHtml = `
        <details class="article-toc ${isCompact ? 'compact-toc' : ''}" open>
            <summary class="toc-header">
                <i data-lucide="list"></i>
                <span>Contents</span>
                <i data-lucide="chevron-down" class="toc-disclosure"></i>
            </summary>
            <nav class="toc-nav">
                ${tocItems}
            </nav>
        </details>
    `;

    // If we have an image and should wrap, create a flex container
    if (firstImage && shouldWrapWithImage) {
        const wrapper = document.createElement('div');
        wrapper.className = `toc-image-wrapper ${isCompact ? 'is-compact' : ''}`;
        wrapper.innerHTML = tocHtml;
        wrapper.appendChild(firstImage);
        articleBody.insertBefore(wrapper, articleBody.firstChild);
    } else {
        // Insert TOC at the beginning of article body
        articleBody.insertAdjacentHTML('afterbegin', tocHtml);
    }

    // Setup smooth scroll for TOC links
    articleBody.querySelectorAll('.toc-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
            }
        });
    });

    if (isCompact && window.matchMedia('(max-width: 768px)').matches) {
        articleBody.querySelector('.compact-toc')?.removeAttribute('open');
    }

    refreshIcons();
}

// Navigate to an item by title (used by wiki-links and relationship map)
export function navigateToItem(targetName) {
    const norm = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedTarget = norm(targetName);

    // Flatten all entries (top-level + subcategories) so we can do a precise
    // pass before a loose one.
    const all = [];
    for (const [categoryName, categoryData] of Object.entries(state.data)) {
        for (const item of categoryData.items || []) all.push([categoryName, item]);
        if (categoryData.subcategories) {
            for (const subItems of Object.values(categoryData.subcategories)) {
                for (const item of subItems) all.push([categoryName, item]);
            }
        }
    }

    const go = ([categoryName, item]) => {
        const navItem = document.querySelector(`.nav-item[data-id="${item.id}"]`);
        showItem(categoryName, item, navItem);
    };

    // Pass 1 — exact id or exact (normalized) title. This stops short names like
    // "Mor" from being swallowed by a longer substring match ("...Morrow").
    let hit = all.find(([, item]) => item.id === targetName || norm(item.title) === normalizedTarget);
    // Pass 2 — loose substring fallback (original behaviour) for partial mentions.
    if (!hit) {
        hit = all.find(([, item]) => {
            const ni = norm(item.title);
            return ni && (ni.includes(normalizedTarget) || normalizedTarget.includes(ni));
        });
    }

    if (hit) { go(hit); return; }

    // Not found - show subtle notification
    showNotification(`"${targetName}" is not in the compendium — it may be hidden knowledge.`);
}

// Assign to window for onclick handlers in innerHTML
window.showItem = showItem;
window.navigateToItem = navigateToItem;
window.showRelationshipMap = showRelationshipMap;
