import { C, tooltipStyle, inputStyle } from "../lib/theme";
import { ResponsiveContainer } from "recharts";

export function StatCard({ icon, value, label }) {
  return (
    <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "13px 12px" }}>
      <div style={{ marginBottom: 7 }}>{icon}</div>
      <div className="disp" style={{ fontSize: 21, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.textDim, marginTop: 1 }}>{label}</div>
    </div>
  );
}

export function EmptyState({ text }) {
  return <div style={{ border: `1px dashed ${C.border}`, borderRadius: 14, padding: "28px 18px", textAlign: "center", color: C.textDim, fontSize: 13.5 }}>{text}</div>;
}

export function ChartCard({ children, height = 220 }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 8px 8px" }}>
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

export { tooltipStyle };
