// ============================== WEB PUSH REAL (opcional) ==============================
// Só ativa se o app for compilado com VITE_PUSH_SERVER_URL + VITE_VAPID_PUBLIC_KEY
// apontando pro servidor em /server (implantado separadamente — ver README).
// Sem essas variáveis, essas funções não fazem nada e o app segue funcionando
// normalmente com o fallback de melhor esforço (ver notifications.js).

const SERVER_URL = import.meta.env.VITE_PUSH_SERVER_URL;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export function isPushConfigured() {
  return Boolean(SERVER_URL && VAPID_PUBLIC_KEY && "serviceWorker" in navigator && "PushManager" in window);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

let cachedSubscriptionId = null;

// Garante uma subscription de push registrada no servidor; devolve o id usado
// pra endereçar esse dispositivo em /api/schedule-rest. Best-effort: qualquer
// falha (rede, permissão, servidor fora do ar) devolve null e quem chamou usa
// só o fallback local.
export async function ensurePushSubscription() {
  if (!isPushConfigured()) return null;
  if (cachedSubscriptionId) return cachedSubscriptionId;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    const res = await fetch(`${SERVER_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON() }),
    });
    if (!res.ok) return null;
    const { id } = await res.json();
    cachedSubscriptionId = id;
    return id;
  } catch (e) {
    return null;
  }
}

// Pede pro servidor mandar o push daqui a `delaySeconds` (via QStash). Best-effort.
export async function scheduleServerPush({ delaySeconds, title, body }) {
  if (!isPushConfigured()) return false;
  try {
    const id = await ensurePushSubscription();
    if (!id) return false;
    const res = await fetch(`${SERVER_URL}/api/schedule-rest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delaySeconds, title, body }),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
