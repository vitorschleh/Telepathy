const CACHE_NAME = 'telepathy-v9-killer'; // Mudei o nome pra forçar reset
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. INSTALAÇÃO: Baixa os arquivos iniciais e força a atualização imediata
self.addEventListener('install', event => {
  self.skipWaiting(); // <--- O PULO DO GATO: Não espera, instala JÁ!
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 2. ATIVAÇÃO: Limpa os caches antigos (v1, v2, etc)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Assume o controle da página na hora
  );
});

// 3. FETCH (INTERCEPTAÇÃO): Estratégia "Network First" (Internet Primeiro)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a internet funcionou, atualiza o cache com a versão nova
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Se a internet falhou, só aí usa o cache
        return caches.match(event.request);
      })
  );
});
