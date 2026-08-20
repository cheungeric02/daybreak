/* Daybreak service worker — offline app shell.
   Bump CACHE when index.html changes so clients pull the new build. */
const CACHE = "daybreak-v3";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never touch Google auth / API traffic (OAuth + Calendar) — must always hit the network, never cache.
  if (url.hostname === "accounts.google.com" || url.hostname === "apis.google.com" ||
      url.hostname === "googleapis.com" || url.hostname.endsWith(".googleapis.com")) {
    return; // let the browser handle it normally
  }

  // Navigations: network-first (fresh app), fall back to cached shell offline.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return r; })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }

  // Same-origin assets: cache-first.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(rr => {
        const cp = rr.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return rr;
      }))
    );
    return;
  }

  // Cross-origin (e.g. Google Fonts): stale-while-revalidate.
  e.respondWith(
    caches.match(req).then(r => {
      const fetched = fetch(req).then(rr => {
        const cp = rr.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return rr;
      }).catch(() => r);
      return r || fetched;
    })
  );
});
