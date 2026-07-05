const CACHE_NAME = "go-murappi-v1-6-2-stomp-pose";
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './js/config.js',
  './js/stages.js',
  './js/game.js',
  './assets/characters/murappi_front.png',
  './assets/characters/murappi_hurt.png',
  './assets/characters/murappi_defeated.png',
  './assets/characters/murappi_jump.png',
  './assets/characters/murappi_run_1.png',
  './assets/characters/murappi_run_2.png',
  './assets/characters/murappi_run_3.png',
  './assets/characters/murappi_run_4.png',
  './assets/characters/murappi_side_right.png',
  './assets/characters/murappi_threequarter.png',
  './assets/characters/piyoppi_front.png',
  './assets/characters/piyoppi_hop_1.png',
  './assets/characters/piyoppi_hop_2.png',
  './assets/characters/piyoppi_side_right.png',
  './assets/enemies/moko_defeated.png',
  './assets/enemies/moko_walk_1.png',
  './assets/enemies/moko_walk_2.png',
  './assets/enemies/moko_walk_3.png',
  './assets/enemies/puni_defeated.png',
  './assets/enemies/puni_walk_1.png',
  './assets/enemies/puni_walk_2.png',
  './assets/enemies/puni_walk_3.png',
  './assets/enemies/shizuku_defeated.png',
  './assets/enemies/shizuku_walk_1.png',
  './assets/enemies/shizuku_walk_2.png',
  './assets/enemies/shizuku_walk_3.png',
  './assets/enemies/toge_defeated.png',
  './assets/enemies/toge_walk_1.png',
  './assets/enemies/toge_walk_2.png',
  './assets/enemies/toge_walk_3.png',
  './assets/tiles/cloud.png',
  './assets/tiles/flower.png',
  './assets/tiles/ground_grass.png',
  './assets/tiles/ground_stone.png',
  './assets/tiles/hole.png',
  './assets/tiles/hospital_path.png',
  './assets/tiles/platform_wood.png',
  './assets/tiles/sky_clear.png',
  './assets/tiles/wall_hedge.png',
  './assets/tiles/water.png',
  './assets/ui/icon-192.png',
  './assets/ui/icon-512.png'
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("./index.html")))
  );
});
