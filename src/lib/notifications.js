// ============================== NOTIFICAÇÕES DO CRONÔMETRO ==============================
// Camadas, da mais para a menos confiável:
//  1) App aberto em primeiro plano: beep + vibração tocam direto na página (sempre funciona).
//  2) App em segundo plano / tela apagada, mas o processo ainda vivo: pedimos pro Service
//     Worker chamar showNotification() depois de `delayMs` (setTimeout dentro do SW).
//     Isso funciona na maioria das vezes em uso normal, mas iOS pode suspender o SW antes
//     do tempo — não é garantido. Ver README para a solução robusta (Web Push real).
//  3) Tela bloqueada / app "matado" pelo sistema: só é confiável com Web Push de verdade
//     (um servidor manda o push na hora certa; o SO acorda o Service Worker pro evento
//     `push`). Esse caminho está implementado no SW (self.addEventListener('push', ...))
//     e o scaffold do servidor está em /server — precisa ser configurado e implantado
//     separadamente (ver README).

import { scheduleServerPush } from "./push";

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch (e) {
    return "denied";
  }
}

async function getActiveRegistration() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch (e) {
    return null;
  }
}

// Pede pro Service Worker disparar uma notificação local em `delaySeconds`.
// Melhor esforço: só funciona enquanto o navegador não suspende o worker.
export async function scheduleRestNotification({ id, delaySeconds, exerciseName }) {
  if (!isNotificationSupported() || Notification.permission !== "granted") return false;
  const title = "Descanso terminado 💪";
  const body = exerciseName ? `Hora da próxima série — ${exerciseName}` : "Hora da próxima série";

  // Caminho robusto (só ativo se /server estiver configurado e implantado — ver README).
  scheduleServerPush({ delaySeconds, title, body });

  // Fallback de melhor esforço, sempre tentado também.
  const reg = await getActiveRegistration();
  if (!reg || !reg.active) return false;
  reg.active.postMessage({
    type: "SCHEDULE_REST_NOTIFICATION",
    payload: { id, delayMs: Math.max(0, delaySeconds * 1000), title, body, tag: "rest-timer" },
  });
  return true;
}

export async function cancelRestNotification(id) {
  const reg = await getActiveRegistration();
  if (!reg || !reg.active) return;
  reg.active.postMessage({ type: "CANCEL_REST_NOTIFICATION", payload: { id } });
}
