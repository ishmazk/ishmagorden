# Panduan Update Foto Gorden dari HP (Standart · Premium · Deluxe)

Foto gorden dibagi 3 tipe. **Tipe ditentukan oleh folder tempat Anda mengunggah.** Tidak perlu mengedit file apa pun.

```
assets/images/gallery/
  standart/   <- foto gorden tipe STANDART
  premium/    <- foto gorden tipe PREMIUM
  deluxe/     <- foto gorden tipe DELUXE
```

## A. MENAMBAH foto (cara paling mudah)
1. Buka **github.com** di Chrome HP → pilih repository `ishma-gorden-website`.
2. Ketuk folder: **assets** → **images** → **gallery** → pilih **standart**, **premium**, atau **deluxe**.
3. Ketuk **Add file** → **Upload files** → **choose your files** → pilih foto dari HP (boleh banyak sekaligus).
4. Gulir ke bawah → **Commit changes**.
5. Tunggu 1-2 menit. Foto tampil otomatis di **Galeri → tipe yang sesuai** dan di **Galeri → Semua**.

Itu saja. Foto yang belum didaftarkan di mana pun tetap tampil, judulnya dibuat dari nama file.

### Nama file yang baik
Huruf kecil, tanpa spasi, pakai tanda minus, akhiri `-ishma-gorden`. Contoh:
`gorden-abu-ruang-tamu-ishma-gorden.jpg`
Nama file membantu Google memahami foto. Format: `.jpg`, `.jpeg`, `.png`, `.webp`. Ukuran ideal di bawah 500 KB (lebar 1200-1600 px). Jika foto kamera 3-8 MB, kecilkan dulu (aplikasi Galeri HP → Ubah ukuran, atau squoosh.app).

## B. Memberi judul sendiri / mengatur urutan (opsional)
Buka `data/galeri.json` → ikon pensil. Tambahkan blok seperti ini (satu blok per foto; antar blok pakai koma, blok terakhir tanpa koma):
```json
{ "file": "gorden-abu-ruang-tamu-ishma-gorden.jpg",
  "judul": "Gorden abu-abu ruang tamu",
  "alt": "Gorden abu-abu dan vitrase putih di ruang tamu" }
```
- Urutan tampil = urutan blok. Foto yang tidak ditulis tampil setelahnya.
- Nama file salah ketik → hanya diabaikan, tidak membuat error.

## C. Memindahkan foto ke tipe lain (tanpa memindahkan file)
Di `data/galeri.json`, tambahkan satu baris `"tipe"` pada blok foto itu:
```json
{ "file": "gorden-abu-ruang-tamu-ishma-gorden.jpg", "tipe": "premium", "judul": "...", "alt": "..." }
```
Isi `tipe`: `standart`, `premium`, atau `deluxe`. Baris ini mengalahkan folder. Jika foto belum tertulis di galeri.json, tambahkan bloknya dulu.

## D. MENGHAPUS foto
1. Buka folder fotonya → ketuk nama file → ikon **⋯** → **Delete file** → **Commit changes**.
2. (Opsional) hapus juga file `.webp` bernama sama di `assets/images/_dioptimasi/gallery/<tipe>/` bila ada.

## E. MENGGANTI foto
Unggah foto baru dengan **nama file yang sama** di folder yang sama (menimpa). Lalu hapus file `.webp` bernama sama di `assets/images/_dioptimasi/gallery/<tipe>/` supaya tidak menampilkan foto lama.

## F. Mengubah penjelasan tiap tipe
Buka `data/tipe-gorden.json` → ubah teks `"deskripsi"` (jangan ubah `slug`). Jangan menulis harga atau klaim yang belum pasti.

## G. Foto Beranda dan foto produk
- Foto besar Beranda: `assets/images/hero/` (nama `hero-beranda.jpg`; hapus `.webp`-nya di `_dioptimasi/hero/` jika mengganti).
- Foto produk: unggah ke `assets/images/products/`, lalu isi `"foto": "products/nama.jpg"` pada produk di `data/produk.json`.

## Aturan penting
- Hanya unggah foto hasil kerja sendiri atau yang sudah Anda punya izinnya. Jangan memakai foto toko lain atau foto internet sebagai hasil pemasangan ISHMA.
- Foto tidak muncul? Cek nama file dan folder, lalu lihat Netlify → Deploys (hijau = berhasil).
- Salah unggah? Di GitHub buka **History** untuk mengembalikan.
