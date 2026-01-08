// =====================================================
// THE ASHEN REALMS - Interactive Compendium
// =====================================================

let data = {};
let currentItem = null;
let currentCategory = null;

// ===== AUDIO PLAYER =====
const audioTracks = [
    { file: 'Track 1.mp3', name: 'Ashen Whispers' },
    { file: 'Track 2.mp3', name: 'Sovereign\'s Lament' },
    { file: 'Track 3.mp3', name: 'The Hollow Throne' },
    { file: 'Track 4.mp3', name: 'Blood & Bone' },
    { file: 'Track 5.mp3', name: 'Echoes of the Maker' },
    { file: 'Track 6.mp3', name: 'Twilight Dominion' }
];

let audio = null;
let currentTrackIndex = 0;
let isMuted = false;
let savedVolume = 0.3;

function initAudio() {
    // Load saved preferences first
    const savedMuted = localStorage.getItem('audioMuted');
    const savedVol = localStorage.getItem('audioVolume');

    if (savedMuted === 'true') {
        isMuted = true;
    }
    if (savedVol !== null) {
        savedVolume = parseFloat(savedVol);
        document.getElementById('volume-slider').value = savedVolume * 100;
    }

    // Start at first track
    currentTrackIndex = 0;

    audio = new Audio(audioTracks[currentTrackIndex].file);
    audio.volume = savedVolume;
    audio.muted = isMuted;
    audio.loop = false;

    // When track ends, play next random track
    audio.addEventListener('ended', () => {
        playNextTrack();
    });

    // Handle audio errors - try next track
    audio.addEventListener('error', () => {
        console.log('Audio error, trying next track...');
        playNextTrack();
    });

    updateMuteIcon();
    updateTrackName();

    // Preload next track for smooth transitions
    preloadNextTrack();
}

// Preload the next track in the background
function preloadNextTrack() {
    const nextIndex = (currentTrackIndex + 1) % audioTracks.length;
    const preloadAudio = new Audio();
    preloadAudio.preload = 'auto';
    preloadAudio.src = audioTracks[nextIndex].file;
}

function playNextTrack() {
    // Go to next track (wrap around)
    currentTrackIndex = (currentTrackIndex + 1) % audioTracks.length;
    audio.src = audioTracks[currentTrackIndex].file;
    updateTrackName();
    audio.play();
    // Preload the next track
    preloadNextTrack();
}

function playPrevTrack() {
    // Go to previous track (wrap around)
    currentTrackIndex = (currentTrackIndex - 1 + audioTracks.length) % audioTracks.length;
    audio.src = audioTracks[currentTrackIndex].file;
    updateTrackName();
    audio.play();
    // Preload the next track
    preloadNextTrack();
}

function updateTrackName() {
    const trackNameEl = document.getElementById('track-name');
    if (trackNameEl) {
        trackNameEl.textContent = audioTracks[currentTrackIndex].name;
    }
}

function updateSliderFill(slider) {
    const value = slider.value;
    const percent = (value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, #8b2d2d 0%, #8b2d2d ${percent}%, rgba(255, 255, 255, 0.2) ${percent}%, rgba(255, 255, 255, 0.2) 100%)`;
}

function setupAudioControls() {
    const volumeSlider = document.getElementById('volume-slider');
    const muteBtn = document.getElementById('mute-btn');
    const prevBtn = document.getElementById('prev-track-btn');
    const nextBtn = document.getElementById('next-track-btn');

    // Initialize slider fill
    updateSliderFill(volumeSlider);

    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        audio.volume = volume;
        savedVolume = volume;
        localStorage.setItem('audioVolume', volume);
        updateSliderFill(e.target);

        if (volume === 0) {
            isMuted = true;
        } else {
            isMuted = false;
            audio.muted = false;
        }
        localStorage.setItem('audioMuted', isMuted);
        updateMuteIcon();
    });

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        audio.muted = isMuted;
        localStorage.setItem('audioMuted', isMuted);
        updateMuteIcon();
    });

    // Skip track buttons
    prevBtn.addEventListener('click', () => {
        playPrevTrack();
    });

    nextBtn.addEventListener('click', () => {
        playNextTrack();
    });

    // Start audio on first user interaction (browser autoplay policy)
    let audioStarted = false;
    const startAudio = () => {
        if (!audioStarted && audio.paused && !isMuted) {
            audio.play().then(() => {
                audioStarted = true;
                document.removeEventListener('click', startAudio);
                document.removeEventListener('keydown', startAudio);
                document.removeEventListener('touchstart', startAudio);
            }).catch((e) => {
                console.log('Audio play failed, will retry on next interaction:', e);
            });
        }
    };
    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
    document.addEventListener('touchstart', startAudio);

    // Also try to play when audio is loaded
    audio.addEventListener('canplaythrough', () => {
        if (!audioStarted && !isMuted) {
            audio.play().then(() => {
                audioStarted = true;
            }).catch(() => {}); // May fail due to autoplay policy, that's ok
        }
    });
}

