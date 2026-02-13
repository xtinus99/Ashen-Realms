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
    "Between shadow and flame, truth awaits.",
    "Every sovereign casts a long shadow.",
    "The faithful pray. The wise prepare.",
    "Blood remembers what flesh forgets.",
    "In the silence between heartbeats, they listen.",
    "All roads lead to ruin. Choose yours carefully.",
    "The dead do not stay buried in these lands.",
    "Power has a price. Divinity demands more.",
    "What was torn asunder seeks to be whole.",
    "Trust is a currency spent only once.",
    "The throne room echoes with the screams of gods.",
    "Some doors, once opened, cannot be closed.",
    "Memory is the cruelest wound.",
    "They divided a god. They became monsters.",
    "Hope is the last lie we tell ourselves.",
    "The Usurpation was not the end. It was the beginning.",
    "I will hit you."
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
    setupBondsLink();
    setupSpellsLink();
    initAudio();
    setupAudioControls();
    initParticles();
    initSmoothScroll();
    setupSwipeGestures();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Fix Leaflet marker icon paths for self-hosting
    if (typeof L !== 'undefined') {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'vendor/images/marker-icon-2x.png',
            iconUrl: 'vendor/images/marker-icon.png',
            shadowUrl: 'vendor/images/marker-shadow.png'
        });
    }

    // Check for URL hash to restore state
    if (!restoreFromHash()) {
        showWelcome();
    }

    // Listen for back/forward navigation
    window.addEventListener('hashchange', () => {
        if (!restoreFromHash()) {
            showWelcome();
        }
    });
});

// ===== TSPARTICLES - FLOATING ASH/EMBERS =====
function initParticles() {
    if (typeof tsParticles === 'undefined') return;

    tsParticles.load("tsparticles", {
        fullScreen: false,
        fpsLimit: 60,
        background: {
            color: "transparent"
        },
        particles: {
            number: {
                value: 35,
                density: {
                    enable: true,
                    area: 1200
                }
            },
            color: {
                value: ["#c9a227", "#e8d59e", "#8b1a32", "#ff6b35"]
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: { min: 0.15, max: 0.4 },
                animation: {
                    enable: true,
                    speed: 0.3,
                    minimumValue: 0.1,
                    sync: false
                }
            },
            size: {
                value: { min: 1, max: 3 },
                animation: {
                    enable: false
                }
            },
            move: {
                enable: true,
                speed: 0.4,
                direction: "top",
                random: false,
                straight: false,
                outModes: {
                    default: "out"
                },
                drift: 0
            },
            wobble: {
                enable: true,
                distance: 3,
                speed: 1
            },
            twinkle: {
                particles: {
                    enable: true,
                    frequency: 0.02,
                    opacity: 0.6,
                    color: {
                        value: "#c9a227"
                    }
                }
            }
        },
        detectRetina: true
    });
}

// ===== LENIS SMOOTH SCROLL =====
let lenisInstance = null;
let lenisRafId = null;

function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    if (lenisInstance) return; // Already initialized

    lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        prevent: (node) => {
            // Allow native scrolling for elements with data-lenis-prevent
            return node.closest('[data-lenis-prevent]') !== null;
        }
    });

    function raf(time) {
        if (lenisInstance) {
            lenisInstance.raf(time);
            lenisRafId = requestAnimationFrame(raf);
        }
    }

    lenisRafId = requestAnimationFrame(raf);

    // Integrate with GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenisInstance.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
            if (lenisInstance) lenisInstance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }
}

function destroySmoothScroll() {
    if (lenisRafId) {
        cancelAnimationFrame(lenisRafId);
        lenisRafId = null;
    }
    if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
    }
    // Remove any Lenis classes from html
    document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
}

// ===== SPLITTING.JS TEXT ANIMATIONS =====
function initSplitText(selector) {
    if (typeof Splitting === 'undefined') return;

    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
        if (el.dataset.split) return; // Already split
        el.dataset.split = 'true';
        Splitting({ target: el, by: 'chars' });

        // Animate the characters with GSAP
        const chars = el.querySelectorAll('.char');
        if (chars.length && typeof gsap !== 'undefined') {
            gsap.fromTo(chars,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.05,
                    stagger: 0.02,
                    ease: 'power2.out'
                }
            );
        }
    });
}

