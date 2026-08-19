// POST { id, delaySeconds, title, body } -> agenda uma chamada pro /api/send-push
// daqui a `delaySeconds`, via Upstash QStash (fila com delay, roda mesmo com este
// serverless function "desligado" nesse meio tempo — é o QStash que segura o tempo).
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  const { id, delaySeconds, title, body } = req.body || {};
  if (!id || !delaySeconds) return res.status(400).json({ error: "id e delaySeconds são obrigatórios" });

  const destination = `${process.env.PUBLIC_SERVER_URL}/api/send-push`;
  const qstashRes = await fetch(`https://qstash.upstash.io/v2/publish/${encodeURIComponent(destination)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
      "Content-Type": "application/json",
      "Upstash-Delay": `${Math.max(0, Math.round(delaySeconds))}s`,
      // dedupe: reagendar (+15s) com o mesmo id substitui o agendamento anterior
      "Upstash-Deduplication-Id": `rest:${id}`,
    },
    body: JSON.stringify({ id, title, body }),
  });

  if (!qstashRes.ok) {
    const text = await qstashRes.text();
    return res.status(502).json({ error: "falha ao agendar no QStash", detail: text });
  }
  return res.status(200).json({ ok: true });
}