function updateMuteIcon() {
    const muteBtn = document.getElementById('mute-btn');
    const volumeIcon = document.getElementById('volume-icon');

    if (isMuted || audio.volume === 0) {
        volumeIcon.setAttribute('data-lucide', 'volume-x');
        muteBtn.classList.add('muted');
    } else if (audio.volume < 0.5) {
        volumeIcon.setAttribute('data-lucide', 'volume-1');
        muteBtn.classList.remove('muted');
    } else {
        volumeIcon.setAttribute('data-lucide', 'volume-2');
        muteBtn.classList.remove('muted');
    }
    lucide.createIcons();
}

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration.scope);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// ===== DYNAMIC FOOTER QUOTES =====
const footerQuotes = [
    "The Maker is dead. The Sovereigns reign.",
    "In ash we are born, in ash we return.",
    "Even gods can bleed.",
    "Thirteen thrones built on the corpse of divinity.",
    "The void whispers secrets to those who listen.",
    "Walk softly in the realm of fallen divinity.",
    "Something ancient stirs in the ash and bone.",
    "Between shadow and flame, truth awaits."
];

function setupDynamicQuotes() {
    const quoteElement = document.querySelector('.footer-quote em');
    if (!quoteElement) return;

    // Set initial random quote
    const randomQuote = footerQuotes[Math.floor(Math.random() * footerQuotes.length)];
    quoteElement.textContent = `"${randomQuote}"`;

    // Rotate quotes every 30 seconds
    setInterval(() => {
        const newQuote = footerQuotes[Math.floor(Math.random() * footerQuotes.length)];
        quoteElement.style.opacity = '0';
        setTimeout(() => {
            quoteElement.textContent = `"${newQuote}"`;
            quoteElement.style.opacity = '1';
        }, 300);
    }, 30000);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    buildWikiIndex();
    buildNavigation();
    setupSearch();
    setupMobileMenu();
    setupKeyboardShortcuts();
    setupLogoClick();
    setupLightbox();
    setupBackToTop();
    setupTopBarActions();
    setupDynamicQuotes();
    initAudio();
    setupAudioControls();
    lucide.createIcons();

    // Check for URL hash to restore state
    if (!restoreFromHash()) {
        showWelcome();
    }

    // Listen for back/forward navigation
    window.addEventListener('hashchange', () => {
        restoreFromHash();
    });
});

function setupLogoClick() {
    const logo = document.querySelector('.logo-container');
    const sigil = document.getElementById('sigil-icon');

    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', (e) => {
            // Don't navigate if clicking the sigil itself
            if (sigil && sigil.contains(e.target)) {
                return;
            }
            showWelcome();
            // Close mobile sidebar if open
            document.getElementById('sidebar').classList.remove('open');
        });
    }

    // Sigil click animation - divine glow pulse
    if (sigil) {
        sigil.addEventListener('click', (e) => {
            e.stopPropagation();
            sigil.classList.add('divine-pulse');
            // Remove class after animation completes
            setTimeout(() => {
                sigil.classList.remove('divine-pulse');
            }, 600);
        });
    }
}

// ===== IMAGE OPTIMIZATION =====
// Check if browser supports WebP
const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
})();

// Set to true once you've uploaded images/images/ and images/thumbnails/ to the server
const USE_WEBP = true;

/**
 * Convert an image path to use optimized WebP version if available.
 * Falls back to original if WebP not supported or USE_WEBP is false.
 */