function setupLogoClick() {
    const sigil = document.getElementById('sigil-icon');

    // Only sigil click navigates home (with divine glow pulse animation)
    if (sigil) {
        sigil.style.cursor = 'pointer';
        sigil.addEventListener('click', (e) => {
            e.stopPropagation();
            sigil.classList.add('divine-pulse');
            // Remove class after animation completes
            setTimeout(() => {
                sigil.classList.remove('divine-pulse');
            }, 600);
            // Navigate home
            showWelcome();
            // Close mobile sidebar if open
            document.getElementById('sidebar').classList.remove('open');
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
        // Skip images with data-no-zoom (like easter egg)
        if (img.hasAttribute('data-no-zoom')) {
            img.style.opacity = '1';
            return;
        }

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

// ===== IMAGE ZOOM (Medium-Zoom) =====
let mediumZoomInstance = null;

function setupImageZoom() {
    // Initialize Medium-Zoom with custom styling
    // mediumZoom returns a zoom instance we can use to attach/detach images
    mediumZoomInstance = mediumZoom({
        margin: 40,
        background: 'rgba(10, 10, 12, 0.95)',
        scrollOffset: 0
    });
}

function attachImageZoom() {
    // Attach zoom to new images in content, excluding certain elements
    const contentBody = document.getElementById('content-body');
    if (!contentBody) return;

    // Select all images that should be zoomable
    const images = contentBody.querySelectorAll('img:not(.welcome-sigil):not([data-no-zoom]):not([data-zoom-attached])');

    images.forEach(img => {
        // Skip if is a thumbnail in entry list or bond card
        if (img.closest('.entry-portrait') || img.closest('.card-portrait')) return;

        // Mark as attached to prevent double-attachment
        img.dataset.zoomAttached = 'true';
        img.style.cursor = 'zoom-in';

        // Attach to medium-zoom instance
        if (mediumZoomInstance) {
            mediumZoomInstance.attach(img);
        }
    });
}

// Legacy function name for compatibility
function setupLightbox() {
    setupImageZoom();
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

    // Handle bonds page
    if (hash === 'bonds') {
        showRelationships();
        return true;
    }

    // Handle spells page
    if (hash === 'spells') {
        showSpells();
        return true;
    }

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
            showItem(categoryName, item, navItem, true, true); // skip hash update, skip scroll to top
            // Restore scroll position after content loads
            restoreScrollPosition();
            return true;
        } else {
            // Item not found in category
            showNotFound(itemId);
            return true;
        }
    } else {
        openCategory(categoryName, true, true); // skip hash update, skip scroll to top
        // Restore scroll position after content loads
        restoreScrollPosition();
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

    // Categories where first names should also be indexed
    const firstNameCategories = ['Party', 'NPCs', 'Sovereigns'];

    // First pass: collect all first names to detect duplicates
    const firstNameCount = {};
    for (const [categoryName, categoryData] of Object.entries(data)) {
        if (firstNameCategories.includes(categoryName)) {
            for (const item of categoryData.items) {
                const parts = item.title.split(' ');
                if (parts.length >= 2 && parts[0] !== 'The' && parts[0].length > 2) {
                    const firstName = parts[0];
                    firstNameCount[firstName] = (firstNameCount[firstName] || 0) + 1;
                }
            }
        }
    }

    // Second pass: build the index
    for (const [categoryName, categoryData] of Object.entries(data)) {
        for (const item of categoryData.items) {
            wikiIndex.push({
                title: item.title,
                id: item.id,
                category: categoryName
            });

            // For Party and NPCs, also index first name as alias (only if unique)
            if (firstNameCategories.includes(categoryName)) {
                const parts = item.title.split(' ');
                if (parts.length >= 2 && parts[0] !== 'The' && parts[0].length > 2) {
                    const firstName = parts[0];
                    // Only add if first name is unique (not shared by multiple characters)
                    if (firstName !== item.title && firstNameCount[firstName] === 1) {
                        wikiIndex.push({
                            title: firstName,
                            id: item.id,
                            category: categoryName,
                            isAlias: true,
                            fullTitle: item.title
                        });
                    }
                }
            }
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
            // Negative lookbehind (?<!') prevents matching after apostrophe (e.g., "Kael" in "Vor'Kael")
            const escapedTitle = entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(?<!')\\b(${escapedTitle})(?:'s)?\\b`, 'gi');

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
                        title: entry.fullTitle || entry.title,
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

// ===== WIKI-LINK TOOLTIPS (Tippy.js) =====
function initWikiLinkTooltips() {
    // Find all wiki-links that don't have tooltips yet
    const wikiLinks = document.querySelectorAll('.wiki-link:not([data-tippy-root])');

    wikiLinks.forEach(link => {
        const targetName = link.dataset.target;
        const category = link.dataset.category;

        // Find the item data to build tooltip content
        const itemData = findItemByTitle(targetName);
        if (!itemData) return;

        // Build tooltip content
        let tooltipContent = `<div class="wiki-tooltip">`;
        tooltipContent += `<div class="wiki-tooltip-header">`;
        tooltipContent += `<span class="wiki-tooltip-title">${itemData.title}</span>`;
        tooltipContent += `<span class="wiki-tooltip-category">${category || 'Entry'}</span>`;
        tooltipContent += `</div>`;

        // Add a preview of the description if available
        if (itemData.summary || itemData.description) {
            let preview = itemData.summary || itemData.description;
            // Strip HTML and truncate
            preview = preview.replace(/<[^>]+>/g, '').substring(0, 120);
            if (preview.length === 120) preview += '...';
            tooltipContent += `<div class="wiki-tooltip-preview">${preview}</div>`;
        }

        tooltipContent += `<div class="wiki-tooltip-hint">Click to view</div>`;
        tooltipContent += `</div>`;

        // Initialize Tippy tooltip
        tippy(link, {
            content: tooltipContent,
            allowHTML: true,
            placement: 'top',
            animation: 'shift-away',
            theme: 'ashen',
            delay: [300, 0],
            duration: [200, 150],
            interactive: false,
            appendTo: document.body
        });
    });
}

// Helper to find item data by title
function findItemByTitle(title) {
    for (const [categoryName, categoryData] of Object.entries(data)) {
        // Check main items
        const items = categoryData.items || [];
        const found = items.find(item =>
            item.title === title ||
            item.id === title ||
            (item.aliases && item.aliases.includes(title))
        );
        if (found) {
            return { ...found, category: categoryName };
        }

        // Check subcategories
        if (categoryData.subcategories) {
            for (const [subName, subData] of Object.entries(categoryData.subcategories)) {
                const subItems = subData.items || [];
                const subFound = subItems.find(item =>
                    item.title === title ||
                    item.id === title ||
                    (item.aliases && item.aliases.includes(title))
                );
                if (subFound) {
                    return { ...subFound, category: categoryName, subcategory: subName };
                }
            }
        }
    }
    return null;
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
                        lucide.createIcons();
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
                            showItem(categoryName, item, navItem);
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
                    showItem(categoryName, item, navItem);
                });
                items.appendChild(navItem);
            });
        }

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

    // Re-enable Lenis smooth scroll (may have been destroyed for spell compendium)
    initSmoothScroll();

    // Disable full-width mode
    document.getElementById('content-body').classList.remove('full-width');

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
function openCategory(categoryName, skipHash = false, skipScrollToTop = false) {
    const categoryData = data[categoryName];
    if (!categoryData) return;

    currentItem = null;
    currentCategory = categoryName;

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

    lucide.createIcons();

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');

    // Scroll to top (unless restoring from hash with saved scroll position)
    if (!skipScrollToTop) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===== SESSION TIMELINE =====
function generateSessionTimeline(sessions) {
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

// ===== RELATIONSHIP MAP =====
function showRelationshipMap() {
    // Remove existing modal
    const existing = document.getElementById('relationship-map-modal');
    if (existing) {
        existing.remove();
        return;
    }

    // Build nodes from Party, NPCs, and Sovereigns
    const nodes = [];
    const nodeMap = new Map();
    const categories = ['Party', 'NPCs', 'Sovereigns'];

    for (const cat of categories) {
        if (data[cat]) {
            for (const item of data[cat].items) {
                const node = {
                    id: item.id,
                    title: item.title,
                    category: cat,
                    raw: item.raw || '',
                    connections: []
                };
                nodes.push(node);
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
        for (const [name, targetNode] of nodeMap) {
            if (targetNode.id !== node.id && node.raw.includes(name)) {
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
    modal.innerHTML = `
        <div class="relationship-map-backdrop"></div>
        <div class="relationship-map-content">
            <div class="relationship-map-header">
                <h3><i data-lucide="git-merge"></i> Character Relationships</h3>
                <div class="relationship-map-legend">
                    <span class="legend-item legend-party"><span class="legend-dot"></span> Party</span>
                    <span class="legend-item legend-npc"><span class="legend-dot"></span> NPCs</span>
                    <span class="legend-item legend-sovereign"><span class="legend-dot"></span> Sovereigns</span>
                </div>
                <button class="relationship-map-close" aria-label="Close">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="relationship-map-container">
                <svg id="relationship-svg"></svg>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();

    // Close handlers
    modal.querySelector('.relationship-map-backdrop').addEventListener('click', () => modal.remove());
    modal.querySelector('.relationship-map-close').addEventListener('click', () => modal.remove());

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
        const displayName = node.title.length > 15 ? node.title.substring(0, 12) + '...' : node.title;
        text.textContent = displayName;

        g.appendChild(circle);
        g.appendChild(text);

        // Click to navigate
        g.style.cursor = 'pointer';
        g.addEventListener('click', () => {
            document.getElementById('relationship-map-modal').remove();
            navigateToItem(node.id);
        });

        nodesGroup.appendChild(g);
    }
    svg.appendChild(nodesGroup);
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
function showItem(categoryName, item, navElement = null, skipHash = false, skipScrollToTop = false) {
    currentItem = item;
    currentCategory = categoryName;

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

    // Remove duplicate H1 if it matches the article title, insert easter egg in its place
    // Remove duplicate H1 if it matches the article title
    const articleBody = contentBody.querySelector('.article-body');
    const firstH1 = articleBody?.querySelector('h1:first-child');
    if (firstH1 && firstH1.textContent.trim().toLowerCase() === item.title.toLowerCase()) {
        firstH1.remove();
    }

    // Setup easter egg click handler if present
    const easterEgg = articleBody?.querySelector('.easter-egg');
    if (easterEgg) {
        easterEgg.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.className = 'easter-egg-overlay';
            overlay.innerHTML = `
                <div class="easter-egg-modal">
                    <img src="images/fragment-aedwynn.png" alt="Fragment of Aedwynn">
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

    lucide.createIcons();

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ===== INTERACTIVE WORLD MAP =====
let worldMapInstance = null;
let mapDataCache = null;

async function initWorldMap(contentBody) {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.warn('Leaflet not loaded yet, retrying...');
        setTimeout(() => initWorldMap(contentBody), 200);
        return;
    }

    // Find the world-map div and replace it
    const worldMapDiv = contentBody.querySelector('.world-map');
    if (!worldMapDiv) return;

    // Create the map container
    const mapContainer = document.createElement('div');
    mapContainer.id = 'world-map-container';
    worldMapDiv.replaceWith(mapContainer);

    // Clean up any previous map instance
    if (worldMapInstance) {
        worldMapInstance.remove();
        worldMapInstance = null;
    }

    // Image dimensions
    const imgWidth = 1536;
    const imgHeight = 1024;

    // Create the Leaflet map with CRS.Simple (image coordinates)
    const bounds = [[0, 0], [imgHeight, imgWidth]];
    const map = L.map('world-map-container', {
        crs: L.CRS.Simple,
        minZoom: -1,
        maxZoom: 3,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        doubleClickZoom: false,
        zoomAnimation: false,
        attributionControl: false
    });

    // Add the map image as an overlay
    L.imageOverlay('images/world-map.webp', bounds).addTo(map);
    map.fitBounds(bounds);

    // Set maxBounds with padding so the map doesn't fight at edges
    map.setMaxBounds([[-100, -100], [imgHeight + 100, imgWidth + 100]]);

    worldMapInstance = map;

    // Load marker data
    try {
        const response = await fetch('map-data.json?v=' + Date.now());
        const mapData = await response.json();
        addMapMarkers(map, mapData);
    } catch (err) {
        console.error('Failed to load map data:', err);
    }

    // Add legend
    addMapLegend(mapContainer);

    // Add coordinate helper hint
    const hint = document.createElement('div');
    hint.className = 'map-hint';
    hint.textContent = 'Shift+Click to get coordinates';
    mapContainer.appendChild(hint);

    // Coordinate helper: Shift+Click to get coords
    const toast = document.createElement('div');
    toast.className = 'map-coord-toast';
    mapContainer.appendChild(toast);

    map.on('click', function (e) {
        if (e.originalEvent.shiftKey) {
            const lat = Math.round(e.latlng.lat);
            const lng = Math.round(e.latlng.lng);
            const coordText = `[${lat}, ${lng}]`;
            toast.textContent = `Coords: ${coordText} (copied!)`;
            toast.classList.add('visible');

            // Copy to clipboard
            navigator.clipboard.writeText(coordText).catch(() => {});

            // Also log to console with more detail
            console.log(`Map coordinates: ${coordText} — Pixel (x=${lng}, y=${imgHeight - lat})`);

            setTimeout(() => toast.classList.remove('visible'), 2500);
        }
    });

    // Force a resize after a brief delay (Leaflet needs this when container is new)
    setTimeout(() => map.invalidateSize(), 100);
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
                    navigateToItemById(category, id);
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
        // Use word boundary check
        const regex = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(text);
    }

    // Search through all categories and items
    for (const [categoryName, categoryData] of Object.entries(data)) {
        for (const item of categoryData.items) {
            // Skip self
            if (item.id === currentId) continue;

            // Check if this item's content mentions the current item (full title only)
            if (item.raw && containsName(item.raw, currentTitle)) {
                incomingLinks.push({
                    category: categoryName,
                    item: item,
                    icon: categoryData.info?.icon || 'file-text'
                });
            }

            // Check if current item mentions this item (full title only)
            if (currentItem.raw && containsName(currentItem.raw, item.title)) {
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

    lucide.createIcons();
}

// ===== SESSION NAVIGATION =====
function addSessionNavigation(contentBody, currentItem) {
    const article = contentBody.querySelector('.article');
    if (!article) return;

    const sessions = data['Sessions']?.items || [];
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

    lucide.createIcons();
}

// ===== SWIPE GESTURES FOR MOBILE =====
function setupSwipeGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const minSwipeDistance = 80;
    const maxVerticalDistance = 100;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        // Only handle swipes for Sessions
        if (currentCategory !== 'Sessions' || !currentItem) return;

        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // Ignore if vertical movement is too large (user is scrolling)
        if (deltaY > maxVerticalDistance) return;

        // Ignore if horizontal movement is too small
        if (Math.abs(deltaX) < minSwipeDistance) return;

        const sessions = data['Sessions']?.items || [];
        const currentIndex = sessions.findIndex(s => s.id === currentItem.id);
        if (currentIndex === -1) return;

        if (deltaX > 0) {
            // Swipe right = previous session
            if (currentIndex > 0) {
                const prevSession = sessions[currentIndex - 1];
                const navItem = document.querySelector(`.nav-item[data-id="${prevSession.id}"]`);
                showItem('Sessions', prevSession, navItem);
                showSwipeIndicator('left');
            }
        } else {
            // Swipe left = next session
            if (currentIndex < sessions.length - 1) {
                const nextSession = sessions[currentIndex + 1];
                const navItem = document.querySelector(`.nav-item[data-id="${nextSession.id}"]`);
                showItem('Sessions', nextSession, navItem);
                showSwipeIndicator('right');
            }
        }
    }
}

function showSwipeIndicator(direction) {
    // Remove existing indicator
    const existing = document.querySelector('.swipe-indicator');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.className = `swipe-indicator ${direction}`;
    indicator.innerHTML = direction === 'left'
        ? '<i data-lucide="chevron-left"></i>'
        : '<i data-lucide="chevron-right"></i>';
    document.body.appendChild(indicator);

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Remove after animation
    setTimeout(() => indicator.remove(), 500);
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
        // Search top-level items
        for (const item of categoryData.items) {
            const normalizedItem = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (normalizedItem.includes(normalizedTarget) || normalizedTarget.includes(normalizedItem)) {
                // Find the nav element
                const navItem = document.querySelector(`.nav-item[data-id="${item.id}"]`);
                showItem(categoryName, item, navItem);
                return;
            }
        }

        // Search subcategories (nested items like The Silken Refuge under Crownfall)
        if (categoryData.subcategories) {
            for (const [subName, subItems] of Object.entries(categoryData.subcategories)) {
                for (const item of subItems) {
                    const normalizedItem = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (normalizedItem.includes(normalizedTarget) || normalizedTarget.includes(normalizedItem)) {
                        const navItem = document.querySelector(`.nav-item[data-id="${item.id}"]`);
                        showItem(categoryName, item, navItem);
                        return;
                    }
                }
            }
        }
    }

    // Not found - show subtle notification
    showNotification(`"${targetName}" is not in the compendium — it may be hidden knowledge.`);
}

function showNotification(message, duration = 3000) {
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
    }, duration);
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

// Track active search filters
let activeSearchFilters = new Set();

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

function openSearchModal() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('modal-search');
    modal.classList.add('open');
    input.focus();
    input.value = '';
    activeSearchFilters.clear();

    // Build filter chips with number hints (none active = search all)
    const filtersContainer = document.getElementById('search-filters');
    const categories = Object.keys(data);
    filtersContainer.innerHTML = categories.map((cat, index) => {
        const icon = data[cat]?.info?.icon || 'folder';
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
        // Skip categories that aren't selected (if filters have been set up)
        if (activeSearchFilters.size > 0 && !activeSearchFilters.has(categoryName)) {
            continue;
        }

        // Search main items
        if (categoryData.items) {
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

        // Search subcategories
        if (categoryData.subcategories) {
            for (const [subName, subItems] of Object.entries(categoryData.subcategories)) {
                for (const item of subItems) {
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
            <div class="search-result-preview">${getPreview(r.item.raw, query)}</div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
            const category = el.dataset.category;
            const id = el.dataset.id;

            // Search in main items first
            let item = data[category].items?.find(i => i.id === id);

            // If not found, search in subcategories
            if (!item && data[category].subcategories) {
                for (const subItems of Object.values(data[category].subcategories)) {
                    item = subItems.find(i => i.id === id);
                    if (item) break;
                }
            }

            if (item) {
                closeSearchModal();
                const navItem = document.querySelector(`.nav-item[data-id="${id}"]`);
                showItem(category, item, navItem);
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

        // B = Toggle bookmark on current article
        if (e.key === 'b' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            toggleBookmark();
        }

        // Shift+B = Show bookmarks list
        if (e.key === 'B' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            showBookmarksList();
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
            <div class="keyboard-help-sections">
                <div class="keyboard-help-section">
                    <h4>Navigation</h4>
                    <div class="keyboard-help-list">
                        <div class="keyboard-help-item">
                            <kbd>J</kbd>
                            <span>Next article in category</span>
                        </div>
                        <div class="keyboard-help-item">
                            <kbd>K</kbd>
                            <span>Previous article in category</span>
                        </div>
                    </div>
                </div>
                <div class="keyboard-help-section">
                    <h4>Search</h4>
                    <div class="keyboard-help-list">
                        <div class="keyboard-help-item">
                            <kbd>Ctrl</kbd> + <kbd>K</kbd>
                            <span>Open search</span>
                        </div>
                        <div class="keyboard-help-item">
                            <kbd>1</kbd> - <kbd>9</kbd>
                            <span>Toggle category filters</span>
                        </div>
                        <div class="keyboard-help-item">
                            <kbd>0</kbd>
                            <span>Clear all filters</span>
                        </div>
                        <div class="keyboard-help-item">
                            <kbd>↑</kbd> <kbd>↓</kbd>
                            <span>Navigate results</span>
                        </div>
                        <div class="keyboard-help-item">
                            <kbd>Enter</kbd>
                            <span>Open selected result</span>
                        </div>
                    </div>
                </div>
                <div class="keyboard-help-section">
                    <h4>Bookmarks</h4>
                    <div class="keyboard-help-list">
                        <div class="keyboard-help-item">
                            <kbd>B</kbd>
                            <span>Bookmark current article</span>
                        </div>
                        <div class="keyboard-help-item">
                            <kbd>Shift</kbd> + <kbd>B</kbd>
                            <span>View all bookmarks</span>
                        </div>
                    </div>
                </div>
                <div class="keyboard-help-section">
                    <h4>General</h4>
                    <div class="keyboard-help-list">
                        <div class="keyboard-help-item">
                            <kbd>?</kbd>
                            <span>Toggle this help</span>
                        </div>
                        <div class="keyboard-help-item">
                            <kbd>Esc</kbd>
                            <span>Close modal</span>
                        </div>
                    </div>
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

function showBookmarksList() {
    const bookmarks = getBookmarks();

    // Remove existing modal if present
    const existing = document.getElementById('bookmarks-modal');
    if (existing) {
        existing.remove();
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'bookmarks-modal';
    modal.className = 'bookmarks-modal';

    let bookmarksHtml = '';
    if (bookmarks.length === 0) {
        bookmarksHtml = '<p class="bookmarks-empty">No bookmarks yet. Press <kbd>B</kbd> on any article to bookmark it.</p>';
    } else {
        bookmarksHtml = '<ul class="bookmarks-list">';
        for (const bookmark of bookmarks) {
            const categoryInfo = data[bookmark.category]?.info;
            const icon = categoryInfo?.icon || 'file-text';
            bookmarksHtml += `
                <li class="bookmarks-item" data-category="${bookmark.category}" data-id="${bookmark.id}">
                    <i data-lucide="${icon}"></i>
                    <div class="bookmarks-item-info">
                        <span class="bookmarks-item-title">${bookmark.title}</span>
                        <span class="bookmarks-item-category">${bookmark.category}</span>
                    </div>
                    <button class="bookmarks-remove" data-category="${bookmark.category}" data-id="${bookmark.id}" title="Remove bookmark">
                        <i data-lucide="x"></i>
                    </button>
                </li>
            `;
        }
        bookmarksHtml += '</ul>';
    }

    modal.innerHTML = `
        <div class="bookmarks-modal-backdrop"></div>
        <div class="bookmarks-modal-content">
            <div class="bookmarks-modal-header">
                <h3><i data-lucide="bookmark"></i> Bookmarks</h3>
                <button class="bookmarks-modal-close" aria-label="Close">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="bookmarks-modal-body">
                ${bookmarksHtml}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();

    // Close handlers
    modal.querySelector('.bookmarks-modal-backdrop').addEventListener('click', () => modal.remove());
    modal.querySelector('.bookmarks-modal-close').addEventListener('click', () => modal.remove());

    // Navigate to bookmark on click
    modal.querySelectorAll('.bookmarks-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.bookmarks-remove')) return;
            const category = item.dataset.category;
            const id = item.dataset.id;
            const categoryData = data[category];
            if (categoryData) {
                const itemData = categoryData.items.find(i => i.id === id);
                if (itemData) {
                    const navItem = document.querySelector(`.nav-item[data-id="${id}"]`);
                    showItem(category, itemData, navItem);
                    modal.remove();
                }
            }
        });
    });

    // Remove bookmark button
    modal.querySelectorAll('.bookmarks-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const category = btn.dataset.category;
            const id = btn.dataset.id;
            const bookmarks = getBookmarks();
            const index = bookmarks.findIndex(b => b.category === category && b.id === id);
            if (index !== -1) {
                bookmarks.splice(index, 1);
                saveBookmarks(bookmarks);
                btn.closest('.bookmarks-item').remove();
                updateBookmarkButton();
                if (bookmarks.length === 0) {
                    modal.querySelector('.bookmarks-modal-body').innerHTML =
                        '<p class="bookmarks-empty">No bookmarks yet. Press <kbd>B</kbd> on any article to bookmark it.</p>';
                }
            }
        });
    });
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

