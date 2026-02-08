// Service Worker a PWA-hoz
const CACHE_NAME = 'chat-pwa-v1';
const urlsToCache = [
  '/chat.html',
  '/',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js'
];

// Install esemény - cache-elés
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache megnyitva');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Cache hiba:', err);
      })
  );
});

// Activate esemény - régi cache-ek törlése
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Régi cache törlése:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch esemény - cache-first stratégia
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache-ben van, visszaadja
        if (response) {
          return response;
        }
        // Nincs cache-ben, hálózatból tölti
        return fetch(event.request).then((response) => {
          // Csak érvényes válaszokat cache-elünk
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Klónozzuk a választ
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // Hálózati hiba esetén offline oldalt adhatnánk vissza
        // Jelenleg csak továbbítjuk a hibát
      })
  );
});