function getOptimizedImagePath(originalPath) {
    if (!originalPath) return originalPath;

    // Only process images in the images/ folder
    if (!originalPath.startsWith('images/')) {
        return originalPath;
    }

    // Check for supported extensions
    const isPng = originalPath.endsWith('.png');
    const isJpeg = originalPath.endsWith('.jpeg') || originalPath.endsWith('.jpg');

    if (!isPng && !isJpeg) {
        return originalPath;
    }

    if (USE_WEBP && supportsWebP) {
        // Convert images/Name.png or images/Name.jpeg -> images/Name.webp
        const filename = originalPath
            .replace('images/', '')
            .replace('.png', '')
            .replace('.jpeg', '')
            .replace('.jpg', '');
        return `images/${filename}.webp`;
    }

    return originalPath;
}

/**
 * Get thumbnail path for an image (used in category cards, search results)
 */
function getThumbnailPath(originalPath) {
    if (!originalPath) return originalPath;

    if (!originalPath.startsWith('images/')) {
        return originalPath;
    }

    // Check for supported extensions
    const isPng = originalPath.endsWith('.png');
    const isJpeg = originalPath.endsWith('.jpeg') || originalPath.endsWith('.jpg');

    if (!isPng && !isJpeg) {
        return originalPath;
    }

    if (USE_WEBP && supportsWebP) {
        const filename = originalPath
            .replace('images/', '')
            .replace('.png', '')
            .replace('.jpeg', '')
            .replace('.jpg', '');
        return `thumbnails/${filename}.webp`;
    }

    return originalPath;
}

/**
 * Process all images in HTML content to use optimized versions and add lazy loading.
 * Called after rendering article content.
 */
function optimizeContentImages(container) {
    const images = container.querySelectorAll('img');

    images.forEach(img => {
        const originalSrc = img.getAttribute('src');

        // Store original for lightbox (full quality)
        img.dataset.originalSrc = originalSrc;

        // Use optimized WebP version
        const optimizedSrc = getOptimizedImagePath(originalSrc);
        img.setAttribute('src', optimizedSrc);

        // Add lazy loading for images not in viewport
        img.setAttribute('loading', 'lazy');

        // Add decoding async for non-blocking decode
        img.setAttribute('decoding', 'async');

        // Add fade-in effect when loaded
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';

        img.onload = () => {
            img.style.opacity = '1';
        };

        // If already cached/loaded
        if (img.complete) {
            img.style.opacity = '1';
        }
    });
}

// ===== IMAGE LIGHTBOX =====
function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxBackdrop = lightbox.querySelector('.lightbox-backdrop');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxContent = lightbox.querySelector('.lightbox-content');

    // Close lightbox handlers
    const closeLightbox = () => {
        lightbox.classList.remove('active');
    };

    // Close on clicking anywhere in the lightbox (backdrop, image, content area)
    lightbox.addEventListener('click', closeLightbox);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // Delegate click events on content body for images
    document.getElementById('content-body').addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            // Don't open lightbox for welcome sigil
            if (e.target.classList.contains('welcome-sigil')) {
                return;
            }
            // Use optimized version for lightbox (not thumbnail)
            const originalSrc = e.target.dataset.originalSrc || e.target.src;
            lightboxImg.src = getOptimizedImagePath(originalSrc);
            lightboxImg.alt = e.target.alt;
            lightbox.classList.add('active');
        }
    });
}

// ===== URL HASH PERSISTENCE =====
function updateHash(category = null, itemId = null) {
    if (category && itemId) {
        window.location.hash = `${encodeURIComponent(category)}/${encodeURIComponent(itemId)}`;
    } else if (category) {
        window.location.hash = encodeURIComponent(category);
    } else {
        history.replaceState(null, '', window.location.pathname);
    }
}

function restoreFromHash() {
    const hash = window.location.hash.slice(1);
    if (!hash) return false;

    const parts = hash.split('/').map(decodeURIComponent);
    const categoryName = parts[0];
    const itemId = parts[1];

    // Category not found
    if (!data[categoryName]) {
        showNotFound(categoryName);
        return true;
    }

    if (itemId) {
        // Search in main items
        let item = data[categoryName].items.find(i => i.id === itemId);

        // If not found, search in subcategories
        if (!item && data[categoryName].subcategories) {
            for (const subItems of Object.values(data[categoryName].subcategories)) {
                item = subItems.find(i => i.id === itemId);
                if (item) break;
            }
        }

        if (item) {
            const navItem = document.querySelector(`.nav-item[data-id="${itemId}"]`);
            showItem(categoryName, item, navItem, true); // true = skip hash update
            return true;
        } else {
            // Item not found in category
            showNotFound(itemId);
            return true;
        }
    } else {
        openCategory(categoryName, true); // true = skip hash update
        return true;
    }
}

