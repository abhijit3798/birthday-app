/* Imported into the generated service worker (see vite.config.js -> workbox.importScripts).
 * Tapping a birthday notification opens / focuses the installed app. */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL('/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(targetUrl) : undefined;
    })
  );
});
