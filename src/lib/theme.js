// ============================== TEMA ==============================
export const C = {
  bg: "#0B0A0F",
  surface: "#161320",
  surface2: "#211C2E",
  surface3: "#2B2438",
  border: "#332C42",
  primary: "#D62E6E",
  primaryDim: "#5C1A38",
  gold: "#C9A45C",
  goldDim: "#5C4B2C",
  text: "#F4EFF7",
  textDim: "#B6A9C4",
  textFaint: "#7C6E8C",
  danger: "#E05252",
};

export const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body, #root { background: ${C.bg}; }
  body { margin: 0; }
  input, select, textarea { font-family: 'Inter', sans-serif; }
  .disp { font-family: 'Fraunces', serif; }
  input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { opacity: 0.6; }
  ::-webkit-scrollbar { display: none; }
`;

export function inputStyle(flex = 1) {
  return { flex, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 10px", color: C.text, fontSize: 14, width: "100%", minWidth: 0 };
}

export const tooltipStyle = { background: C.surface3, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 };