async function loadData() {
    try {
        // Add cache-busting timestamp to ensure fresh data on each visit
        const cacheBuster = Date.now();
        const response = await fetch(`data.json?v=${cacheBuster}`);
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

// ===== AUTO WIKI-LINKS =====
// Build an index of all known entries for auto-linking
let wikiIndex = [];

function buildWikiIndex() {
    wikiIndex = [];
    for (const [categoryName, categoryData] of Object.entries(data)) {
        for (const item of categoryData.items) {
            wikiIndex.push({
                title: item.title,
                id: item.id,
                category: categoryName
            });
        }
        // Also index subcategory items if they exist
        if (categoryData.subcategories) {
            for (const subItems of Object.values(categoryData.subcategories)) {
                for (const item of subItems) {
                    wikiIndex.push({
                        title: item.title,
                        id: item.id,
                        category: categoryName
                    });
                }
            }
        }
    }
    // Sort by title length (longest first) to match longer names before shorter ones
    // e.g., "Sol Raven" before "Sol"
    wikiIndex.sort((a, b) => b.title.length - a.title.length);
}

/**
 * Convert mentions of known entries into clickable wiki-links.
 * Processes text nodes in the article body, avoiding:
 * - The article title itself (h1)
 * - Already linked text
 * - Text inside certain elements (a, h1, h2, h3, strong in headers)
 */
function autoLinkWikiReferences(articleBody, currentItemTitle) {
    if (!wikiIndex.length) return;

    // Elements whose text content should not be processed
    const excludeSelectors = 'a, h1, .wiki-link, .article-title, code, pre, .toc-item';

    // Create a regex pattern that matches any known title
    // We'll process each entry individually to maintain proper linking
    const walker = document.createTreeWalker(
        articleBody,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                // Skip if parent is an excluded element
                let parent = node.parentElement;
                while (parent && parent !== articleBody) {
                    if (parent.matches && parent.matches(excludeSelectors)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    parent = parent.parentElement;
                }
                // Skip if text is too short or just whitespace
                if (!node.textContent || node.textContent.trim().length < 3) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    // Collect all text nodes first (modifying during walk causes issues)
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }

    // Process each text node
    for (const textNode of textNodes) {
        let text = textNode.textContent;
        let hasMatch = false;
        const replacements = [];

        // Check each wiki entry
        for (const entry of wikiIndex) {
            // Skip self-references
            if (entry.title === currentItemTitle) continue;

            // Create a regex that matches the title as a whole word
            // Use word boundaries but also allow for possessives ('s)
            const escapedTitle = entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b(${escapedTitle})(?:'s)?\\b`, 'gi');

            let match;
            while ((match = regex.exec(text)) !== null) {
                // Check if this position overlaps with an existing replacement
                const start = match.index;
                const end = match.index + match[0].length;
                const overlaps = replacements.some(r =>
                    (start >= r.start && start < r.end) ||
                    (end > r.start && end <= r.end) ||
                    (start <= r.start && end >= r.end)
                );

                if (!overlaps) {
                    hasMatch = true;
                    replacements.push({
                        start: start,
                        end: end,
                        matched: match[0],
                        title: entry.title,
                        id: entry.id,
                        category: entry.category
                    });
                }
            }
        }

        if (hasMatch && replacements.length > 0) {
            // Sort replacements by position (reverse order for safe replacement)
            replacements.sort((a, b) => b.start - a.start);

            // Build the new content
            const fragment = document.createDocumentFragment();
            let lastEnd = text.length;

            // Process in reverse order
            const parts = [];
            for (const r of replacements) {
                // Text after this replacement
                if (r.end < lastEnd) {
                    parts.unshift({ type: 'text', content: text.substring(r.end, lastEnd) });
                }
                // The wiki link
                parts.unshift({
                    type: 'link',
                    content: r.matched,
                    title: r.title,
                    id: r.id,
                    category: r.category
                });
                lastEnd = r.start;
            }
            // Text before the first replacement
            if (lastEnd > 0) {
                parts.unshift({ type: 'text', content: text.substring(0, lastEnd) });
            }

            // Create the fragment
            for (const part of parts) {
                if (part.type === 'text') {
                    fragment.appendChild(document.createTextNode(part.content));
                } else {
                    const link = document.createElement('span');
                    link.className = 'wiki-link';
                    link.dataset.target = part.title;
                    link.dataset.id = part.id;
                    link.dataset.category = part.category;
                    link.textContent = part.content;
                    fragment.appendChild(link);
                }
            }

            // Replace the text node with the fragment
            textNode.parentNode.replaceChild(fragment, textNode);
        }
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
                    lucide.createIcons();
                });

                // Click on name shows the parent location (first item in subcategory with matching name)
                subHeader.querySelector('.sub-name').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const parentItem = subData.find(i => i.title === subName);
                    if (parentItem) {
                        showItem(categoryName, parentItem, null);
                    } else {
                        // Just expand if no parent item
                        subSection.classList.toggle('expanded');
                        lucide.createIcons();
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
                        showItem(categoryName, item, navItem);
                    });
                    subItems.appendChild(navItem);
                });

                subSection.appendChild(subHeader);
                subSection.appendChild(subItems);
                items.appendChild(subSection);
            }
        }

        // Regular items (not in subcategories)
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

    // Clear URL hash
    updateHash();

    // Update breadcrumb
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-home">Compendium</span>
    `;

    // Clear active states
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-category.open').forEach(el => el.classList.remove('open'));

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
            <!-- Weeping Winged Statue - Aedwynn -->
            <img src="Assets/Weeping Statue.webp" alt="Aedwynn, The Weeping Angel" class="welcome-sigil">

            <h1 class="welcome-title">The Ashen Realms</h1>
            <p class="welcome-subtitle">
                A chronicle of thirteen thrones built on the corpse of a murdered god,
                and those who dare to walk between them.
            </p>

            <div class="welcome-quote">
                <p>${footerQuotes[Math.floor(Math.random() * footerQuotes.length)]}</p>
            </div>

            <div class="welcome-stats">
                ${statsHtml}
            </div>
        </div>
    `;

    lucide.createIcons();
}

