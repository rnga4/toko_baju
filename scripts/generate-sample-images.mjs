/**
 * Generator gambar produk contoh.
 * Membaca src/data/produk.json lalu membuat placeholder WebP:
 *  - gambar utama  : {slug}.webp          (palet = warna pertama)
 *  - gambar varian : {slug}-{warna}.webp  (per entri `warna`)
 *
 * Untuk produksi: ganti file di src/assets/produk/ dengan foto asli
 * (nama sama), atau hapus file varian bila varian tidak didokumentasikan,
 * lalu jalankan `npm run gen:gambar` lagi bila ada produk baru.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'src/assets/produk');
const data = JSON.parse(await readFile(resolve(root, 'src/data/produk.json'), 'utf8'));

const W = 1000;
const H = 1250;

/** Siluet sederhana per kategori, digambar dalam viewBox 0 0 200 260 */
const SILHOUETTE = {
  dress: 'M78 22 L122 22 L136 44 L150 58 L138 74 L128 66 L128 110 C128 150 150 186 158 214 C160 224 154 230 145 230 L55 230 C46 230 40 224 42 214 C50 186 72 150 72 110 L72 66 L62 74 L50 58 L64 44 Z',
  gamis: 'M80 20 L120 20 L134 42 L150 56 L138 72 L128 64 L128 96 C128 140 152 190 162 226 C165 238 158 244 148 244 L52 244 C42 244 35 238 38 226 C48 190 72 140 72 96 L72 64 L62 72 L50 56 L66 42 Z',
  blouse: 'M74 34 L100 22 L126 34 L152 46 L142 76 L126 68 L126 116 L74 116 L74 68 L58 76 L48 46 Z',
  kemeja: 'M74 34 L100 22 L126 34 L152 46 L142 76 L126 68 L126 122 L74 122 L74 68 L58 76 L48 46 Z',
  outer: 'M66 30 L100 20 L134 30 L156 46 L150 128 L138 128 L132 62 L132 132 L68 132 L68 62 L62 128 L50 128 L44 46 Z',
  kulot: 'M70 30 L130 30 L130 56 L124 236 L96 236 L100 130 L104 236 L76 236 L70 56 Z',
  set: 'M40 44 L64 34 L74 46 L64 56 L64 104 L40 104 L40 56 L30 60 L22 46 Z M120 44 L144 34 L154 46 L144 56 L144 104 L120 104 L120 56 L110 60 L102 46 Z',
  skirt: 'M70 36 L130 36 L158 128 C160 138 152 144 142 144 L58 144 C48 144 40 138 42 128 Z',
};

const PALETTES = {
  blush: { a: '#f6d9d4', b: '#e2a9a0', fg: '#8c4a52' },
  sage: { a: '#dfe8dc', b: '#a9c0a4', fg: '#4a6146' },
  sand: { a: '#f2e6d6', b: '#d9c09a', fg: '#7a5f3a' },
  dusk: { a: '#dcd9ea', b: '#a9a3cc', fg: '#4b4470' },
  rose: { a: '#f7dde4', b: '#e2a3b5', fg: '#8a3f56' },
  oat: { a: '#f1ece4', b: '#d3c6b4', fg: '#5d5245' },
  sea: { a: '#d7e6e9', b: '#9dc0c7', fg: '#3d5a60' },
  berry: { a: '#edd6e0', b: '#c08aa4', fg: '#6b3450' },
};

/** Tebak palet dari nama warna (untuk placeholder; edit bebas). */
const KATA_KUNCI = [
  [/seafoam|sage|matcha|emerald|mint|hijau/i, 'sage'],
  [/dusty\s?rose|mawar|rose|pink/i, 'rose'],
  [/berry|mulberry/i, 'berry'],
  [/dusk|purple|ungu|lilac|mauve|navy|midnight|charcoal|hitam|black|abu|grey/i, 'dusk'],
  [/champagne|ivory|putih|white|camel|ecru|terracotta|mocca|sand|krem|beige/i, 'sand'],
  [/oat|tan/i, 'oat'],
  [/slate|blue|biru|sea|dusty\s?blue|denim/i, 'sea'],
];

function paletDariNama(nama) {
  for (const [re, palet] of KATA_KUNCI) {
    if (re.test(nama.toLowerCase())) return palet;
  }
  const hash = [...nama.toLowerCase()].reduce((a, c) => a + c.charCodeAt(0), 0);
  const kunci = Object.keys(PALETTES);
  return kunci[hash % kunci.length];
}

function slugifyNama(nama) {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** @param {{pal: keyof typeof PALETTES, label: string, kategori: string}} o */
function svg({ pal, label, kategori }) {
  const palet = PALETTES[pal] ?? PALETTES.blush;
  const path = SILHOUETTE[kategori] ?? SILHOUETTE.dress;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${palet.a}"/>
      <stop offset="1" stop-color="${palet.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.34" r="0.55">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.65"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <circle cx="500" cy="470" r="250" fill="#ffffff" opacity="0.22"/>
  <g transform="translate(400 470) scale(1.28) translate(-100 -130)">
    <path d="${path}" fill="${palet.fg}" opacity="0.82"/>
  </g>
  <text x="60" y="${H - 58}" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="${palet.fg}" opacity="0.55">${label}</text>
</svg>`;
}

function render(label, pal, kategori) {
  return sharp(Buffer.from(svg({ pal, label, kategori }))).webp({ quality: 82, effort: 5 }).toBuffer();
}

await mkdir(outDir, { recursive: true });

let total = 0;
for (const produk of data.produk) {
  const warnaUtama = paletDariNama(produk.warna[0] ?? '');

  const utama = await render(produk.slug, warnaUtama, produk.kategori);
  await writeFile(resolve(outDir, `${produk.slug}.webp`), utama);
  console.log(`${produk.slug}.webp  ${(utama.length / 1024).toFixed(0)} KB`);
  total += 1;

  for (const nama of produk.warna) {
    const file = `${produk.slug}-${slugifyNama(nama)}.webp`;
    const buf = await render(`${produk.slug} · ${nama}`, paletDariNama(nama), produk.kategori);
    await writeFile(resolve(outDir, file), buf);
    console.log(`  └ ${file}  ${(buf.length / 1024).toFixed(0)} KB`);
    total += 1;
  }
}

console.log(`\n${total} gambar dibuat di src/assets/produk/`);