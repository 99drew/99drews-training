import { History, TrendingUp, Ruler, Settings, Home, User } from "lucide-react";
import { C } from "../lib/theme";

const ITEMS = [
  { key: "home", label: "Início", icon: Home },
  { key: "history", label: "Histórico", icon: History },
  { key: "progress", label: "Progresso", icon: TrendingUp },
  { key: "body", label: "Corpo", icon: Ruler },
  { key: "profile", label: "Perfil", icon: User },
  { key: "edit", label: "Editar", icon: Settings },
];

export default function BottomNav({ tab, setTab }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface3, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: `1px solid ${C.border}`,
      display: "flex", padding: "9px 2px calc(9px + env(safe-area-inset-bottom))", justifyContent: "space-around", zIndex: 40,
    }}>
      {ITEMS.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: active ? C.primary : C.textDim, cursor: "pointer", padding: "4px 2px", flex: 1, minWidth: 0,
          }}>
            <Icon size={19} />
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