// ===== CATEGORY OVERVIEW =====
function openCategory(categoryName, skipHash = false) {
    const categoryData = data[categoryName];
    if (!categoryData) return;

    currentItem = null;
    currentCategory = categoryName;

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
function showItem(categoryName, item, navElement = null, skipHash = false) {
    currentItem = item;
    currentCategory = categoryName;

    // Update URL hash
    if (!skipHash) {
        updateHash(categoryName, item.id);
    }

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
        <span class="breadcrumb-category" style="cursor:pointer" onclick="openCategory('${categoryName}')">${categoryName}</span>
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

    // Render article
    const contentBody = document.getElementById('content-body');
    contentBody.innerHTML = `
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

    // Optimize images (WebP conversion + lazy loading)
    optimizeContentImages(contentBody);

    // Generate table of contents for long articles
    generateTableOfContents(contentBody, categoryName);

    // Auto-link references to other entries
    const articleBody = contentBody.querySelector('.article-body');
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

    lucide.createIcons();

    // Update bookmark button state
    updateBookmarkButton();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== TABLE OF CONTENTS =====
function generateTableOfContents(contentBody, categoryName) {
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

    // For NPCs and Creatures, check if there's an image to place beside TOC
    const shouldWrapWithImage = ['NPCs', 'Creatures'].includes(categoryName);
    let firstImage = null;

    if (shouldWrapWithImage) {
        // Find the first image (npc-portrait or content-image)
        firstImage = articleBody.querySelector('.npc-portrait, img.content-image');
        if (firstImage) {
            firstImage.remove();
        }
    }

    const tocHtml = `
        <div class="article-toc">
            <div class="toc-header">
                <i data-lucide="list"></i>
                <span>Contents</span>
            </div>
            <nav class="toc-nav">
                ${tocItems}
            </nav>
        </div>
    `;

    // If we have an image and should wrap, create a flex container
    if (firstImage && shouldWrapWithImage) {
        const wrapper = document.createElement('div');
        wrapper.className = 'toc-image-wrapper';
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
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    lucide.createIcons();
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

// ===== LOADING SKELETON =====
function showLoadingSkeleton() {
    document.getElementById('content-body').innerHTML = `
        <div class="article skeleton-container">
            <header class="article-header">
                <div class="skeleton skeleton-header"></div>
                <div class="skeleton-meta">
                    <div class="skeleton skeleton-tag"></div>
                    <div class="skeleton skeleton-tag"></div>
                    <div class="skeleton skeleton-tag"></div>
                </div>
            </header>
            <div class="article-body">
                <div class="skeleton-paragraph">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                </div>
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton-paragraph">
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                    <div class="skeleton skeleton-line"></div>
                </div>
            </div>
        </div>
    `;
}

// ===== 404 NOT FOUND PAGE =====
function showNotFound(searchTerm = '') {
    currentItem = null;
    currentCategory = null;

    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-home" style="cursor:pointer" onclick="showWelcome()">Compendium</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Not Found</span>
    `;

    document.getElementById('content-body').innerHTML = `
        <div class="not-found-container">
            <i data-lucide="ghost" class="not-found-icon"></i>
            <h1 class="not-found-title">Lost in the Ash</h1>
            <p class="not-found-message">
                ${searchTerm
                    ? `The entry "${searchTerm}" could not be found in the chronicles. Perhaps it has been consumed by the void.`
                    : `This page seems to have faded from existence. The knowledge you seek may lie elsewhere.`
                }
            </p>
            <div class="not-found-actions">
                <button class="not-found-btn" onclick="showWelcome()">
                    <i data-lucide="home"></i>
                    Return Home
                </button>
                <button class="not-found-btn" onclick="goToRandomArticle()">
                    <i data-lucide="shuffle"></i>
                    Random Article
                </button>
                <button class="not-found-btn" onclick="openSearchModal()">
                    <i data-lucide="search"></i>
                    Search
                </button>
            </div>
        </div>
    `;

    lucide.createIcons();
}

// ===== SEARCH =====
let selectedSearchIndex = -1;

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
        selectedSearchIndex = -1; // Reset selection on new input
        debounceTimer = setTimeout(() => {
            performModalSearch(e.target.value);
        }, 150);
    });

    // Keyboard navigation in search
    modalSearchInput.addEventListener('keydown', (e) => {
        const results = document.querySelectorAll('.search-result-item');
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
        // Don't trigger if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Ctrl/Cmd + K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }

        // Escape to close modal
        if (e.key === 'Escape') {
            closeSearchModal();
        }

        // J = Next article, K = Previous article
        if (e.key === 'j' || e.key === 'J') {
            e.preventDefault();
            navigateToAdjacentArticle(1);
        }
        if (e.key === 'k' || e.key === 'K') {
            e.preventDefault();
            navigateToAdjacentArticle(-1);
        }

        // ? = Show keyboard shortcuts help
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showKeyboardHelp();
        }
    });
}

