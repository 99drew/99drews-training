import { C, tooltipStyle, inputStyle } from "../lib/theme";
import { ResponsiveContainer } from "recharts";

export function StatCard({ icon, value, label }) {
  return (
    <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 12px" }}>
      <div style={{ marginBottom: 7 }}>{icon}</div>
      <div className="disp" style={{ fontSize: 21, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 1 }}>{label}</div>
    </div>
  );
}

export function EmptyState({ text }) {
  return <div style={{ border: `1px dashed ${C.border}`, borderRadius: 12, padding: "28px 18px", textAlign: "center", color: C.textDim, fontSize: 13.5 }}>{text}</div>;
}

export function ChartCard({ children, height = 220 }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 8px 8px" }}>
      <ResponsiveContainer width="100%" height={height}>{children}</ResponsiveContainer>
    </div>
  );
}

export function LabeledInput({ label, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: C.textDim, marginBottom: 4 }}>{label}</div>
      <input type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle(1)} />
    </div>
  );
}

export function FieldLabel({ text }) {
  return <div style={{ fontSize: 11, color: C.textDim, marginBottom: 5, fontWeight: 600 }}>{text}</div>;
}

// Mini-gráfico de tendência sem eixos/tooltip, pra widgets pequenos (ex:
// peso corporal na Home) — não usa recharts de propósito, já que a Home
// carrega direto (sem lazy loading) e recharts é pesado o bastante pra ter
// sido isolado só nas telas Progresso/Corpo (ver comentário em App.jsx).
export function Sparkline({ data, color = C.primary, height = 40 }) {
  if (data.length < 2) return null;
  const width = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export { tooltipStyle };
