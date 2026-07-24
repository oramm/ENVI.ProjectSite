// Minimalny service worker dla PWA (instalowalność + szybki start + fallback offline).
// Strategia: network-first dla GET z tej samej domeny (użytkownik online zawsze dostaje
// świeży bundle.js), z fallbackiem do cache gdy brak sieci. POST-y omijają cache.
const CACHE = 'envi-pwa-v3';
const SHELL = ['./', './index.html', './bundle.js', './pwa/icon-192.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
            )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin)
        return;
    event.respondWith(
        fetch(request)
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
                return response;
            })
            .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
});
