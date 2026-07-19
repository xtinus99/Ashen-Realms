// Service Worker for The Ashen Realms
// Enables offline reading of cached content

const CACHE_NAME = 'ashen-realms-v74';

// Core assets to cache immediately on install
// JS/CSS are hashed by Vite — the network-first strategy handles them dynamically
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/data-index.json',
    '/campaign-now.json',
    '/feats-data.json',
    '/Assets/Sigil.webp',
    '/Assets/Dark Marble.webp',
    '/Assets/Weeping Statue.webp'
];

// Fonts are now bundled by Vite via @fontsource — cached dynamically via fetch handler
const FONT_ASSETS = [];

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

    // Create a cache key without query string (for versioned assets like app.js?v=67)
    const cacheUrl = url.origin + url.pathname;

    // For same-origin requests
    if (url.origin === location.origin) {
        // Navigations must be network-first. A cache-first HTML shell can point at
        // hashed bundles from an older deployment and leave the app unable to boot.
        if (event.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
            event.respondWith(
                fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse?.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(cacheUrl, networkResponse.clone()));
                        }
                        return networkResponse;
                    })
                    .catch(() => caches.match(cacheUrl).then(async (cachedResponse) => (
                        cachedResponse || await caches.match('/index.html') || new Response('Offline', { status: 503 })
                    )))
            );
            return;
        }

        // JSON uses stale-while-revalidate: instant repeat visits with a background refresh.
        if (url.pathname.endsWith('.json')) {
            event.respondWith(
                caches.match(cacheUrl).then((cachedResponse) => {
                    const networkUpdate = fetch(event.request)
                        .then((networkResponse) => {
                            if (networkResponse?.status === 200) {
                                caches.open(CACHE_NAME).then((cache) => cache.put(cacheUrl, networkResponse.clone()));
                            }
                            return networkResponse;
                        })
                        .catch(() => null);
                    return cachedResponse || networkUpdate.then((response) => (
                        response || new Response('Offline', { status: 503 })
                    ));
                })
            );
            return;
        }

        // Hashed JS/CSS use network-first with an offline fallback.
        if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
            event.respondWith(
                fetch(event.request)
                    .then((networkResponse) => {
                        // Cache the fresh response using normalized URL (without query string)
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(cacheUrl, responseToCache);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Network failed, fall back to cache using normalized URL
                        return caches.match(cacheUrl);
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
