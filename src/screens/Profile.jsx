import { useState, useEffect, useRef } from "react";
import { Pencil, Check, Camera, User } from "lucide-react";
import { C, inputStyle } from "../lib/theme";
import { fmtDateFull, resizeImage } from "../lib/helpers";
import { photoSet, photoGetURL } from "../lib/db";

const AVATAR_ID = "profile-avatar";

function useAvatarURL() {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let url = null;
    let cancelled = false;
    photoGetURL(AVATAR_ID).then((u) => {
      if (cancelled) { if (u) URL.revokeObjectURL(u); return; }
      url = u;
      setSrc(u);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);
  return [src, setSrc];
}

export default function ProfileScreen({ profile, updateProfile, bodyWeight, measurements }) {
  const [editingHeight, setEditingHeight] = useState(false);
  const [heightDraft, setHeightDraft] = useState(profile.height || "");
  const [avatarSrc, setAvatarSrc] = useAvatarURL();
  const fileRef = useRef(null);

  async function handleAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = await resizeImage(file, 400, 0.8);
    const ok = await photoSet(AVATAR_ID, blob);
    e.target.value = "";
    if (!ok) return;
    setAvatarSrc((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
  }

  const sorted = [...measurements].sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = sorted[0];

  function saveHeight() {
    const v = parseFloat(String(heightDraft).replace(",", "."));
    updateProfile({ height: v || null });
    setEditingHeight(false);
  }

  const heightM = profile.height ? profile.height / 100 : null;
  const bmi = heightM && bodyWeight ? (bodyWeight / (heightM * heightM)).toFixed(1) : null;

  return (
    <div style={{ padding: "calc(26px + env(safe-area-inset-top)) 20px 26px" }}>
      <div className="disp" style={{ fontSize: 27, fontWeight: 600, marginBottom: 4 }}>Perfil</div>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 18 }}>Seus dados, num só lugar</div>

      <div style={{
        display: "flex", alignItems: "center", gap: 14, background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: "none" }} />
        <button onClick={() => fileRef.current?.click()} style={{
          position: "relative", width: 64, height: 64, borderRadius: "50%", flexShrink: 0, padding: 0,
          border: `1px solid ${C.border}`, background: C.surface2, cursor: "pointer", overflow: "hidden",
        }}>
          {avatarSrc
            ? <img src={avatarSrc} alt="Cindy Santos" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <User size={28} color={C.textFaint} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />}
          <div style={{
            position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%",
            background: C.primary, border: `2px solid ${C.bg}`, display: "flex", alignItems: "center", justifyContent: "center",
          }}><Camera size={11} color="#fff" /></div>
        </button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Cindy Santos</div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>Massa & Definição</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatBlock label="Peso atual" value={bodyWeight ? `${bodyWeight}kg` : "—"} hint={latest?.weight ? `registrado em ${fmtDateFull(latest.date)}` : "peso padrão"} />
        <StatBlock
          label="Altura"
          value={profile.height ? `${profile.height}cm` : "—"}
          hint={bmi ? `IMC ${bmi}` : "toque no lápis pra registrar"}
          onEdit={() => { setHeightDraft(profile.height || ""); setEditingHeight(true); }}
        />
      </div>

      {editingHeight && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.textDim, marginBottom: 5, fontWeight: 600 }}>Altura (cm)</div>
            <input type="number" inputMode="decimal" autoFocus value={heightDraft} onChange={(e) => setHeightDraft(e.target.value)} style={inputStyle(1)} placeholder="ex: 160" />
          </div>
          <button onClick={saveHeight} style={{ background: C.primary, border: "none", color: "#fff", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Check size={18} />
          </button>
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4 }}>Últimas medidas</div>
      {latest ? (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 15px", marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 6 }}>{fmtDateFull(latest.date)}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              latest.weight && `Peso ${latest.weight}kg`,
              latest.waist && `Cintura ${latest.waist}cm`,
              latest.hip && `Quadril ${latest.hip}cm`,
              latest.arm && `Braço ${latest.arm}cm`,
              latest.thigh && `Coxa ${latest.thigh}cm`,
            ].filter(Boolean).map((t) => (
              <span key={t} style={{ fontSize: 11.5, background: C.surface2, borderRadius: 999, padding: "4px 10px", color: C.textDim }}>{t}</span>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ border: `1px dashed ${C.border}`, borderRadius: 12, padding: "20px 16px", textAlign: "center", color: C.textDim, fontSize: 13, marginBottom: 16 }}>
          Nenhuma medida registrada ainda. Adicione em Corpo → Medidas.
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value, hint, onEdit }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 10.5, color: C.textDim }}>{label}</div>
        {onEdit && (
          <button onClick={onEdit} style={{ background: "none", border: "none", color: C.textFaint, cursor: "pointer", padding: 0 }}>
            <Pencil size={12} />
          </button>
        )}
      </div>
      <div className="disp" style={{ fontSize: 20, fontWeight: 600, marginTop: 3 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: C.textFaint, marginTop: 2 }}>{hint}</div>
    </div>
  );
}