function navigateToAdjacentArticle(direction) {
    if (!currentCategory || !currentItem) return;

    const categoryData = data[currentCategory];
    if (!categoryData) return;

    const items = categoryData.items;
    const currentIndex = items.findIndex(i => i.id === currentItem.id);

    if (currentIndex === -1) return;

    // Calculate new index with wrap-around
    const newIndex = (currentIndex + direction + items.length) % items.length;
    const newItem = items[newIndex];

    const navItem = document.querySelector(`.nav-item[data-id="${newItem.id}"]`);
    showItem(currentCategory, newItem, navItem);
}

function showKeyboardHelp() {
    const existingHelp = document.getElementById('keyboard-help');
    if (existingHelp) {
        existingHelp.remove();
        return;
    }

    const helpModal = document.createElement('div');
    helpModal.id = 'keyboard-help';
    helpModal.className = 'keyboard-help-modal';
    helpModal.innerHTML = `
        <div class="keyboard-help-backdrop"></div>
        <div class="keyboard-help-content">
            <h3>Keyboard Shortcuts</h3>
            <div class="keyboard-help-list">
                <div class="keyboard-help-item">
                    <kbd>J</kbd>
                    <span>Next article in category</span>
                </div>
                <div class="keyboard-help-item">
                    <kbd>K</kbd>
                    <span>Previous article in category</span>
                </div>
                <div class="keyboard-help-item">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    <span>Open search</span>
                </div>
                <div class="keyboard-help-item">
                    <kbd>Esc</kbd>
                    <span>Close modal</span>
                </div>
                <div class="keyboard-help-item">
                    <kbd>?</kbd>
                    <span>Toggle this help</span>
                </div>
            </div>
            <button class="keyboard-help-close" onclick="document.getElementById('keyboard-help').remove()">Close</button>
        </div>
    `;
    document.body.appendChild(helpModal);

    // Close on backdrop click
    helpModal.querySelector('.keyboard-help-backdrop').addEventListener('click', () => {
        helpModal.remove();
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

// ===== TOP BAR ACTIONS (Random Article, Copy Link, Font Size, Bookmarks) =====
function setupTopBarActions() {
    const randomBtn = document.getElementById('random-article-btn');
    const copyBtn = document.getElementById('copy-link-btn');
    const fontBtn = document.getElementById('font-size-btn');
    const bookmarkBtn = document.getElementById('bookmark-btn');

    // Random article button
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            goToRandomArticle();
        });
    }

    // Copy link button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyCurrentLink(copyBtn);
        });
    }

    // Bookmark button
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            toggleBookmark();
        });
    }
}