// ===== SCROLL POSITION PERSISTENCE =====
let scrollSaveTimeout = null;

function saveScrollPosition() {
    const hash = window.location.hash;
    if (hash) {
        localStorage.setItem('scrollPosition_' + hash, window.scrollY);
    }
}

function restoreScrollPosition() {
    const hash = window.location.hash;
    if (hash) {
        const savedPosition = localStorage.getItem('scrollPosition_' + hash);
        if (savedPosition !== null) {
            // Small delay to ensure content is rendered
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition, 10));
            }, 50);
        }
    }
}

// ===== BACK TO TOP BUTTON =====
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    const progressBar = document.getElementById('reading-progress');

    // Throttle scroll handler for better performance
    let ticking = false;
    let scrollTimeout = null;

    // Show/hide button and update progress based on scroll position
    window.addEventListener('scroll', () => {
        // Pause animations during scroll for better performance
        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 150);

        // Save scroll position (debounced)
        clearTimeout(scrollSaveTimeout);
        scrollSaveTimeout = setTimeout(saveScrollPosition, 200);

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

// ===== BONDS & STANDING (REPUTATION TRACKER) =====
const REP_TIERS = [
    { name: 'Hostile', min: 0, max: 5000, class: 'hostile' },
    { name: 'Hated', min: 5000, max: 7500, class: 'hated' },
    { name: 'Wary', min: 7500, max: 10000, class: 'wary' },
    { name: 'Neutral', min: 10000, max: 12500, class: 'neutral' },
    { name: 'Cordial', min: 12500, max: 17500, class: 'cordial' },
    { name: 'Friendly', min: 17500, max: 25000, class: 'friendly' },
    { name: 'Trusted', min: 25000, max: 35000, class: 'trusted' },
    { name: 'Sworn', min: 35000, max: 45000, class: 'sworn' },
    { name: 'Kindred', min: 45000, max: Infinity, class: 'kindred' }
];

let relationshipData = null;
let currentRepCharacter = 'sol';
let currentRepFilter = 'all';

function setupBondsLink() {
    const bondsLink = document.getElementById('bonds-link');
    if (bondsLink) {
        bondsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRelationships();
            document.getElementById('sidebar').classList.remove('open');
        });
    }
}

