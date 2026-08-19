// Chamado pelo QStash quando o delay agendado em /api/schedule-rest termina.
// Manda o Web Push de verdade — é isso que acorda o Service Worker mesmo com o
// iPhone bloqueado (evento 'push' em src/sw.js).
import webpush from "web-push";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { id, title, body } = req.body || {};
  const subscription = await redis.get(`sub:${id}`);
  if (!subscription) return res.status(404).json({ error: "subscription não encontrada" });

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: title || "Descanso terminado 💪", body: body || "Hora da próxima série" })
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 410) {
      await redis.del(`sub:${id}`); // subscription expirada/revogada
    }
    return res.status(500).json({ error: "falha ao enviar push", detail: String(err) });
  }
}
