/* eslint-disable no-restricted-globals */
// ============================== SERVICE WORKER ==============================
// App shell offline (precache do build) + notificações do cronômetro de descanso.
//
// Duas formas de notificação, ver src/lib/notifications.js pro contexto completo:
//   1) SCHEDULE_REST_NOTIFICATION (postMessage da página) — melhor esforço, só
//      funciona enquanto o navegador não suspender este worker.
//   2) evento 'push' — caminho robusto de verdade. Precisa de um servidor mandando
//      o push na hora certa (ver /server). O SO acorda o worker especificamente
//      pra esse evento, mesmo com o app fechado ou a tela bloqueada.

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

self.skipWaiting();
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// Navegação (abrir o app) usa network-first com fallback pro shell cacheado,
// pra abrir mesmo offline.
registerRoute(new NavigationRoute(new NetworkFirst({ cacheName: "pages" })));

// ---------- 1) Notificação agendada via mensagem da página (melhor esforço) ----------
const scheduledTimers = new Map();

self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  if (type === "SCHEDULE_REST_NOTIFICATION") {
    const { id, delayMs, title, body, tag } = payload;
    if (scheduledTimers.has(id)) clearTimeout(scheduledTimers.get(id));
    const handle = setTimeout(() => {
      scheduledTimers.delete(id);
      self.registration.showNotification(title, {
        body,
        tag,
        renotify: true,
        icon: "icons/icon-192.png",
        badge: "icons/badge-72.png",
        vibrate: [200, 100, 200],
      });
    }, delayMs);
    scheduledTimers.set(id, handle);
  }

  if (type === "CANCEL_REST_NOTIFICATION") {
    const { id } = payload;
    if (scheduledTimers.has(id)) {
      clearTimeout(scheduledTimers.get(id));
      scheduledTimers.delete(id);
    }
  }
});

// ---------- 2) Web Push real (caminho robusto, precisa do servidor em /server) ----------
self.addEventListener("push", (event) => {
  let data = { title: "Descanso terminado 💪", body: "Hora da próxima série" };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch (e) { /* payload não é JSON, usa default */ }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: "rest-timer",
      renotify: true,
      icon: "icons/icon-192.png",
      badge: "icons/badge-72.png",
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow(self.registration.scope);
    })
  );
});
