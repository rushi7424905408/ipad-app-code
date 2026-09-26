// WortSchatz High-Performance Offline Service Worker (iPad Air M3 Optimized)
const CACHE_NAME = 'wortschatz-v2.6.0-offline';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './pdf.min.js',
  './pdf.worker.min.js',
  './pdf-lib.min.js',
  './lucide.js',
  './dictionary_data.js',
  './translator.js',
  './annotator.js',
  './vocabulary.js',
  './pdf_viewer.js',
  './app.js',
  './tts.js',
  './sample_german.pdf',
  './sample_pdf_data.js',
  './AppIcon.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[ServiceWorker] Some non-critical assets skipped during precache:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Never cache POST requests (e.g. /api/save-obsidian)
  if (request.method !== 'GET') {
    return;
  }

  // Network first for API calls, Cache first with background update for static assets
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ status: 'offline', message: 'You are currently offline.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Cache-first strategy for instant rendering on iPad Air M3
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate cache (Stale-While-Revalidate)
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {/* Offline, ignore */});
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
