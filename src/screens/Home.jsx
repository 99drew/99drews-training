import { Flame, Dumbbell, Trophy, ChevronRight } from "lucide-react";
import { C } from "../lib/theme";
import { StatCard } from "../components/Shared";

export default function HomeScreen({ plan, sessions, suggestedNext, streak, prCount, onStart }) {
  return (
    <div style={{ padding: "30px 20px 20px" }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>SEU PROGRAMA</div>
        <div className="disp" style={{ fontSize: 32, fontWeight: 600, marginTop: 3 }}>Massa & Definição</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 26 }}>
        <StatCard icon={<Flame size={17} color={C.gold} />} value={streak} label="sequência" />
        <StatCard icon={<Dumbbell size={17} color={C.primary} />} value={sessions.length} label="treinos" />
        <StatCard icon={<Trophy size={17} color={C.gold} />} value={prCount} label="recordes" />
      </div>

      <div style={{ fontSize: 12.5, color: C.textDim, marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>TREINO DE HOJE</div>

      {Object.entries(plan).map(([key, w]) => (
        <button key={key} onClick={() => onStart(key)} style={{
          width: "100%",
          background: key === suggestedNext ? `linear-gradient(135deg, ${C.primaryDim}, ${C.surface2})` : C.surface,
          border: `1px solid ${key === suggestedNext ? C.primary : C.border}`,
          borderRadius: 18, padding: "18px 18px", marginBottom: 12,
          display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="disp" style={{ fontSize: 21, fontWeight: 600 }}>{w.label}</span>
              {key === suggestedNext && (
                <span style={{ fontSize: 9.5, background: C.gold, color: "#231A0A", borderRadius: 20, padding: "2.5px 8px", fontWeight: 800, letterSpacing: 0.5 }}>PRÓXIMO</span>
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
