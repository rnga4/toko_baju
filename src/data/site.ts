/**
 * Konfigurasi global situs. Satu sumber kebenaran untuk SEO, kontak, dan branding.
 *
 * Datanya diambil dari `site.json` supaya bisa diedit lewat panel admin lokal
 * (`npm run admin`) tanpa membongkar kode. Import/modul tetap lewat file ini.
 */
import data from './site.json';

export interface JamBuka {
  hari: string;
  jam: string;
}

export interface MediaSosial {
  instagram: string;
  tiktok: string;
  whatsapp: string;
}

export interface Situs {
  nama: string;
  namaLengkap: string;
  tagline: string;
  deskripsi: string;
  bahasa: string;
  lokasi: string;
  alamat: string;
  telepon: string;
  whatsapp: string;
  email: string;
  jamBuka: JamBuka[];
  mediaSosial: MediaSosial;
  gratisOngkirMinimal: number;
}

export const SITE: Situs = data;

export const NAVIGASI = [
  { label: 'Beranda', href: '/' },
  { label: 'Katalog', href: '/katalog' },
  { label: 'Tentang', href: '/tentang' },
  { label: 'Kontak', href: '/kontak' },
] as const;

export const UKURAN_PANJANGAN = ['S', 'M', 'L', 'XL', 'XXL'] as const;

/** Ambil URL absolut untuk canonical/OG — penting untuk SEO. */
export function urlAbsolut(path: string, site: URL | undefined): string {
  return new URL(path, site ?? 'http://localhost:8095').href;
}

export function linkWa(pesan?: string): string {
  const teks = encodeURIComponent(
    pesan ?? `Halo ${SITE.namaLengkap}, saya mau tanya-tanya produk yang tersedia.`,
  );
  return `https://wa.me/${SITE.whatsapp}?text=${teks}`;
}
