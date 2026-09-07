import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Activity, Copy, Pencil, Check, X } from "lucide-react";
import { C, inputStyle } from "../lib/theme";
import { fmtDate } from "../lib/helpers";
import { EmptyState } from "../components/Shared";

export default function HistoryScreen({ sessions, expanded, setExpanded, onDelete, onDuplicate, onEditSession }) {
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1));

  function startEdit(s) {
    setEditingId(s.id);
    setEditDraft(JSON.parse(JSON.stringify(s.exercises)));
  }
  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }
  function saveEdit(id) {
    onEditSession(id, editDraft);
    setEditingId(null);
    setEditDraft(null);
  }
  function updateEditSet(name, idx, field, value) {
    setEditDraft((d) => {
      const sets = d[name].slice();
      sets[idx] = { ...sets[idx], [field]: value };
      return { ...d, [name]: sets };
    });
  }
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
            {isOpen && (() => {
              const isEditing = editingId === s.id;
              return (
                <div style={{ padding: "0 16px 16px" }}>
                  {Object.entries(s.exercises).map(([name, sets]) => (
                    <div key={name} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{name}</div>
                      {isEditing ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {editDraft[name]?.map((set, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 14, fontSize: 11.5, color: C.textDim }}>{i + 1}</div>
                              <input type="number" inputMode="decimal" placeholder="kg" value={set.weight}
                                onChange={(e) => updateEditSet(name, i, "weight", e.target.value)} style={inputStyle()} />
                              <input type="number" inputMode="numeric" placeholder="reps" value={set.reps}
                                onChange={(e) => updateEditSet(name, i, "reps", e.target.value)} style={inputStyle()} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {sets.map((set, i) => (
                            <span key={i} style={{ fontSize: 12, background: C.surface2, borderRadius: 8, padding: "4px 8px", color: set.done ? C.text : C.textDim }}>
                              {set.weight ? `${set.weight}kg` : ""} {set.reps ? `x${set.reps}` : "—"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {s.cardio?.duracao && (
                    <div style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
                        <Activity size={13} color={C.primary} /> Cardio
                      </div>
                      <div style={{ fontSize: 12, color: C.textDim }}>
                        {[s.cardio.equipamento, `${s.cardio.duracao} min`, s.cardio.intensidade].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  )}
                  {isEditing ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <button onClick={() => saveEdit(s.id)} style={{
                        flex: 1, background: C.primary, color: "#fff", border: "none", borderRadius: 10,
                        padding: "10px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      }}><Check size={13} /> Salvar</button>
                      <button onClick={cancelEdit} style={{
                        flex: 1, background: "none", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: 10,
                        padding: "10px 0", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      }}><X size={13} /> Cancelar</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                      <button onClick={() => onDuplicate(s)} style={{ background: "none", border: "none", color: C.gold, fontSize: 12.5, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "6px 0" }}>
                        <Copy size={13} /> Duplicar
                      </button>
                      <button onClick={() => startEdit(s)} style={{ background: "none", border: "none", color: C.gold, fontSize: 12.5, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "6px 0" }}>
                        <Pencil size={13} /> Editar
                      </button>
                      <button onClick={() => onDelete(s.id)} style={{ background: "none", border: "none", color: C.primary, fontSize: 12.5, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "6px 0" }}>
                        <Trash2 size={13} /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
