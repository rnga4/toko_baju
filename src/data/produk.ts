import type { ImageMetadata } from 'astro';

import data from './produk.json';

export type Badge = 'Baru' | 'Terlaris' | 'Promo' | null;

export interface Kategori {
  slug: string;
  nama: string;
  deskripsi: string;
  ikon: string;
}

/** Gambar per varian warna. Nama file: `{slug}-{nama-warna}.webp` (opsional). */
export interface VarianGambar {
  nama: string;
  gambar: ImageMetadata;
}

export interface Produk {
  slug: string;
  nama: string;
  kategori: string;
  harga: number;
  hargaCoret: number | null;
  badge: Badge;
  bahan: string;
  warna: string[];
  ukuran: string[];
  stok: number;
  terjual: number;
  rating: number;
  tanggalMasuk: string;
  ringkas: string;
  deskripsi: string;
  perawatan: string[];
  catatan: string[];
  gambar: ImageMetadata;
  gambarVarian: VarianGambar[];
}

export interface ProdukMentah extends Omit<Produk, 'gambar'> {
  /** Opsional; bila kosong, gambar diambil dari file `{slug}.webp`. */
  gambar?: string;
}

/**
 * Gambar produk diambil lewat import.meta.glob agar ikut dioptimasi oleh
 * pipeline astro:assets (WebP/AVIF + responsive srcset + lazy loading).
 */
const gambarModul = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/produk/*.{webp,avif,jpg,jpeg,png,svg}',
  { eager: true },
);

const gambarIndex = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(gambarModul)) {
  gambarIndex.set(path.split('/').pop() ?? path, mod.default);
}

const fallbackGambar = gambarIndex.values().next().value as ImageMetadata | undefined;

function ambilGambar(namaFile: string): ImageMetadata {
  const found = gambarIndex.get(namaFile);
  if (!found) {
    if (import.meta.env.DEV) {
      console.warn(`[produk] Gambar "${namaFile}" tidak ditemukan, memakai fallback.`);
    }
    if (fallbackGambar) return fallbackGambar;
    throw new Error(`Gambar produk "${namaFile}" tidak ditemukan di src/assets/produk/`);
  }
  return found;
}

/**
 * Kumpulkan foto tambahan sebuah produk. Semua berkas `{slug}-*.webp` di
 * folder aset dianggap sebagai foto galeri tambahan dan diurutkan alami.
 */
function ambilVarian(slug: string): VarianGambar[] {
  const awalan = `${slug}-`;
  return [...gambarIndex.keys()]
    .filter((nama) => nama.startsWith(awalan))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
    .map((nama, i) => ({ nama: `Foto ${i + 1}`, gambar: gambarIndex.get(nama)! }));
}

export const kategori: readonly Kategori[] = data.kategori;

const daftarMentah: readonly ProdukMentah[] = data.produk as readonly unknown[] as readonly ProdukMentah[];

export const semuaProduk: readonly Produk[] = daftarMentah
  .map((p) =>
    ({
      ...p,
      badge: (p.badge ?? null) as Badge,
      gambar: ambilGambar(p.gambar ?? `${p.slug}.webp`),
      gambarVarian: ambilVarian(p.slug),
    }) as Produk,
  )
  .sort((a, b) => b.tanggalMasuk.localeCompare(a.tanggalMasuk));

export const produkTerlaris: readonly Produk[] = [...semuaProduk]
  .sort((a, b) => b.terjual - a.terjual)
  .slice(0, 8);

export const produkBaru: readonly Produk[] = semuaProduk.slice(0, 6);

export const produkPromo: readonly Produk[] = semuaProduk
  .filter((p) => p.hargaCoret !== null)
  .sort((a, b) => {
    const diskonA = a.hargaCoret ? 1 - a.harga / a.hargaCoret : 0;
    const diskonB = b.hargaCoret ? 1 - b.harga / b.hargaCoret : 0;
    return diskonB - diskonA;
  });

export function produkBySlug(slug: string): Produk | undefined {
  return semuaProduk.find((p) => p.slug === slug);
}

export function produkByKategori(slug: string): readonly Produk[] {
  return semuaProduk.filter((p) => p.kategori === slug);
}

export function kategoriBySlug(slug: string): Kategori | undefined {
  return kategori.find((k) => k.slug === slug);
}

export function namaKategori(slug: string): string {
  return kategoriBySlug(slug)?.nama ?? slug;
}

/** Filter + pencarian katalog, dipakai di /katalog. */
export function cariProduk(opts: {
  kategori?: string;
  q?: string;
  badge?: string;
  hargaMaks?: number;
}): readonly Produk[] {
  const q = opts.q?.trim().toLowerCase() ?? '';
  return semuaProduk.filter((p) => {
    if (opts.kategori && opts.kategori !== 'semua' && p.kategori !== opts.kategori) return false;
    if (opts.badge && opts.badge !== 'semua' && p.badge !== opts.badge) return false;
    if (opts.hargaMaks && p.harga > opts.hargaMaks) return false;
    if (q) {
      const haystack = [p.nama, p.bahan, p.ringkas, p.kategori, ...p.warna].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function hargaTercoret(p: Produk): number | null {
  if (!p.hargaCoret || p.hargaCoret <= p.harga) return null;
  return p.hargaCoret;
}

export function persenDiskon(p: Produk): number {
  const coret = hargaTercoret(p);
  if (!coret) return 0;
  return Math.round((1 - p.harga / coret) * 100);
}
