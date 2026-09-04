// ============ TEMA — identidade visual consolidada com o portfólio ============
// Fundo navy + painéis translúcidos ("glass") + acento único rosa, extraídos
// do manual da marca (mesma paleta, mesmo raio de borda, mesma tipografia
// do sistema). "gold" continua existindo como chave só pra não obrigar a
// reescrever todo lugar que consome C.gold — mas aponta pro mesmo rosa, já
// que a marca usa um único acento.
export const C = {
  bg: "#060239",
  surface: "rgba(255, 255, 255, 0.06)",
  surface2: "rgba(255, 255, 255, 0.09)",
  surface3: "rgba(255, 255, 255, 0.13)",
  border: "rgba(255, 255, 255, 0.14)",
  primary: "#e64ba0",
  primaryDim: "rgba(230, 75, 160, 0.16)",
  gold: "#e64ba0",
  goldDim: "rgba(230, 75, 160, 0.16)",
  text: "#ffffff",
  textDim: "rgba(255, 255, 255, 0.7)",
  textFaint: "rgba(255, 255, 255, 0.5)",
  danger: "#E05252",
};

export const SYSTEM_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const FONTS = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body, #root { background: ${C.bg}; font-family: ${SYSTEM_FONT}; }
  body { margin: 0; }
  .disp { font-family: ${SYSTEM_FONT}; }
  input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { opacity: 0.6; }
  ::-webkit-scrollbar { display: none; }
`;

export function inputStyle(flex = 1) {
  return { flex, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 10px", color: C.text, fontSize: 14, width: "100%", minWidth: 0 };
}

export const tooltipStyle = { background: "#211a45", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 };
