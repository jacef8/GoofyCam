// Goofy Cam offline cache: app files plus the face finder, so it starts fast after the first visit.
const CACHE = "goofy-cam-v5";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const big = url.hostname.includes("jsdelivr") || url.hostname.includes("storage.googleapis.com") || url.hostname.includes("gstatic") || url.hostname.includes("googleapis");
  if (big) {   // cache first: these files never change for a pinned version
    e.respondWith(caches.open(CACHE).then(async c => (await c.match(e.request)) ||
      fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r; })));
  } else if (url.origin === location.origin) {   // network first so updates show up
    e.respondWith(fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
      .catch(() => caches.match(e.request)));
  }
});
