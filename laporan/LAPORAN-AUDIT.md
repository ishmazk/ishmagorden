# Laporan Audit Website ISHMA Gorden (paket lama: "Final Release")

Dasar audit: ZIP `ISHMA-Gorden-Website-Final-Release.zip` (29 file, 6 halaman HTML, 9 foto, 1 logo).

## Kritis
1. **Foto tidak bisa dikelola dari HP.** Foto ditulis langsung di HTML; menambah foto = mengedit kode. → Diganti galeri otomatis dari folder `assets/images/gallery/`.
2. **Tidak ada canonical dan sitemap berisi `BASE_URL`** (placeholder, tidak valid) dan robots.txt tanpa Sitemap aktif. → Dibuat otomatis saat build memakai URL Netlify/domain.
3. **Harga tidak dapat ditelusuri dengan rapi / data harga tercampur dengan tampilan.** Katalog hanya satu halaman statis. → Sumber harga tunggal `data/harga-sharp-point.json` dengan halaman sumber per baris; halaman produk dan daftar harga dibuat dari data itu.
4. **Satu harga tampak janggal** (Glydea Ultra 35e WT Rp. 14.000.000, lebih mahal dari versi RTS Rp. 11.650.000; pola model lain sebaliknya). → Ditahan dan ditandai `perlu-cek-manual`, tidak tampil.
5. **Tarif "Pemasangan Bodetabek"** ikut tampil untuk situs Banyuwangi (membingungkan, dan klaim cakupan layanan tidak boleh dikarang). → Disembunyikan.
6. **Katalog Sharp Point hanya mencakup 2 dari 50 halaman.** Tidak diperbaiki karena PDF tidak tersedia pada sesi ini (lihat DAFTAR-BELUM-SELESAI).

## Penting
7. Alt text menyesatkan: foto hasil pemasangan diberi alt "Ilustrasi gorden kain / blinds / rel" padahal bukan ilustrasi produk itu. → Alt baru ditulis dari isi foto; kartu kategori tanpa foto memakai penanda "foto menyusul", bukan foto yang tidak sesuai.
8. Tiga gambar kategori SVG placeholder tidak terpakai. → Dihapus.
9. Tidak ada halaman: detail produk, galeri khusus, FAQ, layanan, kebijakan privasi, 404. → Dibuat.
10. Artikel hanya 3 judul tanpa isi. → 8 artikel lengkap, dapat ditambah dari HP.
11. Tidak ada structured data, Open Graph hanya sebagian, tidak ada breadcrumb. → Ditambahkan (LocalBusiness tanpa alamat, WebSite, Product tanpa Offer, FAQPage, Article, BreadcrumbList).
12. Halaman `/gorden/` memuat produk lewat JS dari JSON; tanpa JS tidak tampil dan sulit dibaca Google. → Semua dirender statis; `/gorden/` dialihkan 301 ke `/katalog/`.
13. Tombol WhatsApp memakai JavaScript untuk mengisi tautan; sebagian hanya `wa.me` tanpa pesan. → Tautan lengkap sejak HTML dengan pesan sesuai konteks halaman.
14. Panduan lama meminta pemilik mengedit HTML untuk menambah foto/artikel. → 4 panduan baru.
15. Foto 1,2-1,5 MP tanpa WebP. → Salinan WebP (±45-100 KB) otomatis dipakai; JPG asli tetap utuh.

## Penyempurnaan
16. Tipografi/desain generik → desain baru (serif elegan, krem-cokelat selaras logo), mobile-first.
17. Tidak ada `lang`, skip-link, fokus keyboard → ditambahkan.
18. Header keamanan dan cache → ditambahkan di `netlify.toml`.
19. Nama file foto `portfolio-...` → nama deskriptif `gorden-...-ishma-gorden`.
20. Tautan Facebook tidak ada → disediakan kolom `facebookUrl` (URL belum diketahui).

## Hal yang dipertahankan
Logo, 9 foto asli (tidak diubah), identitas, tagline, nomor WhatsApp, data harga yang ada (angka disalin persis), keterangan netto/PPN, tidak ada klaim toko fisik.
