/**
 * Konfigurasi global situs. Satu sumber kebenaran untuk SEO, kontak, dan branding.
 */

export const SITE = {
  nama: 'Mekar',
  namaLengkap: 'Mekar Boutique',
  tagline: 'Busana wanita yang mekar bersama gaya Anda.',
  deskripsi:
    'Mekar Boutique adalah toko busana wanita lokal: dress, gamis, blouse, kemeja, dan outerwear dengan bahan premium serta jahitan rapi. Dikirim ke seluruh Indonesia.',
  bahasa: 'id-ID',
  lokasi: 'Bandung, Jawa Barat, Indonesia',
  alamat: 'Jl. Cikutra Baru Raya No. 12, Bandung, Jawa Barat 40124',
  telepon: '+62 811-2000-1234',
  whatsapp: '6281120001234',
  email: 'halo@mekarboutique.id',
  jamBuka: [
    { hari: 'Senin - Jumat', jam: '09.00 - 20.00 WIB' },
    { hari: 'Sabtu', jam: '09.00 - 17.00 WIB' },
    { hari: 'Minggu & Hari Libur', jam: 'Tutup' },
  ],
  mediaSosial: {
    instagram: 'https://instagram.com/mekarboutique',
    tiktok: 'https://tiktok.com/@mekarboutique',
    whatsapp: 'https://wa.me/6281120001234',
  },
  gratisOngkirMinimal: 300000,
} as const;

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
