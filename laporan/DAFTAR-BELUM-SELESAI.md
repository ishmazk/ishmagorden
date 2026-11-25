# Hal yang Belum Selesai / Perlu Konfirmasi

## Sudah diselesaikan (25 Nov 2026)
- **Alamat showroom** dari Anda (Genteng Wetan, Genteng) kini tampil di Kontak, footer, FAQ, dan data LocalBusiness, lengkap dengan tautan Google Maps. Untuk menyembunyikan: `tampilkanAlamat` = `false` di `data/site.json`.

## Perlu keputusan Anda
1. **Penempatan awal foto ke Standart / Premium / Deluxe adalah tebakan saya** berdasarkan tampilan (gorden ring sederhana = Standart, pelmet/ikatan rumbai = Premium, plafon tinggi/model klasik/berlapis = Deluxe). Definisi tipe dari Anda belum ada. Perbaiki lewat baris `"tipe"` di `data/galeri.json`, dan isi penjelasan tipe di `data/tipe-gorden.json`. Tidak ada harga atau spesifikasi yang dikaitkan dengan tipe.
2. **Foto lain dari kiriman pertama** (satu berwatermark "cantikinteriors", beberapa bercaption toko lain, beberapa tampak foto internet) tetap tidak dipasang. 10 foto terbaru dan foto berbanner ISHMA sudah dikonfirmasi milik Anda dan dipasang.
3. ~~URL Facebook~~ sudah dipasang (tautan share dari Anda). Jika ada alamat halaman yang lebih pendek/permanen, ganti `facebookUrl` di `data/site.json`.
4. **Cakupan pengukuran/pemasangan.** Website hanya menulis "dikonfirmasi per lokasi". Beri tahu wilayah yang benar-benar dilayani jika ingin ditulis spesifik.
5. ~~Jam buka~~ sudah dipasang (Senin-Sabtu 07.30-16.00, Minggu 08.00-12.00 WIB; online 24 jam), diubah lewat `jamBuka` di `data/site.json`.

## Perlu pemeriksaan harga manual (PDF Sharp Point tidak ada pada sesi ini)
4. **File PDF "Sharp Point Price List 2025" tidak ikut terlampir.** Saya tidak bisa membandingkan ulang angka dengan sumber. Semua 60 harga yang tampil berasal dari data transkripsi di ZIP lama, disalin persis (diuji otomatis identik 100%) tetapi **belum saya cocokkan sendiri dengan halaman PDF**. Status baris: `transkripsi-sebelumnya`. Setelah Anda cek, ubah menjadi `terverifikasi`.
5. **Glydea Ultra 35e WT (halaman cetak 31 / PDF 35)**: Rp. 14.000.000 diragukan. Disembunyikan sampai dicek.
6. Satuan harga kain tertulis "mengikuti satuan di katalog" karena data lama tidak mencatat satuan (per meter / per lembar). Cek halaman 34 dan isi satuan yang benar.
7. **Sisa katalog (48 halaman)** belum ditranskripsi: roller, zebra/venus/ares, vertical, rel manual, produk lain. Halaman produknya ada tanpa harga ("tanya via WhatsApp"). Kirim PDF atau foto per halaman agar saya lanjutkan.
8. Arti kolom varian "Boston 1-15 / 16-24 / 25-36" tidak dijelaskan di data; ditampilkan apa adanya.

## Konten yang belum ada
9. **Foto produk asli** (kain, blinds, rel, motor): belum ada, kartu produk memakai penanda "foto menyusul".
10. Spesifikasi/warna/ukuran produk: dikosongkan karena tidak ada di data (tidak dikarang).
11. Testimoni: tidak dibuat.

## Teknis
12. **Build Netlify belum diuji di Netlify sendiri**; diuji dengan Node.js 22 secara lokal. Status "online" baru benar setelah Anda deploy.
13. Skor Lighthouse/Core Web Vitals belum diukur (tidak ada alat/jaringan di sini). Pengukuran dilakukan setelah tayang lewat PageSpeed Insights.
14. Foto baru yang Anda unggah tampil sebagai file asli (tanpa konversi WebP otomatis). Kecilkan dulu (lihat panduan foto).
15. Unit usaha ISHMA Interior dan ISHMA Tailor baru disebut sebagai nama; halamannya belum dibuat.
