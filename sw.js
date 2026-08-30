const CACHE_NAME = "vr-shop-v10";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo.png",
  "./icon-192.png",
  "./icon-512.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});


/* ACTIVATE - DELETE OLD CACHE */
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(cacheNames => {

      return Promise.all(

        cacheNames.map(cacheName => {

          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }

        })

      );

    })

  );

  self.clients.claim();
});


/* FETCH */
self.addEventListener("fetch", event => {

  const request = event.request;

  /* HTML हमेशा network से नया लेना */
  if (
    request.method === "GET" &&
    request.headers.get("accept") &&
    request.headers.get("accept").includes("text/html")
  ) {

    event.respondWith(

      fetch(request)
        .then(response => {

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });

          return response;

        })
        .catch(() => {

          return caches.match(request);

        })

    );

    return;
  }


  /* बाकी files */
  event.respondWith(

    caches.match(request).then(cachedResponse => {

      return cachedResponse || fetch(request);

    })

  );

});
