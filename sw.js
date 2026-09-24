/* Daybreak service worker — offline app shell.
   Bump CACHE when index.html changes so clients pull the new build. */
const CACHE = "daybreak-v27";
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

  // Navigations: STALE-WHILE-REVALIDATE — serve the cached shell instantly (no network wait, so it
  // opens fully offline and never hangs on weak "lie-fi" signal), then refresh it in the background
  // for next launch. Only the very first load (nothing cached yet) waits for the network.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match("./index.html").then(cached => {
          const fresh = fetch(req)
            .then(r => { if (r && r.ok) cache.put("./index.html", r.clone()); return r; })
            .catch(() => cached);            // offline / lie-fi timeout → keep the cached shell
          return cached || fresh;            // cached copy immediately if we have one, else first-load network
        })
      )
    );
    return;
  }

  // Same-origin assets: stale-while-revalidate — instant from cache (works offline), refreshed in the background.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(req).then(cached => {
          const fresh = fetch(req)
            .then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; })
            .catch(() => cached);
          return cached || fresh;
        })
      )
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
