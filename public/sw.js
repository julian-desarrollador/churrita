// Sin listener de fetch: uno vacío obliga al navegador a arrancar el
// service worker antes de cada navegación o pedido, y recién ahí empieza.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
