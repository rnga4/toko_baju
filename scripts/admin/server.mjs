/**
 * Panel admin lokal untuk Mekar Boutique.
 *
 * Menjalankan server kecil HANYA di 127.0.0.1 (tidak terekspos ke jaringan)
 * yang menyajikan form untuk mengedit `src/data/site.json` & `produk.json`,
 * mengunggah foto produk (otomatis dipotong 4:5 + dikonversi WebP), dan
 * membangun ulang situs.
 *
 * Jalankan:  npm run admin
 *
 * Tanpa dependency tambahan (hanya modul Node bawaan + sharp yang sudah ada).
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dataDir = join(root, 'src', 'data');
const siteFile = join(dataDir, 'site.json');
const produkFile = join(dataDir, 'produk.json');
const asetDir = join(root, 'src', 'assets', 'produk');
const uiFile = join(root, 'scripts', 'admin', 'ui.html');

const HOST = process.env.ADMIN_HOST ?? '127.0.0.1';
const PORT = Number(process.env.ADMIN_PORT ?? 4322);
const MAX_BODY = 25 * 1024 * 1024; // 25 MB

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const FILE_RE = /^[a-z0-9][a-z0-9-]*(-\d+)?\.webp$/;

const bacaJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const tulisJson = (file, obj) => writeFile(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');

/** Kumpulkan seluruh body request (terbatas MAX_BODY). */
function bacaBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Body terlalu besar (maks 25 MB).'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const kirim = (res, kode, isi, tipe = 'application/json') => {
  const body = tipe === 'application/json' ? JSON.stringify(isi) : isi;
  res.writeHead(kode, { 'content-type': tipe, 'cache-control': 'no-store' });
  res.end(body);
};

/** Daftar berkas gambar sebuah produk: utama + galeri, terurut. */
async function daftarGambar(slug) {
  const semua = await readdir(asetDir);
  const utama = `${slug}.webp`;
  const galeri = semua
    .filter((f) => f.startsWith(`${slug}-`) && FILE_RE.test(f))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  return { utama: semua.includes(utama) ? utama : null, galeri };
}

/** Nama galeri berikutnya: {slug}-NN.webp. */
async function namaGaleriBaru(slug) {
  const { galeri } = await daftarGambar(slug);
  let maks = 0;
  for (const f of galeri) {
    const m = f.match(/-(\d+)\.webp$/);
    if (m) maks = Math.max(maks, Number(m[1]));
  }
  return `${slug}-${String(maks + 1).padStart(2, '0')}.webp`;
}

/** Proses gambar unggahan: auto-orientasi, potong 4:5, konversi WebP. */
async function prosesGambar(buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1100, height: 1375, fit: 'cover', position: 'attention', withoutEnlargement: false })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
}

