// POST { subscription: PushSubscriptionJSON } -> guarda a subscription no Redis (Upstash),
// indexada pelo endpoint (é único por dispositivo/navegador instalado).
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { subscription } = req.body || {};
  if (!subscription?.endpoint) return res.status(400).json({ error: "subscription inválida" });

  const id = Buffer.from(subscription.endpoint).toString("base64url");
  await redis.set(`sub:${id}`, subscription, { ex: 60 * 60 * 24 * 180 }); // expira em 180 dias sem uso
  return res.status(200).json({ id });
}
