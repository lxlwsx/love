// ============================================
// Service Worker - 思炫宝宝的专属小窝
// 离线缓存支持
// ============================================

var CACHE_NAME = 'love-app-v1';
var urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/store.js',
  './js/router.js',
  './js/utils.js',
  './js/components/Home.js',
  './js/components/MemoryWall.js',
  './js/components/FriendCircle.js',
  './js/components/OrderFood.js',
  './js/components/Profile.js',
  './js/components/MealTracker.js',
  './js/components/OutfitWall.js',
  './js/components/Anniversary.js',
  './js/components/NotificationCenter.js',
  './js/components/CallBoyfriend.js',
  './js/components/NaNiNvYou.js'
];

// 安装 - 缓存所有资源
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('📦 缓存资源中...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 激活 - 清理旧缓存
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (name) {
          if (name !== CACHE_NAME) {
            console.log('🗑️ 清理旧缓存：' + name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 拦截请求 - 缓存优先策略
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response;
      }
      return fetch(event.request).then(function (networkResponse) {
        // 缓存新的 CDN 资源
        if (event.request.url.includes('unpkg.com') || event.request.url.includes('cdnjs.cloudflare.com')) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function () {
        // 离线时返回缓存的首页
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
