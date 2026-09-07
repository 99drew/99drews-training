// Gera as splash screens do PWA pro iOS (imagem mostrada em tela cheia
// entre tocar no ícone e o app carregar) — sem isso, o iOS gera uma tela
// branca/da cor de fundo automática. Fundo navy + o mesmo dumbbell do
// ícone + nome do app, renderizados via sharp a partir de um SVG montado
// na hora pra cada tamanho de tela.
//
// Rodar com: node scripts/generate-splash.mjs
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "splash");
mkdirSync(outDir, { recursive: true });

const BG = "#060239";
const BG2 = "#0d0660";
const BAR = "#e64ba0";

// Retrato apenas — o app é usado só em pé. Cobre iPhone 6 até a geração
// 15 (pixels físicos reais, media query casa por device-width/height
// lógicos + device-pixel-ratio, como o Safari exige pra splash screens).
const TARGETS = [
  { w: 750, h: 1334, dpr: 2, dw: 375, dh: 667 },   // SE / 6-8
  { w: 1242, h: 2208, dpr: 3, dw: 414, dh: 736 },  // 6-8 Plus
  { w: 1125, h: 2436, dpr: 3, dw: 375, dh: 812 },  // X/XS/11 Pro/12 mini/13 mini
  { w: 828, h: 1792, dpr: 2, dw: 414, dh: 896 },   // XR/11
  { w: 1242, h: 2688, dpr: 3, dw: 414, dh: 896 },  // XS Max/11 Pro Max
  { w: 1170, h: 2532, dpr: 3, dw: 390, dh: 844 },  // 12/12 Pro/13/13 Pro/14
  { w: 1284, h: 2778, dpr: 3, dw: 428, dh: 926 },  // 12/13 Pro Max, 14 Plus
  { w: 1179, h: 2556, dpr: 3, dw: 393, dh: 852 },  // 14 Pro/15/15 Pro
  { w: 1290, h: 2796, dpr: 3, dw: 430, dh: 932 },  // 14 Pro Max/15 Plus/15 Pro Max
];

// Dumbbell do icon-source.svg, num viewBox 0-512, reaproveitado tal e
// qual (mesma proporção do ícone instalado).
function dumbbellSvg(size) {
  return `
    <g transform="translate(${-size / 2}, ${-size / 2}) scale(${size / 512})">
      <rect width="512" height="512" rx="112" fill="url(#bg)"/>
      <rect x="146" y="243" width="220" height="26" rx="13" fill="${BAR}"/>
      <rect x="96" y="196" width="46" height="120" rx="16" fill="#ffffff"/>
      <rect x="118" y="170" width="26" height="172" rx="13" fill="#e64ba0"/>
      <rect x="370" y="196" width="46" height="120" rx="16" fill="#ffffff"/>
      <rect x="368" y="170" width="26" height="172" rx="13" fill="#e64ba0"/>
    </g>`;
}

function splashSvg(w, h) {
  const iconSize = Math.round(Math.min(w, h) * 0.26);
  const cx = w / 2;
  const cy = h / 2 - iconSize * 0.22;
  const fontSize = Math.round(w * 0.052);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${BG2}"/>
          <stop offset="1" stop-color="${BG}"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="${BG}"/>
      <g transform="translate(${cx}, ${cy})">${dumbbellSvg(iconSize)}</g>
      <text x="${cx}" y="${cy + iconSize * 0.85}" text-anchor="middle"
        font-family="-apple-system, Helvetica, Arial, sans-serif" font-weight="700"
        font-size="${fontSize}" fill="#ffffff">99drew's Training</text>
    </svg>`;
}

for (const t of TARGETS) {
  const file = `splash-${t.w}x${t.h}.png`;
  await sharp(Buffer.from(splashSvg(t.w, t.h))).png().toFile(path.join(outDir, file));
  console.log("gerado", file);
}
