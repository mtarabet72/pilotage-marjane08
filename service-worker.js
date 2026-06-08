const CACHE = 'hm-pwa-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192-marjane.png',
  './icons/icon-512-marjane.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Pour Firebase (réseau), toujours passer en réseau d'abord
  if (e.request.url.includes('firebasedatabase') || e.request.url.includes('googleapis')) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }
  // Cache-first pour assets locaux
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
