import { useMemo } from "react";
import { Flame, Dumbbell, Trophy, ChevronRight, BellRing, Scale } from "lucide-react";
import { C } from "../lib/theme";
import { StatCard, Sparkline } from "../components/Shared";

export default function HomeScreen({ plan, sessions, suggestedNext, streak, prCount, daysSinceLast, measurements, onStart }) {
  const weightData = useMemo(() => {
    return [...measurements].filter((m) => m.weight)
      .map((m) => ({ date: m.date, weight: parseFloat(m.weight) }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [measurements]);
  const lastWeight = weightData.length ? weightData[weightData.length - 1].weight : null;
  const firstWeight = weightData.length ? weightData[0].weight : null;
  const weightDelta = lastWeight !== null && firstWeight !== null ? lastWeight - firstWeight : null;

  return (
    <div style={{ padding: "calc(30px + env(safe-area-inset-top)) 20px 20px" }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>SEU PROGRAMA</div>
        <div className="disp" style={{ fontSize: 32, fontWeight: 600, marginTop: 3 }}>Massa & Definição</div>
      </div>

      {daysSinceLast !== null && daysSinceLast >= 3 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid ${C.gold}`,
          borderRadius: 12, padding: "12px 14px", marginBottom: 20,
        }}>
          <BellRing size={17} color={C.gold} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 12.5, color: C.text }}>
            Já se passaram <strong>{daysSinceLast} dias</strong> desde o último treino — bora manter o ritmo?
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
        <StatCard icon={<Flame size={17} color={C.gold} />} value={streak} label="sequência" />
        <StatCard icon={<Dumbbell size={17} color={C.primary} />} value={sessions.length} label="treinos" />
        <StatCard icon={<Trophy size={17} color={C.gold} />} value={prCount} label="recordes" />
      </div>

      {weightData.length >= 2 && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Scale size={14} color={C.textDim} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: C.textDim, letterSpacing: 0.4 }}>PESO CORPORAL</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="disp" style={{ fontSize: 18, fontWeight: 600 }}>{lastWeight}kg</span>
              {weightDelta !== null && weightDelta !== 0 && (
                <span style={{ fontSize: 11, color: weightDelta > 0 ? C.textDim : C.gold }}>{weightDelta > 0 ? "+" : ""}{weightDelta.toFixed(1)}kg</span>
              )}
            </div>
          </div>
          <Sparkline data={weightData.map((d) => d.weight)} color={C.gold} />
        </div>
      )}

      <div style={{ fontSize: 12.5, color: C.textDim, marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>TREINO DE HOJE</div>

      {Object.entries(plan).map(([key, w]) => (
        <button key={key} onClick={() => onStart(key)} style={{
          width: "100%",
          background: key === suggestedNext ? `linear-gradient(135deg, ${C.primaryDim}, ${C.surface2})` : C.surface,
          border: `1px solid ${key === suggestedNext ? C.primary : C.border}`,
          borderRadius: 12, padding: "18px 18px", marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="disp" style={{ fontSize: 21, fontWeight: 600 }}>{w.label}</span>
              {key === suggestedNext && (
                <span style={{ fontSize: 9.5, background: C.primaryDim, border: `1px solid ${C.primary}`, color: "#fff", borderRadius: 999, padding: "2.5px 8px", fontWeight: 800, letterSpacing: 0.5 }}>PRÓXIMO</span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: C.textDim, marginTop: 5, maxWidth: 230 }}>{w.focus}</div>
            <div style={{ fontSize: 11, color: C.textFaint, marginTop: 6 }}>{w.exercises.length} exercícios</div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ChevronRight size={20} color="#fff" />
          </div>
        </button>
      ))}
    </div>
  );
}