async function loadRelationshipData() {
    if (relationshipData) return relationshipData;
    try {
        const response = await fetch('relationships-data.json?v=' + Date.now());
        relationshipData = await response.json();
        return relationshipData;
    } catch (error) {
        console.error('Failed to load relationship data:', error);
        return null;
    }
}

function getRepTier(reputation) {
    for (let i = REP_TIERS.length - 1; i >= 0; i--) {
        if (reputation >= REP_TIERS[i].min) {
            return REP_TIERS[i];
        }
    }
    return REP_TIERS[0];
}

function getRepProgress(reputation) {
    const tier = getRepTier(reputation);
    const tierRange = tier.max - tier.min;
    const progress = reputation - tier.min;
    return {
        current: progress,
        needed: tierRange,
        percentage: Math.min(100, (progress / tierRange) * 100)
    };
}

async function showRelationships() {
    currentItem = null;
    currentCategory = null;

    await loadRelationshipData();
    if (!relationshipData) {
        document.getElementById('content-body').innerHTML = '<div class="welcome-container"><p>Failed to load relationship data.</p></div>';
        return;
    }

    // Enable full-width mode
    document.getElementById('content-body').classList.add('full-width');

    // Update URL
    window.location.hash = 'bonds';

    // Update breadcrumb
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-home" style="cursor:pointer" onclick="showWelcome()">Compendium</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Bonds & Standing</span>
    `;

    // Clear active states
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-category.open').forEach(el => el.classList.remove('open'));

    renderRelationshipsView();
}

// Image name mapping for NPCs whose file names don't match their display names
const REP_IMAGE_MAP = {
    "Kael's Echo": "Kael",
    "Aedwynn the Maker": "Aedwynn Fragment - Golden Tree",
    "Talaris Bloomrend": "Talaris Bloomrend the Verdant King",
    "The Church of Mareatha": null
};

// Character display names
const CHAR_NAMES = {
    sol: 'Sol Raven',
    fursen: 'Fursen',
    teldryn: 'Teldryn'
};

let selectedEntry = null;
let currentSort = 'reputation'; // 'reputation' or 'name'
let sortAscending = false; // false = descending (highest first), true = ascending (lowest first)

function renderRelationshipsView() {
    const characterData = relationshipData[currentRepCharacter];
    if (!characterData) return;

    let relationships = characterData.relationships;
    if (currentRepFilter !== 'all') {
        relationships = relationships.filter(r => r.category === currentRepFilter);
    }

    // Sort based on current sort mode and direction
    relationships.sort((a, b) => {
        if (a.permanentEnemy && !b.permanentEnemy) return -1;
        if (!a.permanentEnemy && b.permanentEnemy) return 1;

        let result;
        if (currentSort === 'name') {
            result = a.name.localeCompare(b.name);
        } else {
            result = b.reputation - a.reputation;
        }
        return sortAscending ? -result : result;
    });

    // Select first entry by default if none selected
    if (!selectedEntry || !relationships.find(r => r.name === selectedEntry)) {
        selectedEntry = relationships[0]?.name || null;
    }

    const selectedRel = relationships.find(r => r.name === selectedEntry);

    document.getElementById('content-body').innerHTML = `
        <div class="bonds-container">
            <div class="bonds-header">
                <button class="bonds-back-btn" id="bonds-back-btn">
                    <i data-lucide="arrow-left"></i>
                    <span>Back</span>
                </button>
                <div class="bonds-title-area">
                    <h1 class="bonds-title">Bonds & Standing</h1>
                    <p class="bonds-subtitle">The personal ledger of ${CHAR_NAMES[currentRepCharacter]}</p>
                </div>
            </div>

            <div class="bonds-controls">
                <div class="char-tabs">
                    <button class="char-tab ${currentRepCharacter === 'sol' ? 'active' : ''}" data-char="sol">
                        <span class="tab-name">Sol</span>
                    </button>
                    <button class="char-tab ${currentRepCharacter === 'fursen' ? 'active' : ''}" data-char="fursen">
                        <span class="tab-name">Fursen</span>
                    </button>
                    <button class="char-tab ${currentRepCharacter === 'teldryn' ? 'active' : ''}" data-char="teldryn">
                        <span class="tab-name">Teldryn</span>
                    </button>
                </div>

                <div class="bonds-filters">
                    <button class="filter-chip ${currentRepFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>
                    <button class="filter-chip ${currentRepFilter === 'sovereigns' ? 'active' : ''}" data-filter="sovereigns">Sovereigns</button>
                    <button class="filter-chip ${currentRepFilter === 'npcs' ? 'active' : ''}" data-filter="npcs">NPCs</button>
                    <button class="filter-chip ${currentRepFilter === 'factions' ? 'active' : ''}" data-filter="factions">Factions</button>
                    <div class="filter-divider"></div>
                    <button class="sort-chip ${currentSort === 'reputation' ? 'active' : ''}" data-sort="reputation">
                        <i data-lucide="${currentSort === 'reputation' ? (sortAscending ? 'arrow-up' : 'arrow-down') : 'trending-up'}"></i> Standing
                    </button>
                    <button class="sort-chip ${currentSort === 'name' ? 'active' : ''}" data-sort="name">
                        <i data-lucide="${currentSort === 'name' ? (sortAscending ? 'arrow-up' : 'arrow-down') : 'a-large-small'}"></i> Name
                    </button>
                </div>
            </div>

            <div class="bonds-layout">
                <div class="bonds-list">
                    ${relationships.map((rel, index) => renderBondCard(rel, index)).join('')}
                </div>
                <div class="bonds-detail" id="bonds-detail">
                    ${selectedRel ? renderBondDetail(selectedRel) : '<div class="detail-empty"><i data-lucide="users"></i><p>Select a bond to view details</p></div>'}
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    document.getElementById('bonds-back-btn').addEventListener('click', () => {
        window.location.hash = '';
    });

    document.querySelectorAll('.char-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentRepCharacter = tab.dataset.char;
            selectedEntry = null;
            renderRelationshipsView();
        });
    });

    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            currentRepFilter = btn.dataset.filter;
            selectedEntry = null;
            renderRelationshipsView();
        });
    });

    document.querySelectorAll('.sort-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentSort === btn.dataset.sort) {
                // Same sort clicked - toggle direction
                sortAscending = !sortAscending;
            } else {
                // Different sort clicked - switch to it with default direction
                currentSort = btn.dataset.sort;
                sortAscending = false;
            }
            renderRelationshipsView();
        });
    });

    document.querySelectorAll('.bond-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedEntry = card.dataset.name;
            // Update detail panel without full re-render for smoother feel
            const rel = relationships.find(r => r.name === selectedEntry);
            document.querySelectorAll('.bond-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const detailPanel = document.getElementById('bonds-detail');
            detailPanel.innerHTML = renderBondDetail(rel);
            detailPanel.classList.add('mobile-active');
            lucide.createIcons();
            attachImageZoom();
            animateDetailPanel();
        });
    });

    lucide.createIcons();

    // Animate cards on initial load
    animateBondCards();
}

