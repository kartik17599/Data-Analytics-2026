
const CACHE_NAME = 'da-2026-v4';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.tailwindcss.com?plugins=typography',
  'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
  'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Critical assets for the app shell to load
      await cache.addAll(CORE_ASSETS);
      
      // External assets (styles, fonts) - attempt to cache but don't fail installation if they fail (e.g. CORS/Offline)
      try {
        await cache.addAll(EXTERNAL_ASSETS);
      } catch (err) {
        console.warn('Failed to cache some external assets:', err);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Navigation requests: always try network first, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Asset requests: try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Optional: Return a placeholder if offline and not in cache
        return null; 
      });
    })
  );
});
