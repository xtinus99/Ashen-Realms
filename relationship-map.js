// =====================================================
// RELATIONSHIP MAP - The Ashen Realms
// Interactive NPC Connection Web
// =====================================================

// Node data with positions and connections
const mapData = {
    nodes: [
        // Party Members (center)
        { id: 'jonas', name: 'Jonas', type: 'Party', category: 'party', image: 'Jonas.webp', x: 40, y: 50 },
        { id: 'sol', name: 'Sol Raven', type: 'Party', category: 'party', image: 'Sol Raven.webp', x: 50, y: 40 },
        { id: 'fursen', name: 'Fursen', type: 'Party', category: 'party', image: 'Fursen.webp', x: 60, y: 50 },

        // Sovereigns (outer ring)
        { id: 'vorkael', name: "Vor'Kael", type: 'Sovereign', category: 'sovereign', image: "Vor'Kael the Hollow Empress.webp", x: 15, y: 20 },
        { id: 'azerach', name: 'Azerach', type: 'Sovereign', category: 'sovereign', image: 'Azerach the Whispered King.webp', x: 30, y: 15 },
        { id: 'imhuran', name: 'Imhuran', type: 'Sovereign', category: 'sovereign', image: 'Imhuran the Regent of Hours.webp', x: 50, y: 10 },
        { id: 'talaris', name: 'Talaris', type: 'Sovereign', category: 'sovereign', image: 'Talaris Bloomrend the Verdant King.webp', x: 70, y: 15 },
        { id: 'mareatha', name: 'Mareatha', type: 'Sovereign', category: 'sovereign', image: 'Mareatha the Vein-Mother.webp', x: 85, y: 20 },
        { id: 'kaedris', name: 'Kaedris', type: 'Sovereign', category: 'sovereign', image: 'Kaedris the Crimson Matron.webp', x: 90, y: 50 },
        { id: 'aedwynn', name: 'Aedwynn', type: 'Dead God', category: 'sovereign', image: 'Aedwynn Fragment - Golden Tree.webp', x: 50, y: 85 },

        // Key NPCs
        { id: 'seraphine', name: 'Seraphine Vale', type: 'NPC', category: 'npc', image: 'Seraphine Vale.webp', x: 25, y: 35 },
        { id: 'thessaly', name: 'Thessaly', type: 'NPC', category: 'npc', image: 'Thessaly.webp', x: 35, y: 70 },
        { id: 'velvet', name: 'Velvet Thorn', type: 'NPC', category: 'npc', image: 'Velvet Thorn.webp', x: 45, y: 75 },
        { id: 'broma', name: 'Broma', type: 'NPC', category: 'npc', image: 'Broma.webp', x: 55, y: 75 },
        { id: 'thresh', name: 'Thresh', type: 'NPC', category: 'npc', image: 'Thresh.webp', x: 65, y: 70 },
        { id: 'veshra', name: 'Veshra Coil', type: 'NPC', category: 'npc', image: 'Veshra Coil.webp', x: 75, y: 65 },
        { id: 'scarlet', name: 'Scarlet', type: 'NPC', category: 'npc', image: 'Scarlet.webp', x: 80, y: 55 },
        { id: 'cinder', name: 'Cinder', type: 'NPC', category: 'npc', image: 'Cinder.webp', x: 82, y: 45 },
        { id: 'sekris', name: 'Sekris', type: 'NPC', category: 'npc', image: 'Sekris.webp', x: 20, y: 55 },
        { id: 'ardian', name: 'Ardian Bloodveil', type: 'NPC', category: 'npc', image: 'Ardian Bloodveil.webp', x: 15, y: 40 },
        { id: 'velara', name: 'Velara Ashyn', type: 'Soul', category: 'npc', image: 'Velara Ashyn.webp', x: 75, y: 35 },
        { id: 'satiated', name: 'The Satiated One', type: 'Primordial', category: 'sovereign', image: 'The Satiated One.webp', x: 10, y: 65 },
        { id: 'dealer', name: 'The Dealer', type: 'NPC', category: 'npc', image: 'The Dealer.webp', x: 60, y: 65 },
        { id: 'kael', name: "Kael's Echo", type: 'Memory', category: 'npc', image: 'Kael.webp', x: 55, y: 30 }
    ],

    connections: [
        // Jonas connections
        { from: 'jonas', to: 'sol', type: 'ally', label: 'Party' },
        { from: 'jonas', to: 'fursen', type: 'ally', label: 'Party (Reconciled)' },
        { from: 'jonas', to: 'azerach', type: 'sovereign', label: 'Branded' },
        { from: 'jonas', to: 'vorkael', type: 'enemy', label: 'Permanent Enemy' },
        { from: 'jonas', to: 'seraphine', type: 'ally', label: 'Trusted Ally' },
        { from: 'jonas', to: 'thessaly', type: 'business', label: 'Customer' },
        { from: 'jonas', to: 'broma', type: 'business', label: 'Unfriendly' },
        { from: 'jonas', to: 'velvet', type: 'ally', label: 'Guest' },
        { from: 'jonas', to: 'imhuran', type: 'enemy', label: 'Defied' },
        { from: 'jonas', to: 'talaris', type: 'ally', label: 'Respected' },
        { from: 'jonas', to: 'ardian', type: 'business', label: 'Uncertain' },

        // Sol connections
        { from: 'sol', to: 'fursen', type: 'ally', label: 'Party' },
        { from: 'sol', to: 'aedwynn', type: 'sovereign', label: 'The Witness' },
        { from: 'sol', to: 'talaris', type: 'ally', label: 'Showed Memory' },
        { from: 'sol', to: 'velara', type: 'ally', label: 'Carries Amulet' },
        { from: 'sol', to: 'kael', type: 'ally', label: 'Carries Echo' },
        { from: 'sol', to: 'seraphine', type: 'ally', label: 'Gave Oathkeeper' },
        { from: 'sol', to: 'thessaly', type: 'ally', label: 'Shared Knowledge' },
        { from: 'sol', to: 'velvet', type: 'ally', label: 'Guest' },
        { from: 'sol', to: 'vorkael', type: 'business', label: 'Indigestible' },
        { from: 'sol', to: 'imhuran', type: 'enemy', label: 'Anomaly' },

        // Fursen connections
        { from: 'fursen', to: 'imhuran', type: 'enemy', label: 'Escaped' },
        { from: 'fursen', to: 'vorkael', type: 'business', label: 'Passed Through' },
        { from: 'fursen', to: 'satiated', type: 'ally', label: 'Interesting' },
        { from: 'fursen', to: 'veshra', type: 'romance', label: 'Welcome' },
        { from: 'fursen', to: 'scarlet', type: 'romance', label: 'Connection' },
        { from: 'fursen', to: 'cinder', type: 'romance', label: 'Connection' },
        { from: 'fursen', to: 'thresh', type: 'ally', label: 'Paid in Names' },
        { from: 'fursen', to: 'thessaly', type: 'ally', label: 'Living Leonin' },
        { from: 'fursen', to: 'sekris', type: 'business', label: 'Contract Token' },
        { from: 'fursen', to: 'velvet', type: 'ally', label: 'Guest' },

        // NPC to NPC connections
        { from: 'thessaly', to: 'velvet', type: 'ally', label: 'Old Friends' },
        { from: 'veshra', to: 'scarlet', type: 'ally', label: 'Employer' },
        { from: 'veshra', to: 'cinder', type: 'ally', label: 'Employer' },
        { from: 'scarlet', to: 'cinder', type: 'ally', label: 'Partners' },
        { from: 'sekris', to: 'vorkael', type: 'business', label: 'Operates in Territory' },
        { from: 'velara', to: 'kaedris', type: 'enemy', label: 'Former Consort' },
        { from: 'satiated', to: 'vorkael', type: 'enemy', label: 'Cannot Digest' },
        { from: 'seraphine', to: 'mareatha', type: 'enemy', label: 'Crisis of Faith' },
        { from: 'ardian', to: 'mareatha', type: 'sovereign', label: 'First Templar' }
    ]
};

