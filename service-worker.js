/* ────────────────────────────────────────────────────────────
   Service worker auto-destructeur.
   Remplace l'ancien SW (PWA) qui gardait les pages en cache.
   Il vide tous les caches, se désinstalle, puis recharge les
   onglets ouverts pour afficher le nouveau site.
   ──────────────────────────────────────────────────────────── */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    try {
      var names = await caches.keys();
      await Promise.all(names.map(function (n) { return caches.delete(n); }));
      await self.registration.unregister();
      var clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(function (c) { c.navigate(c.url); });
    } catch (e) { /* rien */ }
  })());
});
