export interface Prinsip {
  judul: string;
  teks: string;
}

export interface Orang {
  nama: string;
  peran: string;
  inisial: string;
  bio: string;
}

export const prinsip: readonly Prinsip[] = [
  {
    judul: 'Bahan diuji dulu, baru dijahit',
    teks: 'Setiap kain baru harus dipakai coba tiga hari sebelum masuk produksi. Baru setelah adem dan tidak menerawang, saya approve untuk dijahit.',
  },
  {
    judul: 'Jahitan rangkap di titik rawan',
    teks: 'Kancing, manset, dan resleting dijahit dua kali. Biayanya lebih mahal, tapi tidak ada yang copot dalam tiga bulan pemakaian.',
  },
  {
    judul: 'Harga dihitung dari bahan nyata',
    teks: 'Kami hitung harga dari kain, tambahan, dan biaya jahit sebenarnya. Kalau ada diskon, diskonnya jujur dan harga coret tidak dipalsukan.',
  },
  {
    judul: 'Produksi bertahap, bukan menumpuk stok',
    teks: 'Kami hanya produksi sesuai pesanan dan stok yang sudah terjual. Yang laku kami produksi ulang, yang sepi kami hentikan sebelum jadi barang mati.',
  },
];

export const tim: readonly Orang[] = [
  {
    nama: 'Nadya Pramesti',
    peran: 'Founder dan Perancang',
    inisial: 'NP',
    bio: 'Belajar membuat pola di Bandung selama dua tahun. Sekarang semua koleksi di gambar sendiri olehnya.',
  },
  {
    nama: 'Rani Oktavia',
    peran: 'Penanggung Jawab Produksi',
    inisial: 'RO',
    bio: 'Dua belas tahun oversee proses potong dan jahit. Semua batch dicek satu per satu sebelum boleh dikirim.',
  },
  {
    nama: 'Tari Wulandari',
    peran: 'Layanan Pelanggan',
    inisial: 'TW',
    bio: 'Yang paling hafal rekomendasi ukuran untuk setiap tipe badan. Balasan WhatsApp-nya biasanya kurang dari lima menit.',
  },
  {
    nama: 'Bima Saputra',
    peran: 'Logistik dan Pengemasan',
    inisial: 'BS',
    bio: 'Menjamin setiap paket dikemas rapi, dapat kartu ucapan tulis tangan, dan resinya bisa dilacak realtime.',
  },
];

export const cerita = {
  pendahuluan:
    'Mekar berdiri tahun 2021. Berawal dari satu mesin jahit di ruang tamu rumah nenek di Cikutra, modal awalnya nol: bahan dibeli dari Pasar Caringin, utamanya dijahit satu per satu untuk anak kos sekitar.',
  isi: 'Lima tahun kemudian cara kerjanya tetap sama. Bahan dibeli langsung ke tempat asalnya, dijahit di ruang kerja kecil kami sendiri, lalu difoto sendiri tanpa filter yang membuat warna tidak realistis. Yang berubah hanya jumlah mesinnya.',
  langkah: [
    { judul: 'Cari bahan', teks: 'Ke Pasar Caringin dan workshop pewarnaan lokal, pilih kain yang belum dipakai vendor lain.' },
    { judul: 'Buat pola', teks: 'Pola digambar ulang dari nol untuk setiap ukuran, lalu dijahit di ruang kerja kami.' },
    { judul: 'Cek kualitas', teks: 'Minta fitting ke tiga orang dengan bentuk badan berbeda sebelum produk masuk katalog.' },
    { judul: 'Foto produk', teks: 'Difoto sendiri di studio kecil kami, tanpa filter yang bikin warna tidak realistis.' },
    { judul: 'Kirim', teks: 'Dikemas dengan kartu ucapan tulis tangan dan nomor resi yang bisa dilacak realtime.' },
  ],
} as const;

export const nilai = [
  { label: 'Tahun berdiri', nilai: '2021', keterangan: 'Berawal dari satu mesin jahit' },
  { label: 'Produk terkirim', nilai: '12.400+', keterangan: 'Ke 38 kota di Indonesia' },
  { label: 'Ukuran tersedia', nilai: 'S sampai XXL', keterangan: 'Potongan longgar, mudah disesuaikan' },
  { label: 'Rating rata-rata', nilai: '4,9', keterangan: 'Dari 2.140 ulasan' },
] as const;
