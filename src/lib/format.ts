/** Format angka ke Rupiah tanpa locale server (deterministik saat SSG). */
const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function rupiah(nilai: number): string {
  return formatter.format(nilai);
}

/** Versi ringkas untuk meta description, contoh: "Rp289 rb". */
export function rupiahRingkas(nilai: number): string {
  if (nilai >= 1_000_000) {
    const juta = nilai / 1_000_000;
    return `Rp${juta % 1 === 0 ? juta : juta.toFixed(1).replace('.', ',')} juta`;
  }
  return `Rp${Math.round(nilai / 1000)} rb`;
}

export function angka(nilai: number): string {
  return new Intl.NumberFormat('id-ID').format(nilai);
}

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const;

/** "2026-08-14" -> "14 Agustus 2026" (timezone-safe, tanpa Date lokal). */
export function tanggalPanjang(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1] ?? ''} ${y}`;
}

export function tanggalPendek(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  if (!m || !d) return iso;
  return `${d} ${BULAN[m - 1]?.slice(0, 3) ?? ''} ${new Date(iso).getFullYear()}`;
}
