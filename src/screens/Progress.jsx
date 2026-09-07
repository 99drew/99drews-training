import { useState, useMemo } from "react";
import { Dumbbell, TrendingUp, Trophy, Activity } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { C } from "../lib/theme";
import { fmtDate, todayISO } from "../lib/helpers";
import { StatCard, EmptyState, ChartCard, tooltipStyle } from "../components/Shared";

const HEATMAP_WEEKS = 18;
const DOW_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

// Grade de semanas (colunas) x dias (linhas, domingo a sábado), alinhada ao
// fim da semana atual — mesmo formato do calendário de contribuições do
// GitHub. Dias no futuro (resto da semana atual) ficam marcados como tal
// pra não desenhar quadrado nenhum ali.
function buildHeatmapWeeks(sessions, weeks = HEATMAP_WEEKS) {
  const countByDate = {};
  sessions.forEach((s) => { countByDate[s.date] = (countByDate[s.date] || 0) + 1; });

  const today = new Date(todayISO() + "T00:00:00");
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
  const startDate = new Date(endOfWeek);
  startDate.setDate(endOfWeek.getDate() - weeks * 7 + 1);

  const cols = [];
  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + w * 7 + d);
      const iso = day.toISOString().slice(0, 10);
      col.push({ date: iso, count: countByDate[iso] || 0, isFuture: day > today });
    }
    cols.push(col);
  }
  return cols;
}

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

  // minutos de cardio (esteira/bicicleta) nos últimos 7 e 30 dias, contando
  // a partir de hoje — janela corrida, não semana/mês de calendário.
  const cardioMinutes = useMemo(() => {
    const today = new Date(todayISO() + "T00:00:00");
    let week = 0, month = 0;
    sessions.forEach((s) => {
      const mins = parseFloat(s.cardio?.duracao) || 0;
      if (!mins) return;
      const daysAgo = (today - new Date(s.date + "T00:00:00")) / 86400000;
      if (daysAgo < 7) week += mins;
      if (daysAgo < 30) month += mins;
    });
    return { week, month };
  }, [sessions]);

  const heatmapWeeks = useMemo(() => buildHeatmapWeeks(sessions), [sessions]);
  const heatmapDaysTrained = heatmapWeeks.flat().filter((d) => d.count > 0).length;

  const prList = Object.entries(prMap).sort((a, b) => (a[1].date < b[1].date ? 1 : -1));
  const last = exerciseData.length ? exerciseData[exerciseData.length - 1].weight : null;
  const first = exerciseData.length ? exerciseData[0].weight : null;
  const delta = last !== null && first !== null ? last - first : null;

  return (
    <div style={{ padding: "calc(26px + env(safe-area-inset-top)) 20px 26px" }}>
      <div className="disp" style={{ fontSize: 27, fontWeight: 600, marginBottom: 4 }}>Progresso</div>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 18 }}>{streak} treino{streak !== 1 ? "s" : ""} seguidos sem furar o ritmo</div>

      {(cardioMinutes.week > 0 || cardioMinutes.month > 0) && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <StatCard icon={<Activity size={17} color={C.primary} />} value={`${cardioMinutes.week} min`} label="cardio nos últimos 7 dias" />
          <StatCard icon={<Activity size={17} color={C.gold} />} value={`${cardioMinutes.month} min`} label="cardio nos últimos 30 dias" />
        </div>
      )}

      <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[["exercicio", "Exercício"], ["musculo", "Grupo muscular"], ["recordes", "Recordes"], ["consistencia", "Consistência"]].map(([k, label]) => (
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
              <div key={name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

      {view === "consistencia" && (
        sessions.length === 0 ? <EmptyState text="Seu calendário de treinos vai aparecer aqui conforme você registra sessões." /> : (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12.5, color: C.textDim, marginBottom: 14 }}>
              <strong style={{ color: C.text }}>{heatmapDaysTrained}</strong> dia{heatmapDaysTrained !== 1 ? "s" : ""} com treino nas últimas {HEATMAP_WEEKS} semanas
            </div>
            <div style={{ overflowX: "auto" }}>
              <div style={{ display: "flex", gap: 4, width: "max-content" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, marginRight: 2 }}>
                  {DOW_LABELS.map((l, i) => (
                    <div key={i} style={{ width: 12, height: 12, fontSize: 8.5, color: C.textFaint, display: "flex", alignItems: "center", justifyContent: "center" }}>{l}</div>
                  ))}
                </div>
                {heatmapWeeks.map((col, wi) => (
                  <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {col.map((day) => (
                      <div key={day.date} title={day.count > 0 ? `${fmtDate(day.date)} · treinou` : fmtDate(day.date)} style={{
                        width: 12, height: 12, borderRadius: 3,
                        background: day.isFuture ? "transparent" : day.count > 0 ? C.primary : C.surface2,
                        border: day.isFuture ? "none" : `1px solid ${C.border}`,
                      }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