function renderBondCard(rel, index) {
    const tier = getRepTier(rel.reputation);
    const progress = getRepProgress(rel.reputation);
    let imageName = REP_IMAGE_MAP[rel.name];
    if (imageName === undefined) imageName = rel.name;

    const isSelected = selectedEntry === rel.name;
    const isEnemy = rel.permanentEnemy;

    return `
        <div class="bond-card ${isSelected ? 'selected' : ''} ${isEnemy ? 'enemy' : ''} tier-${tier.class}"
             data-name="${rel.name}" data-index="${index}">
            <div class="card-portrait">
                ${imageName ? `<img src="thumbnails/${imageName}.webp" alt="${rel.name}" onerror="this.style.display='none'">` : ''}
                <span class="card-initial">${rel.name.charAt(0)}</span>
                ${isEnemy ? '<div class="enemy-overlay"><i data-lucide="skull"></i></div>' : ''}
                ${tier.class === 'soulbound' || tier.class === 'devoted' ? '<div class="card-glow"></div>' : ''}
            </div>
            <div class="card-info">
                <div class="card-name">${rel.name}</div>
                <div class="card-type">${rel.type.replace(/^NPC\s*-\s*/i, '')}</div>
                <div class="card-standing">
                    ${isEnemy ? `
                        <span class="standing-text enemy">Eternal Enemy</span>
                    ` : `
                        <div class="standing-bar-mini">
                            <div class="standing-fill-mini tier-${tier.class}" data-width="${progress.percentage}"></div>
                        </div>
                        <span class="standing-text tier-${tier.class}">${tier.name}</span>
                    `}
                </div>
            </div>
            <div class="card-indicator">
                <i data-lucide="chevron-right"></i>
            </div>
        </div>
    `;
}

