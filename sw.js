/* ============================
   MusicFlow - sw.js
   Service Worker v1.0
   ============================ */

const CACHE_NAME = 'musicflow-v2';
const OFFLINE_FALLBACK = './index.html';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-512.png',
  './icons/icon-192.png',
  './icons/icon-180.png',
  './icons/icon-167.png',
  './icons/icon-152.png',
  './icons/icon-96.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
  'https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap',
  'https://fonts.googleapis.com/icon?family=Material+Icons+Round',
];

// Install — cache core assets
self.addEventListener('install', event => {
  console.log('[SW] Installing…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(e => console.warn('[SW] Failed to cache:', url, e))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first for API, cache-first for static
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if(request.method !== 'GET') return;

  // Skip chrome-extension and other schemes
  if(!['http:', 'https:'].includes(url.protocol)) return;

  // Audio files — network only (too large to cache)
  if(request.destination === 'audio' || request.destination === 'video') {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Images — cache-first with network fallback
  if(request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => {
        if(cached) return cached;
        return fetch(request).then(res => {
          if(res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // Static assets — cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if(cached) return cached;
      return fetch(request).then(res => {
        if(res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback
        if(request.destination === 'document') {
          return caches.match(OFFLINE_FALLBACK, { ignoreSearch: true });
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Background sync for downloads
self.addEventListener('sync', event => {
  if(event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  // Placeholder for server sync
  console.log('[SW] Syncing favorites…');
}

// Push notifications
self.addEventListener('push', event => {
  if(!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'MusicFlow', {
      body: data.body || 'New music available!',
      icon: './icons/icon-192.png',
      badge: './icons/icon-96.png',
      data: { url: data.url || './' },
      actions: [
        { action: 'play', title: 'Play Now' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if(event.action === 'play') {
    event.waitUntil(clients.openWindow(event.notification.data.url || '/'));
  }
});
