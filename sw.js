// Service Worker for The Ashen Realms
// Enables offline reading of cached content

const CACHE_NAME = 'ashen-realms-v62';

// Core assets to cache immediately on install
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/data.json',
    '/relationships-data.json',
    '/Assets/Sigil.webp',
    '/Assets/Dark Marble.webp',
    '/Assets/Weeping Statue.webp'
];

// Font files to cache
const FONT_ASSETS = [
    '/fonts/IMFellEnglish-Regular.ttf',
    '/fonts/IMFellEnglish-Italic.ttf',
    '/fonts/Spectral-Regular.ttf',
    '/fonts/Spectral-Italic.ttf',
    '/fonts/Spectral-Medium.ttf',
    '/fonts/Spectral-SemiBold.ttf',
    '/fonts/Spectral-Bold.ttf',
    '/fonts/static/Inter_18pt-Regular.ttf',
    '/fonts/static/Inter_18pt-Medium.ttf',
    '/fonts/static/Inter_18pt-SemiBold.ttf'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching core assets...');
            // Cache core assets first (these are essential)
            return cache.addAll(CORE_ASSETS).then(() => {
                // Then try to cache fonts (don't fail if some are missing)
                return Promise.allSettled(
                    FONT_ASSETS.map(font =>
                        cache.add(font).catch(() => console.log('Font not found:', font))
                    )
                );
            });
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name.startsWith('ashen-realms-') && name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!event.request.url.startsWith('http')) return;

    const url = new URL(event.request.url);

    // For same-origin requests
    if (url.origin === location.origin) {
        // Dynamic content (JSON, JS, CSS) - use network-first strategy
        // This ensures updates are immediate without needing cache version bumps
        if (url.pathname.endsWith('.json') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
            event.respondWith(
                fetch(event.request)
                    .then((networkResponse) => {
                        // Cache the fresh response
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed, fall back to cache
                        return caches.match(event.request);
                    })
            );
            return;
        }

        // Static assets (images, fonts, HTML) - use cache-first strategy for performance
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                // Return cached response if available
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request).then((networkResponse) => {
                    // Cache all successful responses
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Offline and not in cache
                    if (event.request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    // For images, return a placeholder or empty response
                    if (event.request.destination === 'image') {
                        return new Response('', { status: 200 });
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
        );
    } else {
        // For cross-origin requests (like external scripts), network-first
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
    }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