function renderBondDetail(rel) {
    if (!rel) return '<div class="detail-empty"><i data-lucide="users"></i><p>Select a bond to view details</p></div>';

    const tier = getRepTier(rel.reputation);
    const progress = getRepProgress(rel.reputation);
    let imageName = REP_IMAGE_MAP[rel.name];
    if (imageName === undefined) imageName = rel.name;
    const isEnemy = rel.permanentEnemy;

    // Build tier progress visualization
    const tierProgressHtml = REP_TIERS.map((t, i) => {
        const isCurrent = t.class === tier.class;
        const isPast = rel.reputation >= t.max;
        const isFuture = rel.reputation < t.min;
        return `<div class="tier-node ${isCurrent ? 'current' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''} tier-${t.class}" title="${t.name}"></div>`;
    }).join('');

    const historyHtml = rel.history?.length > 0
        ? rel.history.slice(0, 5).map(h => `
            <div class="history-entry">
                <span class="history-change ${h.change >= 0 ? 'positive' : 'negative'}">${h.change >= 0 ? '+' : ''}${h.change.toLocaleString()}</span>
                <span class="history-reason">${h.reason}</span>
            </div>
        `).join('')
        : '<div class="history-entry empty">No recorded history</div>';

    const unlocksHtml = rel.unlocks?.length > 0
        ? rel.unlocks.map(u => {
            const unlocked = rel.reputation >= u.threshold;
            const unlockTier = getRepTier(u.threshold);
            return `
                <div class="unlock-row ${unlocked ? 'unlocked' : 'locked'}">
                    <span class="unlock-icon">${unlocked ? '<i data-lucide="check-circle"></i>' : '<i data-lucide="lock"></i>'}</span>
                    <span class="unlock-tier tier-${unlockTier.class}">${unlockTier.name}</span>
                    <span class="unlock-reward">${unlocked ? u.reward : '???'}</span>
                </div>
            `;
        }).join('')
        : '';

    return `
        <button class="detail-mobile-back" onclick="closeMobileDetail()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to list
        </button>
        <div class="detail-panel ${isEnemy ? 'enemy' : ''}">
            <div class="detail-hero">
                <div class="hero-portrait ${isEnemy ? 'enemy' : `tier-${tier.class}`}">
                    ${imageName ? `<img src="images/${imageName}.webp" alt="${rel.name}" onerror="this.src='thumbnails/${imageName}.webp'">` : `<span class="hero-initial">${rel.name.charAt(0)}</span>`}
                    ${tier.class === 'soulbound' || tier.class === 'devoted' ? '<div class="hero-particles"></div>' : ''}
                </div>
                <div class="hero-info">
                    <h2 class="hero-name">${rel.name}</h2>
                    <div class="hero-type">${rel.type}</div>
                    ${rel.romanceAvailable ? '<div class="hero-romance"><i data-lucide="heart"></i> Romance Available</div>' : ''}
                </div>
            </div>

            ${isEnemy ? `
                <div class="enemy-banner">
                    <i data-lucide="skull"></i>
                    <span>ETERNAL ENEMY</span>
                    <i data-lucide="skull"></i>
                </div>
            ` : `
                <div class="standing-section">
                    <div class="standing-header">
                        <span class="standing-label">Standing</span>
                        <span class="standing-value tier-${tier.class}">${tier.name}</span>
                    </div>
                    <div class="standing-bar-large">
                        <div class="standing-fill-large tier-${tier.class}" data-width="${progress.percentage}"></div>
                        <div class="standing-glow tier-${tier.class}"></div>
                    </div>
                    <div class="standing-numbers">
                        <span class="current-rep">${progress.current.toLocaleString()}</span>
                        <span class="rep-divider">/</span>
                        <span class="max-rep">${progress.needed.toLocaleString()}</span>
                    </div>
                    <div class="tier-progress">
                        ${tierProgressHtml}
                    </div>
                </div>
            `}

            ${rel.description ? `
                <div class="quote-section">
                    <div class="quote-icon"><i data-lucide="quote"></i></div>
                    <p class="quote-text">${rel.description}</p>
                </div>
            ` : ''}

            <div class="traits-section">
                ${rel.likes?.length ? `
                    <div class="trait-group likes">
                        <div class="trait-header"><i data-lucide="thumbs-up"></i> Appreciates</div>
                        <div class="trait-tags">${rel.likes.map(l => `<span class="trait-tag">${l}</span>`).join('')}</div>
                    </div>
                ` : ''}
                ${rel.dislikes?.length ? `
                    <div class="trait-group dislikes">
                        <div class="trait-header"><i data-lucide="thumbs-down"></i> Disdains</div>
                        <div class="trait-tags">${rel.dislikes.map(d => `<span class="trait-tag">${d}</span>`).join('')}</div>
                    </div>
                ` : ''}
            </div>

            <div class="history-section">
                <h3 class="section-header"><i data-lucide="scroll-text"></i> Chronicle</h3>
                <div class="history-list">
                    ${historyHtml}
                </div>
            </div>

            ${unlocksHtml ? `
                <div class="unlocks-section">
                    <h3 class="section-header"><i data-lucide="gift"></i> Reputation Rewards</h3>
                    <div class="unlocks-list">
                        ${unlocksHtml}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function animateBondCards() {
    // Animate cards appearing with stagger using GSAP
    gsap.fromTo('.bond-card',
        { opacity: 0, y: 20 },
        {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
            delay: 0.1,
            ease: 'power2.out'
        }
    );

    // Animate mini standing bars filling
    gsap.delayedCall(0.3, () => {
        document.querySelectorAll('.standing-fill-mini').forEach(bar => {
            const targetWidth = bar.dataset.width;
            gsap.fromTo(bar,
                { width: '0%' },
                { width: targetWidth + '%', duration: 0.8, ease: 'power3.out' }
            );
        });
    });

}


function closeMobileDetail() {
    const detailPanel = document.getElementById('bonds-detail');
    if (detailPanel) {
        detailPanel.classList.remove('mobile-active');
    }
}

// Toggle region dropdown in category view
function toggleRegion(button) {
    const section = button.closest('.region-section');
    section.classList.toggle('open');
}

function animateDetailPanel() {
    // Animate the detail panel content using GSAP
    gsap.fromTo('.detail-panel',
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
    );

    // Animate the large standing bar
    gsap.delayedCall(0.2, () => {
        document.querySelectorAll('.standing-fill-large').forEach(bar => {
            const targetWidth = bar.dataset.width;
            gsap.fromTo(bar,
                { width: '0%' },
                { width: targetWidth + '%', duration: 1, ease: 'power3.out' }
            );
        });
    });

    // Animate tier nodes
    gsap.fromTo('.tier-node',
        { scale: 0 },
        {
            scale: 1,
            duration: 0.3,
            stagger: 0.04,
            delay: 0.4,
            ease: 'back.out(1.7)'
        }
    );

    // Animate history entries
    gsap.fromTo('.history-entry',
        { opacity: 0, x: -10 },
        {
            opacity: 1,
            x: 0,
            duration: 0.3,
            stagger: 0.06,
            delay: 0.6,
            ease: 'power2.out'
        }
    );

    // Animate unlock rows
    gsap.fromTo('.unlock-row',
        { opacity: 0, x: -10 },
        {
            opacity: 1,
            x: 0,
            duration: 0.3,
            stagger: 0.06,
            delay: 0.7,
            ease: 'power2.out'
        }
    );
}

// ===== SPELL COMPENDIUM =====
let spellsData = null;
let currentSpellClass = 'all';
let currentSpellLevel = 'all';
let currentSpellSchool = 'all';
let currentSpellSource = 'all';
let currentSpellSearch = '';
let selectedSpell = null;
let selectedSpellCard = null; // Track the DOM element for fast deselection

const SPELL_LEVEL_ORDER = ['Cantrips', '1st Level', '2nd Level', '3rd Level', '4th Level', '5th Level', '6th Level', '7th Level', '8th Level', '9th Level'];

const SCHOOL_ICONS = {
    'Abjuration': 'shield',
    'Conjuration': 'sparkles',
    'Divination': 'eye',
    'Enchantment': 'heart',
    'Evocation': 'zap',
    'Illusion': 'ghost',
    'Necromancy': 'skull',
    'Transmutation': 'repeat'
};

const CLASS_ICONS = {
    'Artificer': 'wrench',
    'Bard': 'music',
    'Cleric': 'cross',
    'Druid': 'leaf',
    'Paladin': 'shield',
    'Ranger': 'target',
    'Sorcerer': 'flame',
    'Warlock': 'moon',
    'Wizard': 'book-open'
};

function setupSpellsLink() {
    const spellsLink = document.getElementById('spells-link');
    if (spellsLink) {
        spellsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showSpells();
            document.getElementById('sidebar').classList.remove('open');
        });
    }
}

async function loadSpellsData() {
    if (spellsData) return spellsData;
    try {
        const response = await fetch('spells-data.json?v=2');
        spellsData = await response.json();
        return spellsData;
    } catch (error) {
        console.error('Failed to load spells data:', error);
        return null;
    }
}

