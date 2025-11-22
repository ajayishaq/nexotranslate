const CACHE_NAME = 'nexo-translate-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/attached_assets/icon-192x192.png',
  '/attached_assets/icon-512x512.png',
  '/attached_assets/IMG_20250826_073618_116_1757157131293.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ 
          error: 'Offline - Translation requires internet connection' 
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request).then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
        })
    );
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-translations') {
    event.waitUntil(syncTranslations());
  }
});

async function syncTranslations() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingTranslations', 'readonly');
    const store = tx.objectStore('pendingTranslations');
    const allPending = await store.getAll();
    
    for (const item of allPending) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          const txDelete = db.transaction('pendingTranslations', 'readwrite');
          txDelete.objectStore('pendingTranslations').delete(item.id);
        }
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  } catch (error) {
    console.error('IndexedDB error:', error);
  }
}

self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = urlsToCache.map(url => fetch(url));
  const responses = await Promise.all(requests);
  
  responses.forEach((response, index) => {
    if (response.ok) {
      cache.put(urlsToCache[index], response);
    }
  });
}

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New translation update available',
    icon: '/attached_assets/icon-192x192.png',
    badge: '/attached_assets/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/attached_assets/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/attached_assets/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Nexo Translate', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NexoTranslateDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTranslations')) {
        db.createObjectStore('pendingTranslations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
