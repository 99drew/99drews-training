import { useState, useEffect, useRef } from "react";
import { Trash2, Camera, Image as ImageIcon, X } from "lucide-react";
import { C } from "../lib/theme";
import { todayISO, fmtDate, fmtDateFull, resizeImage } from "../lib/helpers";
import { photoGetURL } from "../lib/db";
import { POSES } from "../lib/plan";
import { EmptyState, ChartCard, LabeledInput, tooltipStyle } from "../components/Shared";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function BodyScreen({ measurements, addMeasurement, deleteMeasurement, photoIndex, addPhoto, deletePhoto }) {
  const [section, setSection] = useState("medidas");
  return (
    <div style={{ padding: "calc(26px + env(safe-area-inset-top)) 20px 26px" }}>
      <div className="disp" style={{ fontSize: 27, fontWeight: 600, marginBottom: 4 }}>Corpo</div>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 18 }}>Medidas e fotos de progresso</div>

      <div style={{ display: "flex", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, marginBottom: 20 }}>
        {[["medidas", "Medidas"], ["fotos", "Fotos"]].map(([k, label]) => (
          <button key={k} onClick={() => setSection(k)} style={{
            flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
            background: section === k ? C.primary : "transparent", color: section === k ? "#fff" : C.textDim, fontSize: 12.5, fontWeight: 600,
          }}>{label}</button>
        ))}
      </div>

      {section === "medidas" ? (
        <MeasurementsPanel measurements={measurements} addMeasurement={addMeasurement} deleteMeasurement={deleteMeasurement} />
      ) : (
        <PhotosPanel photoIndex={photoIndex} addPhoto={addPhoto} deletePhoto={deletePhoto} />
      )}
    </div>
  );
}

function MeasurementsPanel({ measurements, addMeasurement, deleteMeasurement }) {
  const [form, setForm] = useState({ weight: "", waist: "", hip: "", arm: "", thigh: "" });
  const sorted = [...measurements].sort((a, b) => (a.date < b.date ? 1 : -1));
  const weightData = [...measurements].filter((m) => m.weight).map((m) => ({ date: fmtDate(m.date), raw: m.date, weight: parseFloat(m.weight) })).sort((a, b) => (a.raw < b.raw ? -1 : 1));

  function submit() {
    if (!form.weight && !form.waist && !form.hip && !form.arm && !form.thigh) return;
    addMeasurement({ date: todayISO(), ...form });
    setForm({ weight: "", waist: "", hip: "", arm: "", thigh: "" });
  }

  return (
    <div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Registrar hoje ({fmtDate(todayISO())})</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <LabeledInput label="Peso (kg)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} />
          <LabeledInput label="Cintura (cm)" value={form.waist} onChange={(v) => setForm({ ...form, waist: v })} />
          <LabeledInput label="Quadril (cm)" value={form.hip} onChange={(v) => setForm({ ...form, hip: v })} />
          <LabeledInput label="Braço (cm)" value={form.arm} onChange={(v) => setForm({ ...form, arm: v })} />
          <LabeledInput label="Coxa (cm)" value={form.thigh} onChange={(v) => setForm({ ...form, thigh: v })} />
        </div>
        <button onClick={submit} style={{ width: "100%", background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "11px 0", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Salvar medida</button>
      </div>

      {weightData.length > 1 && (
        <ChartCard height={180}>
          <LineChart data={weightData} margin={{ top: 5, right: 16, left: -18, bottom: 0 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" stroke={C.textDim} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke={C.textDim} fontSize={10} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: C.text }} />
            <Line type="monotone" dataKey="weight" stroke={C.primary} strokeWidth={2.5} dot={{ r: 3, fill: C.primary }} />
          </LineChart>
        </ChartCard>
      )}

      <div style={{ marginTop: 18 }}>
        {sorted.length === 0 && <EmptyState text="Nenhuma medida registrada ainda." />}
        {sorted.map((m) => (
          <div key={m.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 3 }}>{fmtDateFull(m.date)}</div>
              <div style={{ fontSize: 11.5, color: C.textDim }}>
                {[m.weight && `${m.weight}kg`, m.waist && `cintura ${m.waist}cm`, m.hip && `quadril ${m.hip}cm`, m.arm && `braço ${m.arm}cm`, m.thigh && `coxa ${m.thigh}cm`].filter(Boolean).join(" · ")}
              </div>
            </div>
            <button onClick={() => deleteMeasurement(m.id)} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", padding: 6 }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotosPanel({ photoIndex, addPhoto, deletePhoto }) {
  const [pose, setPose] = useState("Frente");
  const [filter, setFilter] = useState("Todas");
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = await resizeImage(file);
    await addPhoto({ date: todayISO(), pose }, blob);
    e.target.value = "";
  }

  const filtered = photoIndex.filter((p) => filter === "Todas" || p.pose === filter).sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Adicionar foto de hoje</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {POSES.map((p) => (
            <button key={p} onClick={() => setPose(p)} style={{
              flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 12, cursor: "pointer",
              border: `1px solid ${pose === p ? C.gold : C.border}`, background: pose === p ? C.goldDim : C.surface2, color: C.text,
            }}>{p}</button>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} style={{
          width: "100%", background: C.primary, color: "#fff", border: "none", borderRadius: 10, padding: "12px 0",
          fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}><Camera size={16} /> Tirar ou escolher foto</button>
        <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 8, textAlign: "center" }}>Fotos ficam salvas só no seu aparelho, ninguém mais vê.</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["Todas", ...POSES].map((p) => (
          <button key={p} onClick={() => setFilter(p)} style={{
            padding: "6px 12px", borderRadius: 20, fontSize: 11.5, cursor: "pointer",
            border: `1px solid ${filter === p ? C.gold : C.border}`, background: filter === p ? C.goldDim : "transparent", color: C.text,
          }}>{p}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState text="Nenhuma foto ainda. Registre a primeira pra acompanhar sua evolução." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {filtered.map((p) => (
            <PhotoThumb key={p.id} entry={p} onOpen={() => setPreview(p)} />
          ))}
        </div>
      )}

      {preview && <PhotoModal entry={preview} onClose={() => setPreview(null)} onDelete={() => { deletePhoto(preview.id); setPreview(null); }} />}
    </div>
  );
}

function usePhotoURL(id) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let url = null;
    let cancelled = false;
    photoGetURL(id).then((u) => {
      if (cancelled) { if (u) URL.revokeObjectURL(u); return; }
      url = u;
      setSrc(u);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);
  return src;
}

function PhotoThumb({ entry, onOpen }) {
  const src = usePhotoURL(entry.id);
  return (
    <button onClick={onOpen} style={{ position: "relative", aspectRatio: "3/4", borderRadius: 10, overflow: "hidden", border: `1px solid ${C.border}`, background: C.surface2, padding: 0, cursor: "pointer" }}>
      {src ? <img src={src} alt={entry.pose} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={20} color={C.textFaint} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", fontSize: 9.5, padding: "3px 5px", color: "#fff" }}>{fmtDate(entry.date)}</div>
    </button>
  );
}

function PhotoModal({ entry, onClose, onDelete }) {
  const src = usePhotoURL(entry.id);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", flexDirection: "column", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ color: "#fff", fontSize: 13 }}>{entry.pose} · {fmtDateFull(entry.date)}</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={22} /></button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {src && <img src={src} alt={entry.pose} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} />}
      </div>
      <button onClick={onDelete} style={{ marginTop: 14, background: "none", border: `1px solid ${C.danger}`, color: C.danger, borderRadius: 10, padding: "10px 0", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Trash2 size={14} /> Excluir foto
      </button>
    </div>
  );
}
