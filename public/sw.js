/*
 * LifeQuest service worker — makes the home-screen app usable offline.
 *
 * Strategy:
 *   - navigations:      network-first, fall back to cache (always fresh online)
 *   - /_next/static/*:  cache-first (content-hashed, immutable)
 *   - other same-origin GET: stale-while-revalidate
 * No app data is ever cached here — habits live in localStorage.
 */
const VERSION = "lifequest-v1";
const SHELL = `${VERSION}-shell`;
const RUNTIME = `${VERSION}-runtime`;
const APP_ROUTES = [
  "/",
  "/today",
  "/habits",
  "/calendar",
  "/analytics",
  "/achievements",
  "/profile",
  "/settings",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) =>
        // Best-effort: a single failure must not abort installation.
        Promise.allSettled(APP_ROUTES.map((url) => cache.add(url)))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return; // never cache API calls

  // 1. Page navigations: network first, cached shell as offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match("/")) || Response.error();
        })
    );
    return;
  }

  // 2. Immutable build assets: cache first.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // 3. Everything else same-origin: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
