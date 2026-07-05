/**
 * Service worker : met en cache la coquille de l'app (HTML/CSS/JS/manifeste)
 * pour un fonctionnement hors-ligne. Les requêtes vers des origines externes
 * (API BoardGameGeek, proxy CORS) ne sont pas interceptées : on veut toujours
 * les données les plus fraîches, la bibliothèque elle-même vit dans IndexedDB.
 */

const CACHE_NAME = 'soiree-jeux-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/db.js',
  './js/bgg.js',
  './js/filters.js',
  './js/ui.js',
  './js/views/library.js',
  './js/views/add-game.js',
  './js/views/suggest.js',
  './assets/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
