/* eslint-env browser, worker */
'use strict';

const cacheName = 'blogophon';

self.addEventListener('install', function(event) {
  let indexPage = new Request('./');
  event.waitUntil(
    fetch(indexPage).then(function(response) {
      return caches.open(cacheName).then(function(cache) {
        return cache.put(indexPage, response);
      });
    })
  );
});

self.addEventListener('fetch', function(event) {
  let updateCache = function(request){
    return caches.open(cacheName).then(function(cache) {
      if (event.request && event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
        return;
      }
      return fetch(request).then(function(response) {
        return cache.put(request, response);
      });
    });
  };
  event.waitUntil(updateCache(event.request));
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.open(cacheName).then(function(cache) {
        return cache.match(event.request).then(function(matching) {
          let report =  !matching || matching.status === 404 ? Promise.reject('no-match') : matching;
          return report;
        });
      });
    })
  );
});
