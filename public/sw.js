// Kill-switch service worker.
// The previous SW cached an old bundle that surfaced a "Device Check Failed"
// toast. This replacement evicts its own caches, claims clients, reloads
// open tabs, and unregisters itself so the stale bundle stops being served.

function isOwnCache(name) {
  // Only delete caches created by the previous app SW.
  return (
    name === 'easy-execute-v1' ||
    name === 'easy-execute-static-v1' ||
    name === 'easy-execute-dynamic-v1' ||
    /^easy-execute-/.test(name) ||
    /(^|-)precache-v\d+-|(^|-)runtime-/.test(name)
  );
}

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.allSettled(
          cacheNames.filter(isOwnCache).map((name) => caches.delete(name))
        );
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: 'window' });
        await Promise.allSettled(
          windowClients.map((client) => client.navigate(client.url))
        );
      } finally {
        await self.registration.unregister();
      }
    })()
  )
);
