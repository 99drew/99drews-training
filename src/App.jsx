import { useState, useEffect, useMemo, Suspense, lazy } from "react";
import { C, FONTS } from "./lib/theme";
import { DEFAULT_PLAN, ROTATION } from "./lib/plan";
import { todayISO, emptySets, uid } from "./lib/helpers";
import { storeGet, storeSet, photoSet, photoDelete } from "./lib/db";

import HomeScreen from "./screens/Home";
import LogScreen from "./screens/Log";
import HistoryScreen from "./screens/History";
import EditScreen from "./screens/Edit";
import BottomNav from "./components/BottomNav";

// Progress/Body puxam o recharts (biblioteca pesada) — carregadas sob demanda
// pra manter o carregamento inicial do app leve.
const ProgressScreen = lazy(() => import("./screens/Progress"));
const BodyScreen = lazy(() => import("./screens/Body"));

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
  const [progressExercise, setProgressExercise] = useState(null);

  useEffect(() => {
    (async () => {
      const [p, s, m, ph] = await Promise.all([
        storeGet("customPlan", null),
        storeGet("sessions", []),
        storeGet("measurements", []),
        storeGet("photoIndex", []),
      ]);
      setPlan(p || DEFAULT_PLAN);
      setSessions(s);
      setMeasurements(m);
      setPhotoIndex(ph);
      setProgressExercise((p || DEFAULT_PLAN).A.exercises[0].name);
      setLoading(false);
    })();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  const allExercises = useMemo(() => Object.values(plan).flatMap((w) => w.exercises), [plan]);

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

  function startWorkout(key) {
    const exercises = {};
    plan[key].exercises.forEach((exx) => { exercises[exx.name] = emptySets(exx); });
    setDraft({ workout: key, date: todayISO(), exercises });
    setTab("log");
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
    const newSessions = sessions.filter((s) => s.id !== id);
    if (await storeSet("sessions", newSessions)) setSessions(newSessions);
  }

  async function updatePlan(newPlan) {
    setPlan(newPlan);
    await storeSet("customPlan", newPlan);
  }

  async function addMeasurement(entry) {
    const newList = [...measurements, { ...entry, id: uid() }];
    if (await storeSet("measurements", newList)) { setMeasurements(newList); showToast("Medida registrada!"); }
  }
  async function deleteMeasurement(id) {
    const newList = measurements.filter((m) => m.id !== id);
    if (await storeSet("measurements", newList)) setMeasurements(newList);
  }

  async function addPhoto(entry, blob) {
    const id = uid();
    const okImg = await photoSet(id, blob);
    if (!okImg) { showToast("Não foi possível salvar a foto. Tente outra."); return; }
    const newIndex = [...photoIndex, { ...entry, id }];
    if (await storeSet("photoIndex", newIndex)) { setPhotoIndex(newIndex); showToast("Foto salva!"); }
  }
  async function deletePhoto(id) {
    const newIndex = photoIndex.filter((p) => p.id !== id);
    if (await storeSet("photoIndex", newIndex)) setPhotoIndex(newIndex);
    await photoDelete(id);
  }

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{FONTS}</style>
        <div style={{ color: C.gold, fontFamily: "Fraunces, serif", fontSize: 18 }}>Carregando…</div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "Inter, sans-serif", paddingBottom: tab === "log" ? 0 : 88, position: "relative" }}>
      <style>{FONTS}</style>

      {toast && (
        <div style={{
          position: "fixed", top: 14, left: 16, right: 16, zIndex: 100,
          background: C.surface3, border: `1px solid ${C.gold}`, color: C.text,
          borderRadius: 12, padding: "12px 16px", fontSize: 13.5, textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>{toast}</div>
      )}

      {tab === "home" && (
        <HomeScreen plan={plan} sessions={sessions} suggestedNext={suggestedNext} streak={streak} prCount={Object.keys(prMap).length} onStart={startWorkout} />
      )}

      {tab === "log" && draft && (
        <LogScreen draft={draft} workout={plan[draft.workout]} updateSet={updateSet} prMap={prMap}
          onCancel={() => { setDraft(null); setTab("home"); }} onSave={saveSession} />
      )}

      {tab === "history" && (
        <HistoryScreen sessions={sessions} expanded={expandedSession} setExpanded={setExpandedSession} onDelete={deleteSession} />
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

      {tab === "edit" && (
        <EditScreen plan={plan} updatePlan={updatePlan} showToast={showToast} />
      )}

      {tab !== "log" && <BottomNav tab={tab} setTab={setTab} />}
    </div>
  );
}

function ScreenFallback() {
  return (
    <div style={{ padding: "26px 20px", color: C.textDim, fontSize: 13.5 }}>Carregando…</div>
  );
}
