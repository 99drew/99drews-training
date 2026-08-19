// Gera os ícones PNG do PWA a partir dos SVGs em scripts/ usando sharp.
// Rodar com: node scripts/generate-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");

const icon = readFileSync(path.join(__dirname, "icon-source.svg"));
const maskable = readFileSync(path.join(__dirname, "icon-maskable.svg"));

const targets = [
  { file: "icon-192.png", src: icon, size: 192 },
  { file: "icon-512.png", src: icon, size: 512 },
  { file: "icon-maskable-192.png", src: maskable, size: 192 },
  { file: "icon-maskable-512.png", src: maskable, size: 512 },
  { file: "apple-touch-icon.png", src: icon, size: 180 },
  { file: "badge-72.png", src: icon, size: 72 },
];

for (const t of targets) {
  await sharp(t.src).resize(t.size, t.size).png().toFile(path.join(outDir, t.file));
  console.log("gerado", t.file);
}
