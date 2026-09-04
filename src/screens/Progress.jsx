import { useState, useMemo } from "react";
import { Dumbbell, TrendingUp, Trophy } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { C } from "../lib/theme";
import { fmtDate } from "../lib/helpers";
import { StatCard, EmptyState, ChartCard, tooltipStyle } from "../components/Shared";

export default function ProgressScreen({ sessions, allExercises, exercise, setExercise, prMap, streak }) {
  const [view, setView] = useState("exercicio");

  const exerciseData = useMemo(() => {
    return sessions.filter((s) => s.exercises[exercise])
      .map((s) => ({ date: fmtDate(s.date), raw: s.date, weight: Math.max(0, ...s.exercises[exercise].map((x) => parseFloat(x.weight) || 0)) }))
      .filter((d) => d.weight > 0).sort((a, b) => (a.raw < b.raw ? -1 : 1));
  }, [sessions, exercise]);

  const muscleData = useMemo(() => {
    const byMuscle = {};
    const exToMuscle = {};
    allExercises.forEach((e) => { exToMuscle[e.name] = e.muscle; });
    sessions.forEach((s) => {
      Object.entries(s.exercises).forEach(([name, sets]) => {
        const muscle = exToMuscle[name] || "Outro";
        const vol = sets.reduce((acc, set) => acc + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0), 0);
        byMuscle[muscle] = (byMuscle[muscle] || 0) + vol;
      });
    });
    return Object.entries(byMuscle).map(([muscle, volume]) => ({ muscle, volume: Math.round(volume) })).sort((a, b) => b.volume - a.volume);
  }, [sessions, allExercises]);

  const prList = Object.entries(prMap).sort((a, b) => (a[1].date < b[1].date ? 1 : -1));
  const last = exerciseData.length ? exerciseData[exerciseData.length - 1].weight : null;
  const first = exerciseData.length ? exerciseData[0].weight : null;
  const delta = last !== null && first !== null ? last - first : null;

  return (
    <div style={{ padding: "calc(26px + env(safe-area-inset-top)) 20px 26px" }}>
      <div className="disp" style={{ fontSize: 27, fontWeight: 600, marginBottom: 4 }}>Progresso</div>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 18 }}>{streak} treino{streak !== 1 ? "s" : ""} seguidos sem furar o ritmo</div>

      <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[["exercicio", "Exercício"], ["musculo", "Grupo muscular"], ["recordes", "Recordes"]].map(([k, label]) => (
          <button key={k} onClick={() => setView(k)} style={{
            flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
            background: view === k ? C.primary : "transparent", color: view === k ? "#fff" : C.textDim,
            fontSize: 12, fontWeight: 600,
          }}>{label}</button>
        ))}
      </div>

      {view === "exercicio" && (
        <>
          <select value={exercise} onChange={(e) => setExercise(e.target.value)} style={{
            width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "12px 14px", color: C.text, fontSize: 14, marginBottom: 18,
          }}>
            {allExercises.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
          </select>

          {exerciseData.length === 0 ? (
            <EmptyState text="Ainda não há cargas registradas para esse exercício." />
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <StatCard icon={<Dumbbell size={17} color={C.primary} />} value={`${last}kg`} label="carga recente" />
                <StatCard icon={<TrendingUp size={17} color={C.gold} />} value={`${delta >= 0 ? "+" : ""}${delta}kg`} label="evolução" />
              </div>
              <ChartCard>
                <LineChart data={exerciseData} margin={{ top: 5, right: 16, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke={C.textDim} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={C.textDim} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: C.text }} />
                  <Line type="monotone" dataKey="weight" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4, fill: C.gold }} />
                </LineChart>
              </ChartCard>
            </>
          )}
        </>
      )}

      {view === "musculo" && (
        muscleData.length === 0 ? <EmptyState text="Registre treinos para ver o volume por grupo muscular." /> : (
          <ChartCard height={280}>
            <BarChart data={muscleData} layout="vertical" margin={{ top: 5, right: 24, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" stroke={C.textDim} fontSize={10} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="muscle" stroke={C.textDim} fontSize={11.5} tickLine={false} axisLine={false} width={82} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: C.text }} formatter={(v) => [`${v.toLocaleString("pt-BR")} kg`, "Volume"]} />
              <Bar dataKey="volume" fill={C.primary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartCard>
        )
      )}

      {view === "recordes" && (
        prList.length === 0 ? <EmptyState text="Seus recordes de carga vão aparecer aqui conforme você treina." /> : (
          <div>
            {prList.map(([name, pr]) => (
              <div key={name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                  <div style={{ fontSize: 11.5, color: C.textDim, marginTop: 2 }}>{fmtDate(pr.date)} {pr.reps ? `· ${pr.reps} reps` : ""}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Trophy size={16} color={C.gold} />
                  <span className="disp" style={{ fontSize: 19, fontWeight: 600, color: C.gold }}>{pr.weight}kg</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
