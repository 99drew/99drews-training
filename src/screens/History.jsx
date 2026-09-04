import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { C } from "../lib/theme";
import { fmtDate } from "../lib/helpers";
import { EmptyState } from "../components/Shared";

export default function HistoryScreen({ sessions, expanded, setExpanded, onDelete }) {
  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div style={{ padding: "calc(26px + env(safe-area-inset-top)) 20px 26px" }}>
      <div className="disp" style={{ fontSize: 27, fontWeight: 600, marginBottom: 4 }}>Histórico</div>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 18 }}>{sessions.length} treino{sessions.length !== 1 ? "s" : ""} registrado{sessions.length !== 1 ? "s" : ""}</div>

      {sorted.length === 0 && <EmptyState text="Nenhum treino registrado ainda. Vá em Início e comece o treino de hoje." />}

      {sorted.map((s) => {
        const isOpen = expanded === s.id;
        const totalVolume = Object.values(s.exercises).flat().reduce((acc, set) => acc + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0), 0);
        return (
          <div key={s.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
            <button onClick={() => setExpanded(isOpen ? null : s.id)} style={{
              width: "100%", background: "none", border: "none", padding: "14px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: C.text, textAlign: "left",
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Treino {s.workout} · {fmtDate(s.date)}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{totalVolume > 0 ? `${Math.round(totalVolume).toLocaleString("pt-BR")} kg de volume` : "Sem carga registrada"}</div>
              </div>
              {isOpen ? <ChevronUp size={18} color={C.textDim} /> : <ChevronDown size={18} color={C.textDim} />}
            </button>
            {isOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                {Object.entries(s.exercises).map(([name, sets]) => (
                  <div key={name} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {sets.map((set, i) => (
                        <span key={i} style={{ fontSize: 12, background: C.surface2, borderRadius: 8, padding: "4px 8px", color: set.done ? C.text : C.textDim }}>
                          {set.weight ? `${set.weight}kg` : ""} {set.reps ? `x${set.reps}` : "—"}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => onDelete(s.id)} style={{ marginTop: 6, background: "none", border: "none", color: C.primary, fontSize: 12.5, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "6px 0" }}>
                  <Trash2 size={13} /> Excluir registro
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
