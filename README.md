# Mekar Boutique — Landing Page Toko Busana Wanita

Landing page statis untuk toko baju wanita. Dibangun dengan **Astro 7 + Tailwind CSS 4**, konten dikelola lewat file data (JSON/TS), dan di-deploy dengan **Docker Compose**: nginx statis + reverse proxy publik.

Prinsip: cepat (static-first, tanpa JS runtime di sisi server), ringan (semua hasil render di-build waktu deploy), dan gampang dirawat (konten cukup edit file data lalu rebuild).

---

## Stack & Arsitektur

```
Internet / Tailnet / Cloudflare
        │
   ┌────▼─────┐      ┌──────────────┐      ┌──────────────┐
   │   proxy  │─────▶│      web     │─serve│   dist/      │
   │  nginx    │      │  nginx statis │      │  (Astro)     │
   │ :8095:80 │      │  (internal)  │      │  12 produk   │
   └──────────┘      └──────────────┘      └──────────────┘
   (opsional) tunnel (cloudflared) ◀── Cloudflare Tunnel
```

- **`web`** — nginx:alpine yang menyajikan hasil `astro build` di `dist/`. Tidak terekspos ke host, hanya lewat network `internal`. Jalan sebagai user non-root, rootfs `read_only`, tanpa cap.
- **`proxy`** — reverse proxy publik. Satu-satunya pintu keluar: bind `PUBLIC_HTTP_PORT` di host, diteruskan ke `web`. `user: 101:101` (nginx), non-root, read-only.
- **`tunnel`** *(opsional)* — profil `tunnel`, untuk ekspos ke internet via Cloudflare Zero Trust.

> Catatan: `proxy` di-build sendiri (`nginx/proxy/Dockerfile`), bukan ngandalkan bind-mount `:ro` konfigurasinya. Bind-mount read-only pada `/etc/nginx/conf.d` terhadap rootfs read-only ternyata memicu bug `open() "/etc/nginx/on" failed`. Konfigurasi di-BAKE ke image, runtime tanpa volume.

---

## Struktur Folder

```
├── src/
│   ├── assets/produk/     # Foto produk (WebP). Isi placeholder = hasil generate.
│   ├── data/
│   │   ├── produk.json    # >>> Sumber konten produk (12 item, 6 kategori)
│   │   ├── produk.ts      # Loader: cari, terlaris, promo, ukuran
│   │   ├── site.ts        # Nama brand, kontak, WA, sosmed, URL absolut
│   │   ├── konten.ts      # Keunggulan, testimoni, promo, FAQ, alur belanja
│   │   └── tentang.ts     # Profil brand, tim, nilai
│   ├── components/        # Header, Footer, ProdukCard, Ikon, dll.
│   ├── layouts/           # BaseLayout (SEO + JSON-LD ClothingStore)
│   ├── lib/format.ts      # Rupiah, tanggal, URL
│   ├── pages/             # index, katalog, produk/[slug], tentang, kontak, 404, robots, rss
│   └── styles/global.css  # Tema Tailwind v4 (OKLCH) + utility custom
├── scripts/
│   ├── generate-sample-images.mjs   # Placeholder produk saat belum ada foto asli
│   └── generate-static-assets.mjs   # og-image, logo, apple-touch-icon
├── nginx/
│   ├── web/               # Config untuk service `web` (statis)
│   └── proxy/             # Dockerfile + config untuk service `proxy`
├── astro.config.mjs
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Prasyarat

- **Node ≥ 22.12** (untuk development & build lokal)
- **Docker** + Docker Compose v2 (untuk deploy)

## Development Lokal

```bash
npm install
npm run dev        # http://localhost:4321 (Astro dev server)
```

Cek statis & tipe:

```bash
npm run check      # astro check (0 error = bersih)
npm run build      # hasil di dist/
npm run preview    # preview hasil build (sesuai SITE_URL, default :8095)
```

---

## Deploy dengan Docker

1. Buat `.env` dari template:

   ```bash
   cp .env.example .env
   ```

2. Sesuaikan isinya (semua punya default aman):

   | Variabel | Default | Fungsi |
   |---|---|---|
   | `SITE_URL` | `http://localhost:8095` | URL publik untuk canonical / OG / sitemap / RSS |
   | `PUBLIC_HTTP_PORT` | `8095` | Port publik yang di-bind `proxy` di host |
   | `PUBLIC_HTTPS_PORT` | — | Opsional, untuk HTTPS bila port 443 host bebas |
   | `TUNNEL_TOKEN` | — | Token Cloudflare Zero Trust untuk profile `tunnel` |

   > `SITE_URL` dipakai saat build (di-pass sebagai `ARG SITE_URL`). Ganti dengan domain asli **sebelum** build produksi, karena canonical & sitemap mengikuti nilai ini.