async function showSpells() {
    currentItem = null;
    currentCategory = null;

    await loadSpellsData();
    if (!spellsData) {
        document.getElementById('content-body').innerHTML = '<div class="welcome-container"><p>Failed to load spell data.</p></div>';
        return;
    }

    // Destroy Lenis completely for spell compendium (it interferes with panel scrolling)
    destroySmoothScroll();

    // Enable full-width mode
    document.getElementById('content-body').classList.add('full-width');

    // Update URL
    window.location.hash = 'spells';

    // Update breadcrumb
    document.getElementById('breadcrumb').innerHTML = `
        <span class="breadcrumb-home" style="cursor:pointer" onclick="showWelcome()">Compendium</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Spell Compendium</span>
    `;

    // Clear active states
    document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-category.open').forEach(el => el.classList.remove('open'));

    renderSpellsView();
}

function getFilteredSpells() {
    let spells = [...spellsData.allSpells];

    // Filter by class
    if (currentSpellClass !== 'all') {
        spells = spells.filter(s => s.classes && s.classes.includes(currentSpellClass));
    }

    // Filter by level
    if (currentSpellLevel !== 'all') {
        spells = spells.filter(s => s.level === currentSpellLevel);
    }

    // Filter by school
    if (currentSpellSchool !== 'all') {
        spells = spells.filter(s => s.school === currentSpellSchool);
    }

    // Filter by source
    if (currentSpellSource === 'standard') {
        spells = spells.filter(s => s.source === 'standard');
    } else if (currentSpellSource === 'ashen-realms') {
        spells = spells.filter(s => s.source === 'ashen' || s.source === 'ashen-realms');
    }

    // Filter by search
    if (currentSpellSearch) {
        const search = currentSpellSearch.toLowerCase();
        spells = spells.filter(s =>
            s.name.toLowerCase().includes(search) ||
            s.description.toLowerCase().includes(search) ||
            s.school.toLowerCase().includes(search)
        );
    }

    return spells;
}

function renderSpellsView() {
    const spells = getFilteredSpells();

    // Select first spell if none selected or current selection is filtered out
    if (!selectedSpell || !spells.find(s => s.name === selectedSpell)) {
        selectedSpell = spells[0]?.name || null;
    }

    const selectedSpellData = spells.find(s => s.name === selectedSpell);

    // Group spells by level
    const spellsByLevel = {};
    for (const level of SPELL_LEVEL_ORDER) {
        spellsByLevel[level] = spells.filter(s => s.level === level);
    }

    document.getElementById('content-body').innerHTML = `
        <div class="spells-container">
            <div class="spells-header">
                <button class="spells-back-btn" id="spells-back-btn">
                    <i data-lucide="arrow-left"></i>
                    <span>Back</span>
                </button>
                <div class="spells-title-area">
                    <h1 class="spells-title">Spell Compendium</h1>
                    <p class="spells-subtitle">${spells.length} spells found</p>
                </div>
            </div>

            <div class="spells-controls">
                <div class="spells-search-wrapper">
                    <i data-lucide="search"></i>
                    <input type="text" id="spell-search" placeholder="Search spells..." value="${currentSpellSearch}">
                </div>

                <div class="spells-filters">
                    <select id="filter-class" class="spell-filter-select">
                        <option value="all" ${currentSpellClass === 'all' ? 'selected' : ''}>All Classes</option>
                        ${Object.keys(spellsData.classes).map(c => `
                            <option value="${c}" ${currentSpellClass === c ? 'selected' : ''}>${c}</option>
                        `).join('')}
                    </select>

                    <select id="filter-level" class="spell-filter-select">
                        <option value="all" ${currentSpellLevel === 'all' ? 'selected' : ''}>All Levels</option>
                        ${SPELL_LEVEL_ORDER.map(l => `
                            <option value="${l}" ${currentSpellLevel === l ? 'selected' : ''}>${l}</option>
                        `).join('')}
                    </select>

                    <select id="filter-school" class="spell-filter-select">
                        <option value="all" ${currentSpellSchool === 'all' ? 'selected' : ''}>All Schools</option>
                        ${spellsData.schools.map(s => `
                            <option value="${s}" ${currentSpellSchool === s ? 'selected' : ''}>${s}</option>
                        `).join('')}
                    </select>

                    <select id="filter-source" class="spell-filter-select">
                        <option value="all" ${currentSpellSource === 'all' ? 'selected' : ''}>All Sources</option>
                        <option value="standard" ${currentSpellSource === 'standard' ? 'selected' : ''}>Standard</option>
                        <option value="ashen-realms" ${currentSpellSource === 'ashen-realms' ? 'selected' : ''}>Ashen Realms</option>
                    </select>
                </div>
            </div>

            <div class="spells-layout">
                <div class="spells-list" id="spells-list">
                    ${currentSpellLevel === 'all' ?
                        SPELL_LEVEL_ORDER.map((level, levelIndex) => {
                            const levelSpells = spellsByLevel[level];
                            if (levelSpells.length === 0) return '';
                            // First level (Cantrips) starts open
                            const isOpen = levelIndex === 0;
                            return `
                                <div class="spell-level-section ${isOpen ? 'open' : ''}" data-level="${level}">
                                    <button class="spell-level-header" type="button">
                                        <span class="level-name">${level}</span>
                                        <span class="level-count">${levelSpells.length}</span>
                                        <svg class="level-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </button>
                                    <div class="spell-level-spells">
                                        ${levelSpells.map((spell, index) => renderSpellCard(spell, index)).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')
                        :
                        `<div class="spell-level-spells">
                            ${spells.map((spell, index) => renderSpellCard(spell, index)).join('')}
                        </div>`
                    }
                </div>
                <div class="spells-detail" id="spells-detail">
                    ${selectedSpellData ? renderSpellDetail(selectedSpellData) : '<div class="detail-empty"><i data-lucide="sparkles"></i><p>Select a spell to view details</p></div>'}
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    document.getElementById('spells-back-btn').addEventListener('click', () => {
        window.location.hash = '';
    });

    let spellSearchDebounce;
    document.getElementById('spell-search').addEventListener('input', (e) => {
        currentSpellSearch = e.target.value;
        clearTimeout(spellSearchDebounce);
        spellSearchDebounce = setTimeout(() => {
            const cursorPos = e.target.selectionStart;
            renderSpellsView();
            // Refocus search input and restore cursor position
            const searchInput = document.getElementById('spell-search');
            searchInput.focus();
            searchInput.setSelectionRange(cursorPos, cursorPos);
        }, 150);
    });

    document.getElementById('filter-class').addEventListener('change', (e) => {
        currentSpellClass = e.target.value;
        selectedSpell = null;
        selectedSpellCard = null;
        renderSpellsView();
    });

    document.getElementById('filter-level').addEventListener('change', (e) => {
        currentSpellLevel = e.target.value;
        selectedSpell = null;
        selectedSpellCard = null;
        renderSpellsView();
    });

    document.getElementById('filter-school').addEventListener('change', (e) => {
        currentSpellSchool = e.target.value;
        selectedSpell = null;
        selectedSpellCard = null;
        renderSpellsView();
    });

    document.getElementById('filter-source').addEventListener('change', (e) => {
        currentSpellSource = e.target.value;
        selectedSpell = null;
        selectedSpellCard = null;
        renderSpellsView();
    });

    // Create spell lookup map for O(1) access
    const spellMap = new Map(spells.map(s => [s.name, s]));
    const detailPanel = document.getElementById('spells-detail');
    const spellList = document.getElementById('spells-list');

    // Use event delegation on the spell list for both cards and level headers
    spellList.addEventListener('click', (e) => {
        // Handle level header toggle (collapsible sections)
        const header = e.target.closest('.spell-level-header');
        if (header) {
            const section = header.closest('.spell-level-section');
            if (section) {
                section.classList.toggle('open');
            }
            return;
        }

        // Handle spell card selection
        const card = e.target.closest('.spell-card');
        if (!card) return;

        selectedSpell = card.dataset.name;
        const spell = spellMap.get(selectedSpell);

        // Fast deselection - only touch the previously selected card
        if (selectedSpellCard && selectedSpellCard !== card) {
            selectedSpellCard.classList.remove('selected');
        }
        card.classList.add('selected');
        selectedSpellCard = card;

        detailPanel.innerHTML = renderSpellDetail(spell);
        detailPanel.classList.add('mobile-active');
        // Icons are now pre-rendered as inline SVGs - no lucide.createIcons() needed
    });

    lucide.createIcons();
}

