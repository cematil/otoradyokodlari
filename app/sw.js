/* Uygulama kabuğunu çevrimdışı kullanım için önbelleğe alır.
   Kod verileri app.js içinde ayrı bir önbellekte tutulur. */
var SHELL_CACHE = "rc-shell-v1";
var SHELL = [
    "./",
    "./index.html",
    "./css/app.css",
    "./js/i18n.js",
    "./js/app.js",
    "./catalog.json",
    "./privacy.html",
    "./manifest.webmanifest",
    "./img/icon.svg",
    "./img/icon-192.png",
];

self.addEventListener("install", function (e) {
    e.waitUntil(caches.open(SHELL_CACHE).then(function (c) { return c.addAll(SHELL); }));
    self.skipWaiting();
});

self.addEventListener("activate", function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.filter(function (k) {
                return k.indexOf("rc-shell-") === 0 && k !== SHELL_CACHE;
            }).map(function (k) { return caches.delete(k); }));
        })
    );
    self.clients.claim();
});

// Ağ öncelikli: güncel sürüm varsa onu kullan, yoksa önbellekten aç
self.addEventListener("fetch", function (e) {
    var url = new URL(e.request.url);
    if (e.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.indexOf("/data/") !== -1) return;
    e.respondWith(
        fetch(e.request).then(function (res) {
            var copy = res.clone();
            caches.open(SHELL_CACHE).then(function (c) { c.put(e.request, copy); });
            return res;
        }).catch(function () {
            return caches.match(e.request);
        })
    );
});
