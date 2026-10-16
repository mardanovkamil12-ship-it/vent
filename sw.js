var CACHE_NAME = 'vent-v30';
var URLS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    // страница и сам воркер — всегда из сети мимо HTTP-кэша (GitHub Pages держит 10 мин), иначе телефон долго видит старую версию
    fetch(e.request, (e.request.mode === 'navigate' || /\/(index\.html|sw\.js)?(\?.*)?$/.test(new URL(e.request.url).pathname + (new URL(e.request.url).search))) ? {cache: 'no-store'} : undefined).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, clone);
      });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
