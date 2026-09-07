import { useState, useEffect, useMemo, useRef, Suspense, lazy } from "react";
import { C, FONTS, SYSTEM_FONT } from "./lib/theme";
import { DEFAULT_PLAN, ROTATION } from "./lib/plan";
import { todayISO, lastSetsFor, seedSets, uid } from "./lib/helpers";
import { storeGet, storeSet, photoSet, photoDelete, photoGetBlob } from "./lib/db";

import HomeScreen from "./screens/Home";
import LogScreen from "./screens/Log";
import HistoryScreen from "./screens/History";
import EditScreen from "./screens/Edit";
import ProfileScreen from "./screens/Profile";
import BottomNav from "./components/BottomNav";
import BackgroundArt from "./components/BackgroundArt";

// Progress/Body puxam o recharts (biblioteca pesada) — carregadas sob demanda
// pra manter o carregamento inicial do app leve.
const ProgressScreen = lazy(() => import("./screens/Progress"));
const BodyScreen = lazy(() => import("./screens/Body"));

const DEFAULT_BODY_WEIGHT = 55;

export default function App() {
  const [tab, setTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [sessions, setSessions] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [photoIndex, setPhotoIndex] = useState([]);
  const [draft, setDraft] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [progressExercise, setProgressExercise] = useState(null);
  const [profile, setProfile] = useState({ height: null });

  useEffect(() => {
    (async () => {
      const [p, customized, s, m, ph, d, pf] = await Promise.all([
        storeGet("customPlan", null),
        storeGet("planCustomized", false),
        storeGet("sessions", []),
        storeGet("measurements", []),
        storeGet("photoIndex", []),
        storeGet("draft", null),
        storeGet("profile", { height: null }),
      ]);
      // só usa o plano salvo se ele realmente foi editado por ela (add/editar/
      // remover exercício) — sem isso, uma cópia salva do DEFAULT_PLAN antigo
      // ficava presa pra sempre, escondendo qualquer atualização de exercícios
      // feita no código (ex: troca de exercício por falta de equipamento).
      const activePlan = customized && p ? p : DEFAULT_PLAN;
      setPlan(activePlan);
      setSessions(s);
      setMeasurements(m);
      setPhotoIndex(ph);
      setProfile(pf);
      setProgressExercise(activePlan.A.exercises[0].name);
      // retoma um treino em andamento (ex: app foi recarregado ao voltar de
      // assistir um vídeo de execução e perdeu o estado em memória)
      if (d) { setDraft(d); setTab("log"); }
      setLoading(false);
    })();
  }, []);

  // salva o rascunho do treino em andamento a cada mudança, pra sobreviver
  // a um recarregamento do app (ex: iOS derruba o PWA em segundo plano ao
  // abrir o vídeo do exercício numa aba nova)
  useEffect(() => {
    if (loading) return;
    storeSet("draft", draft);
  }, [draft, loading]);

  // action opcional ({ label, onClick }) mostra um botão no toast (ex: "Desfazer")
  // — dura mais tempo que um toast simples, pra dar tempo de reagir.
  function showToast(msg, { action, duration = 3200 } = {}) {
    clearTimeout(toastTimerRef.current);
    setToast({ msg, action });
    toastTimerRef.current = setTimeout(() => setToast(null), action ? Math.max(duration, 4500) : duration);
  }

  const allExercises = useMemo(() => Object.values(plan).flatMap((w) => w.exercises), [plan]);

  // peso corporal mais recente registrado em Corpo > Medidas, usado pra
  // calcular a sugestão de carga inicial; 55kg é o padrão dela até ela
  // registrar a primeira medida.
  const bodyWeight = useMemo(() => {
    const withWeight = measurements.filter((m) => m.weight);
    if (!withWeight.length) return DEFAULT_BODY_WEIGHT;
    const latest = [...withWeight].sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return parseFloat(latest.weight) || DEFAULT_BODY_WEIGHT;
  }, [measurements]);

  const prMap = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      Object.entries(s.exercises).forEach(([name, sets]) => {
        sets.forEach((set) => {
          const w = parseFloat(set.weight);
          if (!w) return;
          if (!map[name] || w > map[name].weight) map[name] = { weight: w, date: s.date, reps: set.reps };
        });
      });
    });
    return map;
  }, [sessions]);

  const lastWorkout = sessions.length ? sessions[sessions.length - 1].workout : null;
  const suggestedNext = useMemo(() => {
    if (!lastWorkout || !ROTATION.includes(lastWorkout)) return "A";
    return ROTATION[(ROTATION.indexOf(lastWorkout) + 1) % ROTATION.length];
  }, [lastWorkout]);

  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
    let count = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = (new Date(dates[i]) - new Date(dates[i + 1])) / 86400000;
      if (diff <= 4) count++; else break;
    }
    return count;
  }, [sessions]);

  // dias desde o último treino registrado, pro lembrete na Home — mesmo
  // corte de 4 dias usado no cálculo de streak acima (streak quebra depois
  // disso), então o aviso aparece um pouco antes desse limite.
  const daysSinceLast = useMemo(() => {
    if (!sessions.length) return null;
    const lastDate = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1))[0].date;
    return Math.floor((new Date(todayISO()) - new Date(lastDate)) / 86400000);
  }, [sessions]);

  function startWorkout(key) {
    const exercises = {};
    plan[key].exercises.forEach((exx) => { exercises[exx.name] = seedSets(exx, lastSetsFor(sessions, exx.name), bodyWeight); });
    setDraft({ workout: key, date: todayISO(), exercises });
    setTab("log");
  }

  // Repete um treino já registrado como um novo rascunho de hoje, com os
  // mesmos pesos/reps de partida (em vez da sugestão calculada). Usa os
  // exercícios do plano ATUAL pro dia — se algum exercício foi trocado desde
  // então, o novo entra com a sugestão normal em vez de ficar sem valor.
  function duplicateSession(session) {
    const planForDay = plan[session.workout];
    if (!planForDay) { showToast("Esse treino não existe mais no plano atual."); return; }
    const exercises = {};
    planForDay.exercises.forEach((exx) => {
      const prevSets = session.exercises[exx.name];
      exercises[exx.name] = prevSets
        ? prevSets.map((s) => ({ weight: s.weight || "", reps: s.reps || "", done: false }))
        : seedSets(exx, lastSetsFor(sessions, exx.name), bodyWeight);
    });
    setDraft({ workout: session.workout, date: todayISO(), exercises, cardio: session.cardio ? { ...session.cardio } : undefined });
    setTab("log");
    showToast("Treino duplicado — revise e salve quando terminar.");
  }

  async function editSession(id, updatedExercises) {
    const newSessions = sessions.map((s) => (s.id === id ? { ...s, exercises: updatedExercises } : s));
    if (await storeSet("sessions", newSessions)) { setSessions(newSessions); showToast("Registro atualizado!"); }
  }

  function updateSet(name, idx, field, value) {
    setDraft((d) => {
      const copy = { ...d, exercises: { ...d.exercises } };
      const sets = copy.exercises[name].slice();
      sets[idx] = { ...sets[idx], [field]: value };
      copy.exercises[name] = sets;
      return copy;
    });
  }

  // cardio (esteira/bicicleta) é opcional — fica junto do resto do rascunho,
  // então nem precisa de tratamento especial no saveSession pra persistir.
  function updateCardio(field, value) {
    setDraft((d) => ({ ...d, cardio: { ...d.cardio, [field]: value } }));
  }

  async function saveSession() {
    if (!draft) return;
    const newPRs = [];
    Object.entries(draft.exercises).forEach(([name, sets]) => {
      sets.forEach((s) => {
        const w = parseFloat(s.weight);
        if (w && (!prMap[name] || w > prMap[name].weight)) {
          if (!newPRs.includes(name)) newPRs.push(name);
        }
      });
    });
    const newSession = { ...draft, id: uid() };
    const newSessions = [...sessions, newSession];
    const ok = await storeSet("sessions", newSessions);
    if (ok) {
      setSessions(newSessions);
      setDraft(null);
      setTab("history");
      showToast(newPRs.length ? `🏆 Novo recorde em: ${newPRs.join(", ")}` : "Treino salvo com sucesso!");
    } else {
      showToast("Não foi possível salvar agora. Tente de novo.");
    }
  }

  async function deleteSession(id) {
    const removed = sessions.find((s) => s.id === id);
    const newSessions = sessions.filter((s) => s.id !== id);
    if (await storeSet("sessions", newSessions)) {
      setSessions(newSessions);
      if (removed) showToast("Treino excluído.", { action: { label: "Desfazer", onClick: () => restoreSession(removed) } });
    }
  }

  function restoreSession(session) {
    setSessions((prev) => {
      const next = [...prev, session].sort((a, b) => (a.date < b.date ? -1 : 1));
      storeSet("sessions", next);
      return next;
    });
  }

  // customized=false (usado só por "Restaurar plano original") apaga o
  // plano salvo em vez de gravar uma cópia do DEFAULT_PLAN atual — assim
  // ela volta a seguir o plano padrão do código, incluindo atualizações
  // futuras, em vez de ficar presa numa foto do default de hoje.
  async function updatePlan(newPlan, customized = true) {
    setPlan(newPlan);
    if (customized) {
      await storeSet("customPlan", newPlan);
      await storeSet("planCustomized", true);
    } else {
      await storeSet("customPlan", null);
      await storeSet("planCustomized", false);
    }
  }

  async function updateProfile(patch) {
    const newProfile = { ...profile, ...patch };
    if (await storeSet("profile", newProfile)) setProfile(newProfile);
  }

  async function addMeasurement(entry) {
    const newList = [...measurements, { ...entry, id: uid() }];
    if (await storeSet("measurements", newList)) { setMeasurements(newList); showToast("Medida registrada!"); }
  }
  async function deleteMeasurement(id) {
    const removed = measurements.find((m) => m.id === id);
    const newList = measurements.filter((m) => m.id !== id);
    if (await storeSet("measurements", newList)) {
      setMeasurements(newList);
      if (removed) showToast("Medida excluída.", { action: { label: "Desfazer", onClick: () => restoreMeasurement(removed) } });
    }
  }

  function restoreMeasurement(measurement) {
    setMeasurements((prev) => {
      const next = [...prev, measurement].sort((a, b) => (a.date < b.date ? -1 : 1));
      storeSet("measurements", next);
      return next;
    });
  }

  async function addPhoto(entry, blob) {
    const id = uid();
    const okImg = await photoSet(id, blob);
    if (!okImg) { showToast("Não foi possível salvar a foto. Tente outra."); return; }
    const newIndex = [...photoIndex, { ...entry, id }];
    if (await storeSet("photoIndex", newIndex)) { setPhotoIndex(newIndex); showToast("Foto salva!"); }
  }
  async function deletePhoto(id) {
    const removed = photoIndex.find((p) => p.id === id);
    const blob = removed ? await photoGetBlob(id) : null;
    const newIndex = photoIndex.filter((p) => p.id !== id);
    if (await storeSet("photoIndex", newIndex)) setPhotoIndex(newIndex);
    await photoDelete(id);
    if (removed && blob) {
      showToast("Foto excluída.", { action: { label: "Desfazer", onClick: () => restorePhoto(removed, blob) } });
    }
  }

  async function restorePhoto(entry, blob) {
    if (!(await photoSet(entry.id, blob))) return;
    setPhotoIndex((prev) => {
      const next = [...prev, entry].sort((a, b) => (a.date < b.date ? -1 : 1));
      storeSet("photoIndex", next);
      return next;
    });
  }

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONTS}</style>
        <div style={{ color: C.primary, fontFamily: SYSTEM_FONT, fontWeight: 600, fontSize: 18 }}>Carregando…</div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100dvh", color: C.text, fontFamily: SYSTEM_FONT, paddingBottom: tab === "log" ? 0 : 88, position: "relative" }}>
      <style>{FONTS}</style>
      <BackgroundArt />

      {toast && (
        <div style={{
          position: "fixed", top: 14, left: 16, right: 16, zIndex: 100,
          background: C.surface3, border: `1px solid ${C.gold}`, color: C.text,
          borderRadius: 12, padding: "12px 16px", fontSize: 13.5,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          <span style={{ textAlign: toast.action ? "left" : "center", flex: 1 }}>{toast.msg}</span>
          {toast.action && (
            <button onClick={() => { toast.action.onClick(); setToast(null); }} style={{
              background: "none", border: "none", color: C.gold, fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0, padding: 0,
            }}>{toast.action.label}</button>
          )}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {tab === "home" && (
          <HomeScreen plan={plan} sessions={sessions} suggestedNext={suggestedNext} streak={streak} prCount={Object.keys(prMap).length}
            daysSinceLast={daysSinceLast} measurements={measurements} onStart={startWorkout} />
        )}

        {tab === "log" && draft && (
          <LogScreen draft={draft} workout={plan[draft.workout]} updateSet={updateSet} onUpdateCardio={updateCardio} prMap={prMap}
            onCancel={() => { setDraft(null); setTab("home"); }} onSave={saveSession} />
        )}

        {tab === "history" && (
          <HistoryScreen sessions={sessions} expanded={expandedSession} setExpanded={setExpandedSession} onDelete={deleteSession}
            onDuplicate={duplicateSession} onEditSession={editSession} />
        )}

        {tab === "progress" && (
          <Suspense fallback={<ScreenFallback />}>
            <ProgressScreen sessions={sessions} allExercises={allExercises} exercise={progressExercise} setExercise={setProgressExercise} prMap={prMap} streak={streak} />
          </Suspense>
        )}

        {tab === "body" && (
          <Suspense fallback={<ScreenFallback />}>
            <BodyScreen measurements={measurements} addMeasurement={addMeasurement} deleteMeasurement={deleteMeasurement}
              photoIndex={photoIndex} addPhoto={addPhoto} deletePhoto={deletePhoto} />
          </Suspense>
        )}

        {tab === "profile" && (
          <ProfileScreen profile={profile} updateProfile={updateProfile} bodyWeight={bodyWeight} measurements={measurements} />
        )}

        {tab === "edit" && (
          <EditScreen plan={plan} updatePlan={updatePlan} showToast={showToast} />
        )}
      </div>

      {tab !== "log" && <BottomNav tab={tab} setTab={setTab} />}
    </div>
  );
}

function ScreenFallback() {
  return (
    <div style={{ padding: "26px 20px", color: C.textDim, fontSize: 13.5 }}>Carregando…</div>
  );
}
