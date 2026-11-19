/* SIFI Portfóliókövető – service worker
   App-shell cache. A data.json MINDIG hálózatról jön (friss árfolyam). */
const CACHE = "sifi-pf-v4";
const SHELL = [
  "./", "./index.html", "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // data.json: mindig hálózat, cache nélkül (friss árfolyam kell).
  if (url.pathname.endsWith("/data.json") || url.pathname.endsWith("data.json")) {
    e.respondWith(fetch(req, { cache: "no-store" }).catch(() => caches.match(req)));
    return;
  }
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => cached);
      return cached || net;
    }));
  } else {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});
