import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Timer, SkipForward, PlayCircle, Check, Trophy, Info, Activity } from "lucide-react";
import { C, inputStyle } from "../lib/theme";
import { beep, uid } from "../lib/helpers";
import { requestNotificationPermission, scheduleRestNotification, cancelRestNotification } from "../lib/notifications";
import ExerciseImage from "../components/ExerciseImage";

export default function LogScreen({ draft, workout, updateSet, onUpdateCardio, prMap, onCancel, onSave }) {
  const [timer, setTimer] = useState(null); // { id, total, remaining, exName }
  const intervalRef = useRef(null);
  const askedPermission = useRef(false);

  useEffect(() => {
    if (!timer) return;
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (!t) return t;
        if (t.remaining <= 1) {
          clearInterval(intervalRef.current);
          beep();
          cancelRestNotification(t.id);
          return null;
        }
        return { ...t, remaining: t.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [timer?.id]);

  async function handleToggle(exx, idx, nextDone) {
    updateSet(exx.name, idx, "done", nextDone);
    if (!nextDone) return;

    if (!askedPermission.current) {
      askedPermission.current = true;
      await requestNotificationPermission();
    }

    const id = uid();
    setTimer({ id, total: exx.rest, remaining: exx.rest, exName: exx.name });
    scheduleRestNotification({ id, delaySeconds: exx.rest, exerciseName: exx.name });
  }

  function addFifteen() {
    setTimer((t) => {
      if (!t) return t;
      const next = { ...t, total: t.total + 15, remaining: t.remaining + 15 };
      scheduleRestNotification({ id: t.id, delaySeconds: next.remaining, exerciseName: t.exName });
      return next;
    });
  }

  function stopTimer() {
    if (timer) cancelRestNotification(timer.id);
    setTimer(null);
  }

  const totalSets = Object.values(draft.exercises).flat().length;
  const doneSets = Object.values(draft.exercises).flat().filter((s) => s.done).length;

  return (
    <div style={{ paddingBottom: timer ? 110 : 40, minHeight: "100dvh" }}>
      <div style={{ position: "sticky", top: 0, background: C.bg, zIndex: 10, padding: "calc(20px + env(safe-area-inset-top)) 20px 14px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onCancel} style={{ background: "none", border: "none", color: C.textDim, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: 4 }}>
            <ChevronLeft size={20} /> <span style={{ fontSize: 14 }}>Cancelar</span>
          </button>
          <div style={{ fontSize: 12, color: C.textDim }}>{doneSets}/{totalSets} séries</div>
        </div>
        <div className="disp" style={{ fontSize: 25, fontWeight: 600, marginTop: 6 }}>{workout.label}</div>
        <div style={{ fontSize: 13, color: C.textDim }}>{workout.focus}</div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {workout.exercises.map((exx) => (
          <ExerciseLogCard key={exx.name} exercise={exx} sets={draft.exercises[exx.name]} pr={prMap[exx.name]}
            onChange={(idx, field, value) => updateSet(exx.name, idx, field, value)}
            onToggleDone={(idx, next) => handleToggle(exx, idx, next)} />
        ))}

        <CardioCard cardio={draft.cardio} onUpdateCardio={onUpdateCardio} />

        <button onClick={onSave} style={{
          width: "100%", background: C.primary, color: "#fff", border: "none", borderRadius: 14,
          padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 8,
        }}>Salvar treino de hoje</button>

        {workout.exercises.some((e) => e.image) && (
          <div style={{ fontSize: 10.5, color: C.textFaint, textAlign: "center", marginTop: 14 }}>
            Imagens dos exercícios: wger.de (CC-BY-SA)
          </div>
        )}
      </div>

      {timer && <RestTimerBar timer={timer} onAddFifteen={addFifteen} onStop={stopTimer} />}
    </div>
  );
}

function RestTimerBar({ timer, onAddFifteen, onStop }) {
  const pct = 1 - timer.remaining / timer.total;
  const mm = String(Math.floor(timer.remaining / 60)).padStart(1, "0");
  const ss = String(timer.remaining % 60).padStart(2, "0");
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      background: C.surface3, borderTop: `1px solid ${C.gold}`,
      padding: "14px 20px calc(14px + env(safe-area-inset-bottom))",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Timer size={16} color={C.gold} />
          <span style={{ fontSize: 12.5, color: C.textDim }}>Descanso — {timer.exName}</span>
        </div>
        <div className="disp" style={{ fontSize: 22, fontWeight: 600, color: C.gold }}>{mm}:{ss}</div>
      </div>
      <div style={{ height: 5, background: C.border, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: C.gold, transition: "width 1s linear" }} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onAddFifteen}
          style={{ flex: 1, background: C.surface2, border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: "9px 0", fontSize: 12.5, cursor: "pointer" }}>+15s</button>
        <button onClick={onStop}
          style={{ flex: 1, background: "none", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: 10, padding: "9px 0", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          <SkipForward size={13} /> Pular
        </button>
      </div>
    </div>
  );
}

function ExerciseLogCard({ exercise, sets, pr, onChange, onToggleDone }) {
  // sem recorde anterior = sem histórico nenhum ainda; se a 1ª série já
  // veio preenchida (pela sugestão calculada a partir do peso corporal),
  // mostra o aviso de que é só um ponto de partida.
  const showSuggestionHint = !pr && Boolean(sets[0]?.weight) && !exercise.timed;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <ExerciseImage exercise={exercise} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{exercise.name}</div>
            <div style={{ fontSize: 11.5, color: C.textDim, whiteSpace: "nowrap" }}>{exercise.sets}x{exercise.reps}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
            {exercise.video && (
              <a href={exercise.video} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: C.gold, textDecoration: "none",
                border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 10px 4px 8px", background: C.surface2,
              }}><PlayCircle size={13} /> Ver execução</a>
            )}
            {pr && <span style={{ fontSize: 11, color: C.textFaint }}>recorde: {pr.weight}kg</span>}
          </div>
        </div>
      </div>

      {exercise.note && (
        <div style={{
          display: "flex", gap: 6, alignItems: "flex-start", fontSize: 11.5, color: C.textDim,
          background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 10px", marginBottom: 12,
        }}>
          <Info size={13} color={C.textFaint} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{exercise.note}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sets.map((s, i) => {
          const w = parseFloat(s.weight);
          const isPR = Boolean(w) && (!pr || w > pr.weight);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, fontSize: 12, color: C.textDim }}>{i + 1}</div>
              {exercise.timed ? (
                <input type="number" inputMode="numeric" placeholder="segundos" value={s.reps}
                  onChange={(e) => onChange(i, "reps", e.target.value)} style={inputStyle(1)} />
              ) : (
                <>
                  <input type="number" inputMode="decimal" placeholder="kg" value={s.weight}
                    onChange={(e) => onChange(i, "weight", e.target.value)} style={inputStyle()} />
                  <input type="number" inputMode="numeric" placeholder="reps" value={s.reps}
                    onChange={(e) => onChange(i, "reps", e.target.value)} style={inputStyle()} />
                </>
              )}
              {isPR && <Trophy size={14} color={C.gold} style={{ flexShrink: 0 }} />}
              <button onClick={() => onToggleDone(i, !s.done)} style={{
                width: 34, height: 34, borderRadius: 9, border: `1px solid ${s.done ? C.gold : C.border}`,
                background: s.done ? C.gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, cursor: "pointer",
              }}><Check size={16} color={s.done ? "#fff" : C.textDim} /></button>
            </div>
          );
        })}
      </div>

      {showSuggestionHint && (
        <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 8 }}>Sugestão inicial — ajuste conforme sentir.</div>
      )}
    </div>
  );
}

