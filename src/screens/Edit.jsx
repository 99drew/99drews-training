import { useState } from "react";
import { Pencil, Trash2, Plus, RotateCcw, X } from "lucide-react";
import { C, inputStyle } from "../lib/theme";
import { ex, MUSCLES, DEFAULT_PLAN } from "../lib/plan";
import { FieldLabel } from "../components/Shared";
import ExerciseImage from "../components/ExerciseImage";

function blankForm() { return { name: "", sets: 3, reps: "10-12", muscle: MUSCLES[0], rest: 60, video: "" }; }

export default function EditScreen({ plan, updatePlan, showToast }) {
  const [day, setDay] = useState("A");
  const [adding, setAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [form, setForm] = useState(blankForm());

  function openEdit(idx) {
    const e = plan[day].exercises[idx];
    setForm({ name: e.name, sets: e.sets, reps: e.reps, muscle: e.muscle, rest: e.rest, video: e.video || "" });
    setEditingIdx(idx);
    setAdding(true);
  }

  function openAdd() {
    setForm(blankForm());
    setEditingIdx(null);
    setAdding(true);
  }

  function save() {
    if (!form.name.trim()) { showToast("Dá um nome pro exercício."); return; }
    const newExercise = ex(form.name.trim(), Number(form.sets) || 1, form.reps, form.muscle, Number(form.rest) || 60, form.video || undefined, undefined, false);
    const list = [...plan[day].exercises];
    if (editingIdx !== null) list[editingIdx] = newExercise; else list.push(newExercise);
    updatePlan({ ...plan, [day]: { ...plan[day], exercises: list } });
    setAdding(false);
    showToast(editingIdx !== null ? "Exercício atualizado!" : "Exercício adicionado!");
  }

  function removeExercise(idx) {
    const list = plan[day].exercises.filter((_, i) => i !== idx);
    updatePlan({ ...plan, [day]: { ...plan[day], exercises: list } });
  }

  function resetToDefault() {
    updatePlan(DEFAULT_PLAN, false);
    showToast("Plano restaurado para o padrão.");
  }

  return (
    <div style={{ padding: "calc(26px + env(safe-area-inset-top)) 20px 26px" }}>
      <div className="disp" style={{ fontSize: 27, fontWeight: 600, marginBottom: 4 }}>Editar treino</div>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 18 }}>Personalize exercícios, séries e cargas-alvo</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {Object.keys(plan).map((k) => (
          <button key={k} onClick={() => setDay(k)} style={{
            flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            border: `1px solid ${day === k ? C.primary : C.border}`, background: day === k ? C.primary : C.surface, color: "#fff",
          }}>{k}</button>
        ))}
      </div>

      {plan[day].exercises.map((e, idx) => (
        <div key={e.id + idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 15px", marginBottom: 9, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
            <ExerciseImage exercise={e} size={44} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{e.name}</div>
              <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{e.sets}x{e.reps} · {e.muscle} · descanso {e.rest}s</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button onClick={() => openEdit(idx)} style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", padding: 6 }}><Pencil size={15} /></button>
            <button onClick={() => removeExercise(idx)} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", padding: 6 }}><Trash2 size={15} /></button>
          </div>
        </div>
      ))}

      {plan[day].exercises.some((e) => e.image) && (
        <div style={{ fontSize: 10.5, color: C.textFaint, textAlign: "center", marginTop: 10 }}>
          Imagens dos exercícios: wger.de (CC-BY-SA)
        </div>
      )}

      <button onClick={openAdd} style={{
        width: "100%", background: C.surface2, border: `1px dashed ${C.border}`, color: C.text, borderRadius: 12,
        padding: "13px 0", fontSize: 13.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 6,
      }}><Plus size={15} /> Adicionar exercício</button>

      <button onClick={resetToDefault} style={{
        width: "100%", background: "none", border: "none", color: C.textFaint, fontSize: 11.5, cursor: "pointer",
        marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
      }}><RotateCcw size={12} /> Restaurar plano original</button>

      {adding && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: C.surface2, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: "20px 20px calc(20px + env(safe-area-inset-bottom))", width: "100%", maxHeight: "85dvh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{editingIdx !== null ? "Editar exercício" : "Novo exercício"}</div>
              <button onClick={() => setAdding(false)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer" }}><X size={20} /></button>
            </div>

            <FieldLabel text="Nome do exercício" />
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle(1), marginBottom: 12 }} placeholder="ex: Cadeira adutora" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div><FieldLabel text="Séries" /><input type="number" value={form.sets} onChange={(e) => setForm({ ...form, sets: e.target.value })} style={inputStyle(1)} /></div>
              <div><FieldLabel text="Repetições" /><input value={form.reps} onChange={(e) => setForm({ ...form, reps: e.target.value })} style={inputStyle(1)} placeholder="10-12" /></div>
            </div>

            <FieldLabel text="Grupo muscular" />
            <select value={form.muscle} onChange={(e) => setForm({ ...form, muscle: e.target.value })} style={{ ...inputStyle(1), marginBottom: 12 }}>
              {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            <FieldLabel text="Descanso (segundos)" />
            <input type="number" value={form.rest} onChange={(e) => setForm({ ...form, rest: e.target.value })} style={{ ...inputStyle(1), marginBottom: 12 }} />

            <FieldLabel text="Link de vídeo (opcional)" />
            <input value={form.video} onChange={(e) => setForm({ ...form, video: e.target.value })} style={{ ...inputStyle(1), marginBottom: 18 }} placeholder="https://youtube.com/..." />

            <button onClick={save} style={{ width: "100%", background: C.primary, color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
              {editingIdx !== null ? "Salvar alterações" : "Adicionar ao treino"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
