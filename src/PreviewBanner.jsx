import { useState } from "react";
import { X } from "lucide-react";
import { C } from "./lib/theme";

export default function PreviewBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: C.surface3, borderBottom: `1px solid ${C.gold}`, color: C.textDim,
      fontSize: 11.5, padding: "8px 40px 8px 14px", textAlign: "center", lineHeight: 1.4,
    }}>
      Prévia funcional — dados salvos aqui ficam só neste preview do claude.ai. O app
      de verdade (instalável, offline, notificação real) fica em{" "}
      <strong style={{ color: C.text }}>99drew.github.io/treino</strong>.
      <button onClick={() => setOpen(false)} aria-label="Fechar aviso" style={{
        position: "absolute", top: 6, right: 8, background: "none", border: "none",
        color: C.textFaint, cursor: "pointer", padding: 6,
      }}><X size={14} /></button>
    </div>
  );
}