// State
let activeView = 'all';
let activeToggles = { allies: true, enemies: true, business: true, romance: false };
let highlightedNode = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderMap();
    setupControls();
    setupTooltip();
});

function renderMap() {
    const container = document.getElementById('map-container');
    const nodesLayer = document.getElementById('nodes-layer');
    const connectionsLayer = document.getElementById('connections-layer');

    // Clear
    nodesLayer.innerHTML = '';
    connectionsLayer.innerHTML = '';

    const containerRect = container.getBoundingClientRect();

    // Render nodes
    mapData.nodes.forEach(node => {
        if (!shouldShowNode(node)) return;

        const nodeEl = document.createElement('div');
        nodeEl.className = `map-node ${node.category}`;
        nodeEl.dataset.id = node.id;
        nodeEl.style.left = `${node.x}%`;
        nodeEl.style.top = `${node.y}%`;

        nodeEl.innerHTML = `
            <img class="node-portrait" src="thumbnails/${node.image}" alt="${node.name}" onerror="this.src='images/${node.image}'">
            <div class="node-label">${node.name}</div>
        `;

        nodeEl.addEventListener('mouseenter', () => highlightConnections(node.id));
        nodeEl.addEventListener('mouseleave', () => clearHighlights());
        nodeEl.addEventListener('click', () => showNodeDetails(node));

        nodesLayer.appendChild(nodeEl);
    });

    // Render connections
    mapData.connections.forEach(conn => {
        if (!shouldShowConnection(conn)) return;

        const fromNode = mapData.nodes.find(n => n.id === conn.from);
        const toNode = mapData.nodes.find(n => n.id === conn.to);

        if (!fromNode || !toNode) return;
        if (!shouldShowNode(fromNode) || !shouldShowNode(toNode)) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('connection-line', conn.type);
        line.dataset.from = conn.from;
        line.dataset.to = conn.to;

        // Convert percentages to actual coordinates
        line.setAttribute('x1', `${fromNode.x}%`);
        line.setAttribute('y1', `${fromNode.y}%`);
        line.setAttribute('x2', `${toNode.x}%`);
        line.setAttribute('y2', `${toNode.y}%`);

        connectionsLayer.appendChild(line);
    });
}

