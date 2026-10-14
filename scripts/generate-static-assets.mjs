/**
 * Membuat aset statis verktor/raster sekali pakai:
 *  - public/img/og-default.png  (1200x630) — gambar default untuk Open Graph
 *  - public/logo.png            (512x512)  — dipakai schema.org /logo
 *  - public/apple-touch-icon.png(180x180)
 * Semua dari satu SVG yang sama supaya identitas merek konsisten.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = resolve(root, 'public');

const G= 'M32 52C32 40 40 32 53 28C52.5 43 45 51.5 32 52Z';
const E= 'M32 52C32 40 24 32 11 28C11.5 43 19 51.5 32 52Z';

const base = (w, h, extra='') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9f3756"/>
      <stop offset="1" stop-color="#5d2233"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g transform="translate(${w/2-32} ${h/2-40})">
    <path d="${G}" fill="#fdf2f4" opacity="0.95"/>
    <path d="${E}" fill="#e9cba7" opacity="0.95"/>
    <circle cx="32" cy="30" r="4.5" fill="#e9cba7"/>
  </g>
  ${extra}
</svg>`;

// OG image bernuansa editorial
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fdf2f4"/>
      <stop offset="1" stop-color="#ead9cf"/>
    </linearGradient>
    <linearGradient id="sp" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#9f3756"/>
      <stop offset="1" stop-color="#5d2233"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1030" cy="90" r="260" fill="#ffffff" opacity="0.35"/>
  <circle cx="120" cy="600" r="220" fill="#9f3756" opacity="0.07"/>
  <g transform="translate(960 70)">
    <rect width="170" height="170" rx="48" fill="url(#sp)"/>
    <g transform="translate(53 43) scale(2)">
      <path d="${G}" fill="#fdf2f4"/>
      <path d="${E}" fill="#e9cba7"/>
      <circle cx="32" cy="30" r="4.5" fill="#e9cba7"/>
    </g>
  </g>
  <text x="90" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="88" fill="#3a1d24" font-weight="600">Mekar Boutique</text>
  <text x="94" y="352" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#8c5a4a" letter-spacing="1">Busana wanita yang mekar bersama gaya Anda.</text>
  <text x="94" y="420" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#6b4a3f" letter-spacing="2">DRESS • GAMIS • BLOUSE • OUTERWEAR</text>
  <rect x="94" y="470" width="360" height="4" rx="2" fill="#e9cba7"/>
</svg>`;

await mkdir(resolve(pub, 'img'), { recursive: true });

const jobs = [
  ['img/og-default.png', og, 1200, 630],
  ['logo.png', base(512, 512), 512, 512],
  ['apple-touch-icon.png', base(180, 180), 180, 180],
];

for (const [rel, svg, w, h] of jobs) {
  const file = resolve(pub, rel);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  await (await import('node:fs/promises')).writeFile(file, buf);
  console.log(`${rel}  ${w}x${h}  ${(buf.length / 1024).toFixed(0)} KB`);
}
console.log('Selesai.');