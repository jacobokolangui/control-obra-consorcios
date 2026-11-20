const CACHE = "control-obra-v5";
const SHELL = ["./", "./manifest.json?v=2", "./icon-192.png?v=2", "./icon-512.png?v=2"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.method !== "GET") return;
  // Pages always skip the browser's HTTP cache so a new deploy shows up on the next reload.
  const esPagina = e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/");
  e.respondWith(
    fetch(e.request, esPagina ? { cache: "no-store" } : undefined)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