// ===== BOOKMARKS/FAVORITES =====
function getBookmarks() {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
}

function saveBookmarks(bookmarks) {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function isBookmarked(categoryName, itemId) {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.category === categoryName && b.id === itemId);
}

function toggleBookmark() {
    if (!currentItem || !currentCategory) {
        showNotification('Navigate to an article to bookmark it');
        return;
    }

    const bookmarks = getBookmarks();
    const existingIndex = bookmarks.findIndex(
        b => b.category === currentCategory && b.id === currentItem.id
    );

    const bookmarkBtn = document.getElementById('bookmark-btn');

    if (existingIndex >= 0) {
        // Remove bookmark
        bookmarks.splice(existingIndex, 1);
        bookmarkBtn.classList.remove('bookmarked');
        showNotification('Bookmark removed');
    } else {
        // Add bookmark
        bookmarks.push({
            category: currentCategory,
            id: currentItem.id,
            title: currentItem.title,
            timestamp: Date.now()
        });
        bookmarkBtn.classList.add('bookmarked');
        showNotification('Article bookmarked!');
    }

    saveBookmarks(bookmarks);
}

function updateBookmarkButton() {
    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (!bookmarkBtn) return;

    if (currentItem && currentCategory && isBookmarked(currentCategory, currentItem.id)) {
        bookmarkBtn.classList.add('bookmarked');
    } else {
        bookmarkBtn.classList.remove('bookmarked');
    }
}

function goToRandomArticle() {
    // Gather all items from all categories
    const allItems = [];
    for (const [categoryName, categoryData] of Object.entries(data)) {
        for (const item of categoryData.items) {
            allItems.push({ category: categoryName, item: item });
        }
    }

    if (allItems.length === 0) return;

    // Pick a random item
    const randomIndex = Math.floor(Math.random() * allItems.length);
    const { category, item } = allItems[randomIndex];

    // Navigate to it
    const navItem = document.querySelector(`.nav-item[data-id="${item.id}"]`);
    showItem(category, item, navItem);
}

function copyCurrentLink(btn) {
    const url = window.location.href;

    navigator.clipboard.writeText(url).then(() => {
        // Show feedback
        btn.classList.add('copied');
        let icon = btn.querySelector('svg');
        if (icon) {
            icon.setAttribute('data-lucide', 'check');
            lucide.createIcons();
        }

        // Reset after delay - re-query the icon since lucide.createIcons() replaces it
        setTimeout(() => {
            btn.classList.remove('copied');
            icon = btn.querySelector('svg');
            if (icon) {
                icon.setAttribute('data-lucide', 'link');
                lucide.createIcons();
            }
        }, 2000);

        showNotification('Link copied to clipboard!');
    }).catch(() => {
        showNotification('Failed to copy link');
    });
}

// ===== BACK TO TOP BUTTON =====
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    const progressBar = document.getElementById('reading-progress');

    // Throttle scroll handler for better performance
    let ticking = false;

    // Show/hide button and update progress based on scroll position
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Back to top button visibility
                if (backToTopBtn) {
                    if (scrollY > 300) {
                        backToTopBtn.classList.add('visible');
                    } else {
                        backToTopBtn.classList.remove('visible');
                    }
                }

                // Reading progress indicator
                if (progressBar) {
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
                    progressBar.style.width = `${Math.min(100, progress)}%`;
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Scroll to top when clicked
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
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
