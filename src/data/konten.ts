export interface Ulasan {
  nama: string;
  inisial: string;
  kota: string;
  rating: number;
  teks: string;
  produk: string;
  tanggal: string;
}

export interface Keunggulan {
  judul: string;
  teks: string;
  ikon: 'truck' | 'swap' | 'sparkle' | 'scissors' | 'tag' | 'shield';
}

export interface Promo {
  judul: string;
  sub: string;
  kode: string;
  syarat: string;
  berlaku: string;
}

export const keunggulan: readonly Keunggulan[] = [
  {
    judul: 'Gratis ongkir',
    teks: 'Setiap pembelian di atas Rp300.000 langsung gratis ongkir ke seluruh Indonesia.',
    ikon: 'truck',
  },
  {
    judul: 'Bisa coba dulu',
    teks: 'Ruang fitting bersih di store. Kalau kurang cocok, bisa tukar dalam 7 hari.',
    ikon: 'swap',
  },
  {
    judul: 'Kain adem',
    teks: 'Bahan pilihan yang adem dan tidak menerawang, sudah dicoba sendiri oleh tim kami.',
    ikon: 'sparkle',
  },
  {
    judul: 'Jahitan rapi',
    teks: 'Setiap kancing dijahit rangkap dan bagian dalam dirapikan, bukan asal jahit.',
    ikon: 'scissors',
  },
  {
    judul: 'Harga jujur',
    teks: 'Harga yang tertera sudah final, tidak ada biaya tambahan yang muncul di akhir.',
    ikon: 'tag',
  },
  {
    judul: 'Garansi tukar',
    teks: 'Ada cacat produksi? Tukar atau refund penuh dalam 14 hari.',
    ikon: 'shield',
  },
];

export const ulasan: readonly Ulasan[] = [
  {
    nama: 'Rina Puspita',
    inisial: 'RP',
    kota: 'Bandung',
    rating: 5,
    teks: 'Dress sifonnya elegan sekali. Ukurannya pas di badan saya yang biasanya susah cari. Pengirimannya juga cepat, sampai dua hari.',
    produk: 'Midi Dress Sifon Rosa',
    tanggal: '2026-09-02',
  },
  {
    nama: 'Ayu Lestari',
    inisial: 'AL',
    kota: 'Surabaya',
    rating: 5,
    teks: 'Gamis abayanya nyaman banget untuk acara. Bahannya adem dan tidak menerawang, muat celana dalam juga dan itu penting.',
    produk: 'Gamis Abaya Dusty',
    tanggal: '2026-08-21',
  },
  {
    nama: 'Dewi Anggraini',
    inisial: 'DA',
    kota: 'Jakarta Selatan',
    rating: 4,
    teks: 'Kemeja linennya bagus dan warnanya sesuai foto. Pengirimannya agak lama karena jatuh akhir pekan, tapi overall saya puas.',
    produk: 'Kemeja Linen Sage',
    tanggal: '2026-08-09',
  },
  {
    nama: 'Nadia Salsabila',
    inisial: 'NS',
    kota: 'Yogyakarta',
    rating: 5,
    teks: 'Beli set linen matcha sekaligus, atasan dan celananya dijahit bagus. Timnya sabar banget bantu pilih warna lewat WhatsApp.',
    produk: 'Set Linen Matcha',
    tanggal: '2026-09-11',
  },
  {
    nama: 'Siti Rahmawati',
    inisial: 'SR',
    kota: 'Semarang',
    rating: 5,
    teks: 'Kulotnya anti kusut beneran, dipakai seharian tetap rapi. Sangat layak dengan harganya.',
    produk: 'Kulot Pleats Sand',
    tanggal: '2026-07-30',
  },
];

export const promoAktif: readonly Promo[] = [
  {
    judul: 'Diskon 20% Gamis & Abaya',
    sub: 'Koleksi modest pilihan dengan harga turun, tanpa minimum belanja.',
    kode: 'GAMIS20',
    syarat: 'Berlaku untuk semua item kategori Gamis & Abaya.',
    berlaku: 'sampai 30 November 2026',
  },
  {
    judul: 'Gratis Ongkir Se-Indonesia',
    sub: 'Ongkir Regular dan Kilat menjadi nol untuk pembelian minimum Rp300.000.',
    kode: 'ONGKIRGRATIS',
    syarat: 'Min. belanja Rp300.000, otomatis terpotong saat checkout.',
    berlaku: 'selama persediaan masih ada',
  },
];

export const faq: readonly { tanya: string; jawab: string }[] = [
  {
    tanya: 'Berapa lama pesanan saya diproses?',
    jawab:
      'Pesanan sebelum pukul 14.00 WIB diproses hari itu juga. Pengiriman Regular 2-4 hari kerja, Kilat 1-2 hari kerja untuk Jabodetabek, Bandung, dan Surabaya.',
  },
  {
    tanya: 'Bisa coba dulu di store?',
    jawab: 'Bisa. Store buka Senin sampai Sabtu dan tersedia ruang fitting. Datang saja, tidak perlu janji.',
  },
  {
    tanya: 'Bagaimana kalau ukuran tidak cocok?',
    jawab:
      'Tukar ukuran gratis dalam 7 hari selama label masih menempel dan produk belum dipakai. Ongkir tukar pertama kami tanggung.',
  },
  {
    tanya: 'Apakah bisa COD?',
    jawab:
      'Bisa untuk area Jabodetabek, Bandung, dan Surabaya dengan nilai pesanan maksimal Rp3.000.000. Di luar area itu memakai transfer bank atau e-wallet.',
  },
  {
    tanya: 'Apakah kainnya menerawang?',
    jawab:
      'Semua item sudah kami periksa penerawangnya. Untuk dress dan gamis, lining sudah termasuk jadi aman dipakai tanpa lapisan tambahan.',
  },
  {
    tanya: 'Bisakah pesan custom jahitan?',
    jawab:
      'Bisa. Untuk pembelian di atas 3 item atau pesanan gamis custom, kami menyediakan penyesuaian ukuran gratis. Chat WhatsApp kami untuk detailnya.',
  },
];

export const alurBelanja: readonly { langkah: string; judul: string; teks: string }[] = [
  {
    langkah: '01',
    judul: 'Pilih koleksi',
    teks: 'Telusuri katalog, lihat detail bahan, ukuran, dan warna yang tersedia.',
  },
  {
    langkah: '02',
    judul: 'Konfirmasi via WhatsApp',
    teks: 'Sebutkan nama produk, ukuran, dan warna. Tim kami bantu cek stok terbaru.',
  },
  {
    langkah: '03',
    judul: 'Bayar dan proses',
    teks: 'Transfer, e-wallet, atau COD sesuai lokasi. Pesanan diproses di hari yang sama.',
  },
  {
    langkah: '04',
    judul: 'Barang sampai',
    teks: 'Lacak paketmu, coba dulu, dan tukar gratis kalau ternyata tidak cocok.',
  },
];

export const statistik = [
  { angka: '4,9', label: 'Rating pelanggan' },
  { angka: '12rb+', label: 'Pesanan terkirim' },
  { angka: '7 hari', label: 'Tukar gratis' },
  { angka: '100%', label: 'Kirim se-Indonesia' },
] as const;