/** Jalankan perintah dan kembalikan gabungan stdout+stderr. */
function jalankan(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd: root, ...opts });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('error', (e) => resolve({ kode: -1, out: String(e.message) }));
    p.on('close', (kode) => resolve({ kode, out }));
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${HOST}:${PORT}`);
  const { pathname } = url;

  try {
    // --- UI ---
    if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
      return kirim(res, 200, await readFile(uiFile, 'utf8'), 'text/html; charset=utf-8');
    }

    // --- API data ---
    if (req.method === 'GET' && pathname === '/api/data') {
      const [site, produk] = await Promise.all([bacaJson(siteFile), bacaJson(produkFile)]);
      return kirim(res, 200, { site, produk });
    }

    if (req.method === 'POST' && pathname === '/api/site') {
      const body = JSON.parse((await bacaBody(req)).toString('utf8'));
      if (!body || typeof body !== 'object') return kirim(res, 400, { error: 'Data tidak valid.' });
      if (!body.namaLengkap || !body.whatsapp) {
        return kirim(res, 400, { error: 'Nama brand dan nomor WhatsApp wajib diisi.' });
      }
      await tulisJson(siteFile, body);
      return kirim(res, 200, { ok: true });
    }

    if (req.method === 'POST' && pathname === '/api/produk') {
      const isi = JSON.parse((await bacaBody(req)).toString('utf8'));
      if (!isi || !Array.isArray(isi.produk) || !Array.isArray(isi.kategori)) {
        return kirim(res, 400, { error: 'Struktur produk tidak valid.' });
      }
      const slugs = new Set();
      for (const p of isi.produk) {
        if (!p.slug || !SLUG_RE.test(p.slug)) return kirim(res, 400, { error: `Slug tidak valid: ${p.slug}` });
        if (slugs.has(p.slug)) return kirim(res, 400, { error: `Slug ganda: ${p.slug}` });
        slugs.add(p.slug);
        if (!p.nama) return kirim(res, 400, { error: `Produk "${p.slug}" belum punya nama.` });
      }
      await tulisJson(produkFile, isi);
      return kirim(res, 200, { ok: true });
    }

    // --- Gambar produk ---
    if (req.method === 'GET' && pathname === '/api/gambar') {
      const slug = url.searchParams.get('slug') ?? '';
      if (!SLUG_RE.test(slug)) return kirim(res, 400, { error: 'Slug tidak valid.' });
      return kirim(res, 200, await daftarGambar(slug));
    }

    if (req.method === 'GET' && pathname === '/api/asset') {
      const file = url.searchParams.get('file') ?? '';
      if (!FILE_RE.test(file) || file.includes('/')) return kirim(res, 400, { error: 'Nama berkas tidak valid.' });
      const path = join(asetDir, file);
      if (!existsSync(path)) return kirim(res, 404, { error: 'Berkas tidak ditemukan.' });
      const buf = await readFile(path);
      res.writeHead(200, { 'content-type': 'image/webp', 'cache-control': 'no-store' });
      return res.end(buf);
    }

    if (req.method === 'POST' && pathname === '/api/upload') {
      const slug = url.searchParams.get('slug') ?? '';
      const kind = url.searchParams.get('kind') ?? 'galeri';
      if (!SLUG_RE.test(slug)) return kirim(res, 400, { error: 'Slug tidak valid.' });
      if (kind !== 'main' && kind !== 'galeri') return kirim(res, 400, { error: 'Jenis gambar tidak valid.' });

      const buffer = await bacaBody(req);
      if (!buffer.length) return kirim(res, 400, { error: 'Berkas kosong.' });

      let hasil;
      try {
        hasil = await prosesGambar(buffer);
      } catch {
        return kirim(res, 400, { error: 'Gambar tidak bisa dibaca. Pakai JPG/PNG/WebP.' });
      }

      await mkdir(asetDir, { recursive: true });
      const nama = kind === 'main' ? `${slug}.webp` : await namaGaleriBaru(slug);
      await writeFile(join(asetDir, nama), hasil);
      return kirim(res, 200, { ok: true, file: nama });
    }

    if (req.method === 'POST' && pathname === '/api/hapus') {
      const file = url.searchParams.get('file') ?? '';
      if (!FILE_RE.test(file) || file.includes('/')) return kirim(res, 400, { error: 'Nama berkas tidak valid.' });
      const path = join(asetDir, file);
      if (existsSync(path)) await unlink(path);
      return kirim(res, 200, { ok: true });
    }

    // --- Bangun ulang situs ---
    if (req.method === 'POST' && pathname === '/api/rebuild') {
      const hasil = await jalankan('docker', ['compose', 'up', '-d', '--build', 'web']);
      return kirim(res, hasil.kode === 0 ? 200 : 500, { ok: hasil.kode === 0, output: hasil.out.trim() });
    }

    if (req.method === 'GET' && pathname === '/favicon.ico') {
      res.writeHead(204);
      return res.end();
    }

    return kirim(res, 404, { error: 'Tidak ditemukan.' });
  } catch (err) {
    return kirim(res, 500, { error: err instanceof Error ? err.message : 'Kesalahan server.' });
  }
});

server.listen(PORT, HOST, () => {
  const alamat = `http://${HOST}:${PORT}`;
  console.log(`\n  Panel admin Mekar Boutique\n  ${alamat}\n`);
  console.log('  Tekan Ctrl+C untuk berhenti.\n');

  // Buka browser bila mungkin (opsional, abaikan bila gagal).
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(opener, [alamat], { stdio: 'ignore', detached: true, shell: process.platform === 'win32' })
    .on('error', () => {})
    .unref();
});
