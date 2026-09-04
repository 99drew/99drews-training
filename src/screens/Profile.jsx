import { useState } from "react";
import { Pencil, Check, Info } from "lucide-react";
import { C, inputStyle } from "../lib/theme";
import { fmtDateFull } from "../lib/helpers";
import avatar from "../img/avatar.jpg";

export default function ProfileScreen({ profile, updateProfile, bodyWeight, measurements }) {
  const [editingHeight, setEditingHeight] = useState(false);
  const [heightDraft, setHeightDraft] = useState(profile.height || "");

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
        <img src={avatar} alt="Cindy Santos" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: `1px solid ${C.border}` }} />
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

      <div style={{
        display: "flex", gap: 10, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14,
      }}>
        <Info size={16} color={C.textDim} style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>
          <b style={{ color: C.text }}>Sobre o app Saúde (Apple):</b> como este app roda direto no navegador (PWA), ele não
          tem acesso ao HealthKit — isso é uma restrição da Apple, só apps nativos da App Store podem sincronizar com o
          Saúde. Por enquanto os dados ficam só aqui, salvos no aparelho, com preenchimento manual.
        </div>
      </div>
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
