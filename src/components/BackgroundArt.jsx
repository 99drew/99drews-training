// Fundo decorativo consolidado com o portfólio: mesmos blobs em gradiente
// rosa→roxo→azul + feixes de linhas onduladas, gerados em SVG (sem imagem
// rasterizada). Portado de src/components/backgroundArt.js — mesma lógica,
// adaptado pra ficar fixo atrás do conteúdo (o app é um SPA com nav fixa,
// não uma página única rolando), então usa position:fixed em vez de
// absolute pra continuar atrás mesmo quando uma tela rola por dentro.

function mulberry32(seed) {
  let s = seed;
  return function random() {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blobPath(seed, size = 200, points = 9, irregularity = 0.32) {
  const rand = mulberry32(seed);
  const angleStep = (Math.PI * 2) / points;
  const pts = Array.from({ length: points }, (_, i) => {
    const r = size * (1 - irregularity / 2 + rand() * irregularity);
    const angle = i * angleStep;
    return [size + r * Math.cos(angle), size + r * Math.sin(angle)];
  });
  const n = pts.length;
  const d = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const cp2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    if (i === 0) d.push(`M${p1[0].toFixed(1)},${p1[1].toFixed(1)}`);
    d.push(`C${cp1[0].toFixed(1)},${cp1[1].toFixed(1)} ${cp2[0].toFixed(1)},${cp2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`);
  }
  d.push('Z');
  return d.join(' ');
}

function wavyLines(seed, count = 13, width = 480, height = 230) {
  const rand = mulberry32(seed);
  const lines = [];
  for (let i = 0; i < count; i++) {
    const y0 = (i / (count - 1)) * height;
    const amp = 16 + rand() * 12;
    const phase = rand() * Math.PI * 2;
    const segments = 6;
    let d = `M0,${(y0 + amp * Math.sin(phase)).toFixed(1)}`;
    for (let s = 1; s <= segments; s++) {
      const x = (s / segments) * width;
      const prevX = ((s - 1) / segments) * width;
      const midX = (prevX + x) / 2;
      const y = y0 + amp * Math.sin(phase + s * 1.3);
      const cpY = y0 + amp * Math.sin(phase + (s - 0.5) * 1.3);
      d += ` Q${midX.toFixed(1)},${cpY.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
    }
    lines.push(d);
  }
  return lines;
}

const GRADIENTS = {
  a: ['#FF5595', '#9A20C4', '#3C00FA'],
  b: ['#3C00FA', '#9A20C4', '#FF5595'],
  c: ['#9A20C4', '#3C00FA', '#FF5595'],
};

// Menos clusters e mais discretos que no portfólio — aqui é um pano de
// fundo fixo atrás de painéis de UI o tempo todo, não uma hero que aparece
// uma vez ao rolar a página.
const CLUSTERS = [
  { seed: 1, size: 480, left: -18, top: -12, rot: -8, blur: 60, opacity: 0.4, grad: 'a', waves: true, waveSeed: 101 },
  { seed: 3, size: 420, left: 62, top: 40, rot: 10, flip: true, blur: 65, opacity: 0.3, grad: 'c' },
  { seed: 5, size: 440, left: -18, top: 82, rot: -6, blur: 60, opacity: 0.4, grad: 'b', waves: true, waveSeed: 404 },
];

function BlobCluster({ cfg }) {
  const { seed, size, left, top, rot, flip, waves, waveSeed, blur, opacity, grad } = cfg;
  const path = blobPath(seed, 200, 9, 0.32);
  const gradId = `treinoBlobGrad${seed}`;
  const colors = GRADIENTS[grad];
  const lines = waves ? wavyLines(waveSeed, 13, 480, 230) : null;
  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        opacity,
        filter: `blur(${blur}px)`,
        transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`,
      }}
    >
      <svg viewBox="0 0 400 400" width="100%" height="100%">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="45%" stopColor={colors[1]} />
            <stop offset="100%" stopColor={colors[2]} />
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#${gradId})`} />
      </svg>
      {waves && (
        <svg style={{ position: "absolute", top: "8%", left: "8%", width: "130%", height: "62%", overflow: "visible" }} viewBox="0 0 480 230" preserveAspectRatio="xMidYMid meet">
          {lines.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
          ))}
        </svg>
      )}
    </div>
  );
}

export default function BackgroundArt() {
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      {CLUSTERS.map((cfg) => <BlobCluster key={cfg.seed} cfg={cfg} />)}
    </div>
  );
}