function renderSpellCard(spell, index) {
    const isSelected = selectedSpell === spell.name;
    const schoolIcon = SCHOOL_ICONS[spell.school] || 'sparkles';
    const isAshen = spell.source === 'ashen' || spell.source === 'ashen-realms';

    return `
        <div class="spell-card ${isSelected ? 'selected' : ''} ${isAshen ? 'ashen-realms' : ''} school-${spell.school?.toLowerCase()}"
             data-name="${spell.name}" data-index="${index}">
            <div class="spell-card-icon">
                <i data-lucide="${schoolIcon}"></i>
            </div>
            <div class="spell-card-info">
                <div class="spell-card-name">${spell.name}</div>
                <div class="spell-card-meta">
                    <span class="spell-school">${spell.school || 'Unknown'}</span>
                    ${spell.ritual ? '<span class="spell-tag ritual">Ritual</span>' : ''}
                    ${spell.concentration ? '<span class="spell-tag concentration">C</span>' : ''}
                    ${isAshen ? '<span class="spell-tag ashen">AR</span>' : ''}
                </div>
            </div>
            <div class="spell-card-indicator">
                <i data-lucide="chevron-right"></i>
            </div>
        </div>
    `;
}

function formatSpellDescription(description) {
    if (!description) return '';

    // Process the description line by line
    const lines = description.split('\n');
    let html = '';
    let inList = false;
    let currentParagraph = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Empty line - close any open paragraph
        if (!line) {
            if (currentParagraph.length > 0) {
                html += `<p>${currentParagraph.join(' ')}</p>`;
                currentParagraph = [];
            }
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            continue;
        }

        // List item
        if (line.startsWith('- ')) {
            // Close any open paragraph first
            if (currentParagraph.length > 0) {
                html += `<p>${currentParagraph.join(' ')}</p>`;
                currentParagraph = [];
            }

            if (!inList) {
                html += '<ul>';
                inList = true;
            }

            // Process the list item content for bold/italic
            let itemContent = line.substring(2);
            itemContent = itemContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            itemContent = itemContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            html += `<li>${itemContent}</li>`;
        }
        // Bold section header (like **At Higher Levels:** or **Ashen Realms Notes:**)
        else if (line.startsWith('**') && line.includes(':**')) {
            // Close any open list
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            // Close any open paragraph
            if (currentParagraph.length > 0) {
                html += `<p>${currentParagraph.join(' ')}</p>`;
                currentParagraph = [];
            }

            // Process bold text
            let processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            processedLine = processedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            html += `<p class="spell-note">${processedLine}</p>`;
        }
        // Regular paragraph line
        else {
            // Close any open list
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            // Process bold/italic in the line
            let processedLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            processedLine = processedLine.replace(/\*([^*]+)\*/g, '<em>$1</em>');
            currentParagraph.push(processedLine);
        }
    }

    // Close any remaining open elements
    if (currentParagraph.length > 0) {
        html += `<p>${currentParagraph.join(' ')}</p>`;
    }
    if (inList) {
        html += '</ul>';
    }

    return html;
}

// Pre-rendered SVG icons to avoid lucide.createIcons() call on every spell click
const SPELL_DETAIL_ICONS = {
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    target: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    package: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>',
    timer: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/></svg>',
    'trending-up': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    flame: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    eye: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    skull: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
    sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    // School icons
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    wand: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>',
    'book-open': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    zap: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    ghost: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>',
    skull2: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M8 20v2h8v-2"/><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20"/></svg>',
    shuffle: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>',
    // Class icons
    wrench: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    music: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    'book-marked': '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><polyline points="10 2 10 10 13 7 16 10 16 2"/></svg>',
    leaf: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
    axe: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7z"/></svg>',
    mountain: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
    compass: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    dices: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>',
    swords: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>',
    wand2: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>',
};

function renderSpellDetail(spell) {
    if (!spell) return '<div class="detail-empty">' + SPELL_DETAIL_ICONS.sparkles + '<p>Select a spell to view details</p></div>';

    const schoolIcon = SCHOOL_ICONS[spell.school] || 'sparkles';
    const isAshen = spell.source === 'ashen' || spell.source === 'ashen-realms';

    // Format description with paragraphs and markdown support
    const formattedDescription = formatSpellDescription(spell.description);

    // Get the school icon SVG (use larger version)
    const schoolSvg = SPELL_DETAIL_ICONS[schoolIcon] || SPELL_DETAIL_ICONS.sparkles;

    return `
        <button class="detail-mobile-back" onclick="closeMobileSpellDetail()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to list
        </button>
        <div class="spell-detail-panel ${isAshen ? 'ashen-realms' : ''}">
            <div class="spell-detail-header">
                <div class="spell-icon-large school-${spell.school?.toLowerCase()}">
                    ${schoolSvg}
                </div>
                <div class="spell-header-info">
                    <h2 class="spell-detail-name">${spell.name}</h2>
                    <div class="spell-detail-type">
                        <span class="spell-level-badge">${spell.level}</span>
                        <span class="spell-school-badge">${spell.school || 'Unknown'}</span>
                        ${spell.ritual ? '<span class="spell-tag-badge ritual">Ritual</span>' : ''}
                        ${spell.concentration ? '<span class="spell-tag-badge concentration">Concentration</span>' : ''}
                        ${isAshen ? '<span class="spell-tag-badge ashen">Ashen Realms</span>' : ''}
                    </div>
                </div>
            </div>

            <div class="spell-stats-grid">
                <div class="spell-stat">
                    <div class="stat-label">${SPELL_DETAIL_ICONS.clock} Casting Time</div>
                    <div class="stat-value">${spell.castingTime || '1 action'}</div>
                </div>
                <div class="spell-stat">
                    <div class="stat-label">${SPELL_DETAIL_ICONS.target} Range</div>
                    <div class="stat-value">${spell.range || 'Self'}</div>
                </div>
                <div class="spell-stat">
                    <div class="stat-label">${SPELL_DETAIL_ICONS.package} Components</div>
                    <div class="stat-value">${spell.components || 'V, S'}</div>
                </div>
                <div class="spell-stat">
                    <div class="stat-label">${SPELL_DETAIL_ICONS.timer} Duration</div>
                    <div class="stat-value">${spell.duration || 'Instantaneous'}</div>
                </div>
            </div>

            <div class="spell-description">
                ${formattedDescription}
            </div>

            ${spell.higherLevels ? `
                <div class="spell-higher-levels">
                    <h4>${SPELL_DETAIL_ICONS['trending-up']} At Higher Levels</h4>
                    <p>${spell.higherLevels}</p>
                </div>
            ` : ''}

            ${spell.ashenRealms ? `
                <div class="spell-ashen-component">
                    <h4>${SPELL_DETAIL_ICONS.flame} Ashen Realms Component</h4>
                    <p>${spell.ashenRealms}</p>
                </div>
            ` : ''}

            ${spell.sovereignAttention ? `
                <div class="spell-sovereign-attention">
                    <h4>${SPELL_DETAIL_ICONS.eye} Sovereign Attention</h4>
                    <p>${spell.sovereignAttention}</p>
                </div>
            ` : ''}

            ${spell.cost ? `
                <div class="spell-cost">
                    <h4>${SPELL_DETAIL_ICONS.skull} Cost</h4>
                    <p>${spell.cost}</p>
                </div>
            ` : ''}

            <div class="spell-classes">
                <h4>${SPELL_DETAIL_ICONS.users} Available To</h4>
                <div class="class-tags">
                    ${spell.classes?.map(c => {
                        const classIcon = CLASS_ICONS[c] || 'user';
                        return `<span class="class-tag">${SPELL_DETAIL_ICONS[classIcon] || SPELL_DETAIL_ICONS.user} ${c}</span>`;
                    }).join('') || '<span class="class-tag">Unknown</span>'}
                </div>
            </div>
        </div>
    `;
}

function closeMobileSpellDetail() {
    const detailPanel = document.getElementById('spells-detail');
    if (detailPanel) {
        detailPanel.classList.remove('mobile-active');
    }
}

// Animations removed for performance - 669 spells is too many to animate

