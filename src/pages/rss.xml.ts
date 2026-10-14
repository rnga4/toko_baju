import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { produkBaru, namaKategori, hargaTercoret } from '../data/produk';
import { rupiah } from '../lib/format';

export const GET: APIRoute = (ctx) => {
  const items = produkBaru.map((p) => {
    const coret = hargaTercoret(p);
    return {
      title: coret
        ? `${p.nama} — ${rupiah(p.harga)} (turun dari ${rupiah(coret)})`
        : `${p.nama} — ${rupiah(p.harga)}`,
      description: `${p.ringkas} Bahan: ${p.bahan}. Tersedia ukuran ${p.ukuran.join('/')}.`,
      link: `/produk/${p.slug}/`,
      pubDate: new Date(`${p.tanggalMasuk}T00:00:00+07:00`),
      categories: [namaKategori(p.kategori)],
    };
  });

  return rss({
    title: `${SITE.namaLengkap} — Produk terbaru`,
    description: SITE.deskripsi,
    site: ctx.site ?? 'http://localhost:8095',
    items,
    customData: '<language>id-ID</language>',
  });
};