// Cardio (esteira/bicicleta) é opcional e independente da musculação — não
// participa de séries/PR/sugestão de carga, só fica salvo junto no rascunho.
function CardioCard({ cardio, onUpdateCardio }) {
  const equipamento = cardio?.equipamento || "";
  const duracao = cardio?.duracao || "";
  const intensidade = cardio?.intensidade || "";

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 12 }}>
        <Activity size={15} color={C.primary} style={{ alignSelf: "center" }} />
        <div style={{ fontWeight: 700, fontSize: 14 }}>Cardio</div>
        <span style={{ fontSize: 10.5, color: C.textFaint }}>(opcional)</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {["Esteira", "Bicicleta"].map((opt) => (
          <button key={opt} onClick={() => onUpdateCardio("equipamento", equipamento === opt ? "" : opt)} style={{
            flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${equipamento === opt ? C.primary : C.border}`,
            background: equipamento === opt ? C.primaryDim : C.surface2, color: C.text,
          }}>{opt}</button>
        ))}
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 5, fontWeight: 600 }}>Duração (minutos)</div>
        <input type="number" inputMode="numeric" placeholder="ex: 15" value={duracao}
          onChange={(e) => onUpdateCardio("duracao", e.target.value)} style={inputStyle(1)} />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["leve", "moderada", "intensa"].map((opt) => (
          <button key={opt} onClick={() => onUpdateCardio("intensidade", intensidade === opt ? "" : opt)} style={{
            flex: 1, padding: "7px 0", borderRadius: 9, fontSize: 11.5, textTransform: "capitalize", cursor: "pointer",
            border: `1px solid ${intensidade === opt ? C.primary : C.border}`,
            background: intensidade === opt ? C.primaryDim : "transparent", color: C.text,
          }}>{opt}</button>
        ))}
      </div>

      <div style={{ fontSize: 10.5, color: C.textFaint, lineHeight: 1.4 }}>
        5-10 min leve como aquecimento, ou 15-20 min moderado no final como queima extra.
      </div>
    </div>
  );
}