3. Build & jalankan:

   ```bash
   docker compose up -d --build
   docker compose ps        # web: healthy, proxy: Up
   curl http://127.0.0.1:8095/   # → 200
   curl http://127.0.0.1:8095/healthz
   ```

   Rebuild setelah mengubah konten:

   ```bash
   docker compose up -d --build web
   ```

   Cek log: `docker compose logs -f proxy web`

---

## Ekspos ke Internet

Port **443 di host sudah dipakai** `tailscale serve` (ke deer-flow, `127.0.0.1:20128`). Karena itu HTTPS publik tidak langsung bind `443`. Pilih salah satu:

### Opsi A — Tailscale Serve (paling simpel, tanpa domain publik)

Pastikan tailnet aktif, lalu arahkan `tailscale serve` ke `127.0.0.1:8095`. Port 443 host sudah terpakai, jadi pakai path atau `--https-port` lain:

```bash
sudo tailscale serve --bg --https-port 8443 8095
# akses via https://<nama-mesin>:8443 (dalam tailnet)
```

atau expose sebagai path di serve yang ada. Cek konfigurasi: `sudo tailscale serve status`.

### Opsi B — Cloudflare Tunnel (domain publik, tanpa port di host)

1. Buat **Zero Trust Tunnel** di dash.cloudflare.com → dapatkan token.
2. Isi `TUNNEL_TOKEN=` di `.env`, arahkan DNS (CNAME) ke tunnel ID.
3. Nyalakan:

   ```bash
   docker compose --profile tunnel up -d
   ```

`cloudflared` jalan di dalam network `internal` yang sama, jadi tidak perlu port publik di host.

### Opsi C — Let's Encrypt (bila 443 host suatu saat bebas)

Di `nginx/proxy/conf.d/default.conf` ada blok `server` untuk HTTPS yang masih dikomentari. Alurnya: tambahkan service `certbot` (webroot) di `docker-compose.yml`, potong port `PUBLIC_HTTPS_PORT` di dekat certbot, lalu aktifkan konfigurasi tersebut dan rebuild `proxy`.

---

## Kelola Konten Produk

Semua isi toko ada di `src/data/produk.json`. Satu produk contoh:

```json
{
  "slug": "midi-dress-sifon-rosa",
  "nama": "Midi Dress Sifon Rosa",
  "kategori": "dress",
  "harga": 259000,
  "hargaAsli": 325000,
  "warna": ["Rosa", "Sand"],
  "ukuran": ["S", "M", "L", "XL"],
  "stok": true,
  "deskripsi": "...",
  "berat": 300
}
```

Detail field: lihat komentar/type di `src/data/produk.ts`.

Tambah produk baru:

1. Tambahkan entri di `src/data/produk.json`.
2. Letakkan foto asli (foto hape juga oke, usahakan rasio 4:5) di `src/assets/produk/` dengan nama **`<slug>.webp`**. Astro otomatis mengoptimasi & membuat `srcset` responsif.
   - Tidak punya foto? Jalankan `npm run gen:gambar` untuk membuat placeholder WebP otomatis dari `produk.json`.
3. Cek & rebuild:

   ```bash
   npm run check
   docker compose up -d --build web
   ```

> Ganti teks brand/kontak di `src/data/site.ts` (nama, alamat, WA, Instagram, TikTok). Teks marketing di `konten.ts` & `tentang.ts`.
> `scripts/generate-static-assets.mjs` membuat `og-default.png`, `logo.png`, `apple-touch-icon.png` — jalankan ulang bila mengubah brand.

---

## Keamanan yang Diterapkan

- Semua container **non-root**, `read_only: true`, `cap_drop: ALL` (+ `cap_add` minimal: `CHOWN`, `NET_BIND_SERVICE`), `no-new-privileges`.
- `nginx` statis: `server_tokens off`, `X-Content-Type-Options: nosniff`, `client_max_body_size` dibatasi, gzip + cache aset ber-hash selamanya.
- Tanpa database, tanpa proses latar — footprint minimal untuk attack surface.

## Troubleshooting

| Gejala | Penyebab / Solusi |
|---|---|
| `invalid pool request: Pool overlaps` saat `up` | Network bridge bentrok subnet — hapus `ipam`/subnet manual di `docker-compose.yml` (default Docker sudah aman) |
| `Restarting`, log `open() "/etc/nginx/on" failed` | Lapisan proxy pakai `access_log on;` (nilai `on` dianggap nama file) atau bind-mount `:ro` pada `/etc/nginx/conf.d` — jangan ditulis ulang, gunakan Config-image `toko-baju-proxy` |
| Port bentrok setelah `up` | Ganti `PUBLIC_HTTP_PORT` di `.env`, lalu `docker compose up -d` |
| Sitemap/canonical salah domain | Bangun ulang dengan `SITE_URL=https://domain.id` di `.env` |

---

## Script NPM

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server Astro |
| `npm run check` | Cek tipe/kondisi kode |
| `npm run build` | Build statis ke `dist/` |
| `npm run preview` | Preview hasil build |
| `npm run gen:gambar` | Generate placeholder produk dari `produk.json` |