function shouldShowNode(node) {
    if (activeView === 'all') return true;
    if (activeView === 'party') return node.category === 'party' || hasPartyConnection(node.id);
    if (activeView === 'sovereigns') return node.category === 'sovereign' || node.category === 'party';
    return true;
}

function hasPartyConnection(nodeId) {
    const partyIds = ['jonas', 'sol', 'fursen'];
    return mapData.connections.some(conn =>
        (conn.from === nodeId && partyIds.includes(conn.to)) ||
        (conn.to === nodeId && partyIds.includes(conn.from))
    );
}

function shouldShowConnection(conn) {
    const typeMap = {
        ally: 'allies',
        enemy: 'enemies',
        business: 'business',
        romance: 'romance',
        sovereign: 'allies' // Show sovereign bonds with allies
    };

    const toggleKey = typeMap[conn.type];
    return activeToggles[toggleKey];
}

function highlightConnections(nodeId) {
    highlightedNode = nodeId;

    // Highlight connected nodes and dim others
    document.querySelectorAll('.map-node').forEach(el => {
        const id = el.dataset.id;
        const isConnected = mapData.connections.some(conn =>
            (conn.from === nodeId && conn.to === id) ||
            (conn.to === nodeId && conn.from === id)
        );

        if (id === nodeId || isConnected) {
            el.classList.add('highlighted');
            el.classList.remove('dimmed');
        } else {
            el.classList.add('dimmed');
            el.classList.remove('highlighted');
        }
    });

    // Highlight connected lines
    document.querySelectorAll('.connection-line').forEach(line => {
        const isConnected = line.dataset.from === nodeId || line.dataset.to === nodeId;

        if (isConnected) {
            line.classList.add('highlighted');
            line.classList.remove('dimmed');
        } else {
            line.classList.add('dimmed');
            line.classList.remove('highlighted');
        }
    });

    // Show tooltip
    const node = mapData.nodes.find(n => n.id === nodeId);
    if (node) {
        showTooltip(node);
    }
}

function clearHighlights() {
    highlightedNode = null;

    document.querySelectorAll('.map-node').forEach(el => {
        el.classList.remove('highlighted', 'dimmed');
    });

    document.querySelectorAll('.connection-line').forEach(line => {
        line.classList.remove('highlighted', 'dimmed');
    });

    hideTooltip();
}

function setupControls() {
    // View buttons
    document.querySelectorAll('.control-btn[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.control-btn[data-view]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeView = btn.dataset.view;
            renderMap();
        });
    });

    // Toggle buttons
    document.querySelectorAll('.control-btn[data-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            activeToggles[btn.dataset.toggle] = btn.classList.contains('active');
            renderMap();
        });
    });
}

function setupTooltip() {
    const tooltip = document.getElementById('node-tooltip');

    document.addEventListener('mousemove', (e) => {
        if (highlightedNode) {
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top = `${e.clientY + 15}px`;

            // Keep tooltip in viewport
            const rect = tooltip.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                tooltip.style.left = `${e.clientX - rect.width - 15}px`;
            }
            if (rect.bottom > window.innerHeight) {
                tooltip.style.top = `${e.clientY - rect.height - 15}px`;
            }
        }
    });
}

function showTooltip(node) {
    const tooltip = document.getElementById('node-tooltip');

    tooltip.querySelector('.tooltip-img').src = `thumbnails/${node.image}`;
    tooltip.querySelector('.tooltip-img').onerror = function() {
        this.src = `images/${node.image}`;
    };
    tooltip.querySelector('.tooltip-name').textContent = node.name;
    tooltip.querySelector('.tooltip-type').textContent = node.type;

    // Get connections
    const connections = mapData.connections.filter(conn =>
        conn.from === node.id || conn.to === node.id
    );

    const connectionsHtml = connections.map(conn => {
        const otherId = conn.from === node.id ? conn.to : conn.from;
        const otherNode = mapData.nodes.find(n => n.id === otherId);
        if (!otherNode) return '';

        return `
            <div class="tooltip-connection">
                <span class="conn-type ${conn.type}">${conn.type}</span>
                <span>${otherNode.name}</span>
            </div>
        `;
    }).join('');

    tooltip.querySelector('.tooltip-connections').innerHTML = connectionsHtml || '<div>No known connections</div>';

    tooltip.classList.add('visible');
}

function hideTooltip() {
    document.getElementById('node-tooltip').classList.remove('visible');
}

function showNodeDetails(node) {
    // Could open a modal or navigate to a detail page
    console.log('Node clicked:', node);
}
