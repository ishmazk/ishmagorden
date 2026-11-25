# Panduan Update Produk dan Harga dari HP

Data produk dipisah dari desain, jadi Anda cukup mengedit 2 file di folder `data/`.

| File | Isinya |
|---|---|
| `data/produk.json` | Daftar kategori dan produk (nama, deskripsi, foto, warna, ukuran, spesifikasi) |
| `data/harga-sharp-point.json` | **Sumber harga.** Disalin persis dari katalog Sharp Point |
| `data/site.json` | Kontak, WhatsApp, media sosial, wilayah |

## ATURAN HARGA (mutlak)
Harga di katalog Sharp Point adalah harga jual resmi ISHMA. **Jangan** menambah, mengurangi, membulatkan, atau memberi margin. Setiap baris harga mencatat halaman katalog sumbernya (`hal_cetak`, `hal_pdf`) agar bisa dicek.

## 1. Mengubah deskripsi produk
1. GitHub → `data/produk.json` → ikon pensil.
2. Cari nama produk (di HP: menu Chrome → **Cari di halaman**).
3. Ubah teks di antara tanda kutip pada `"deskripsi"`. Jangan hapus tanda kutip atau koma.
4. **Commit changes**.

## 2. Menambah produk baru
Salin satu blok produk yang sudah ada, tempel setelahnya (beri koma di antara blok), lalu ubah isinya:
```json
{
  "slug": "nama-produk-tanpa-spasi",
  "nama": "Nama Produk",
  "kategori": "gorden-kain",
  "deskripsi": "Deskripsi singkat yang benar.",
  "spesifikasi": ["Contoh: lebar kain 3 m"],
  "warna": ["Cokelat", "Abu-abu"],
  "ukuran": [],
  "foto": "",
  "harga": "",
  "biaya_jahit": false
}
```
- `slug` huruf kecil tanpa spasi, tidak boleh sama dengan produk lain (jadi alamat halaman `/produk/slug/`).
- `kategori` salah satu: `gorden-kain`, `vitrase`, `window-blinds`, `rel-aksesori`, `gorden-motorized`, `lainnya`.
- `spesifikasi`, `warna`, `ukuran`: isi hanya bila datanya **benar**. Kosongkan `[]` jika belum ada.
- `harga` kosong = tampil "tanya via WhatsApp".

## 3. Menambah harga produk
Di `data/harga-sharp-point.json`, salin satu baris harga lalu ubah. Contoh:
```json
{
  "id": "kain-contoh-v1",
  "produk": "nama-kode-produk",
  "kelompok": "kain",
  "nama": "Contoh",
  "varian": "V1",
  "lebar": "3.00 m",
  "harga": "Rp. 150.000",
  "satuan": "mengikuti satuan di katalog",
  "hal_cetak": 34,
  "hal_pdf": 38,
  "status": "terverifikasi"
}
```
- `produk` harus sama dengan isi `"harga"` pada produk di `produk.json`.
- Tulis angka **persis** seperti di katalog.
- `status`: `terverifikasi` = sudah dicocokkan dengan PDF asli → tampil. `transkripsi-sebelumnya` → tampil. `perlu-cek-manual` atau `tidak-ditampilkan` → **tidak tampil**. Jika ragu, pakai `perlu-cek-manual`.

## 4. Menyembunyikan produk atau harga
Harga: ubah `status` menjadi `perlu-cek-manual`. Produk: hapus blok produknya dari `produk.json`.

## 5. Mengubah kontak
Buka `data/site.json`: `whatsapp` (format 62..., tanpa +/0 di depan), `whatsappTampil`, `instagram`, `tiktok`, `facebookUrl`. Semua tombol WhatsApp ikut berubah.

## Setelah mengedit
**Commit changes**, tunggu 1-2 menit, lalu cek halaman. Jika Netlify gagal build (merah), kemungkinan ada tanda koma/kutip yang hilang di file JSON. Buka Deploys → klik build gagal → baca pesan; atau kembalikan versi lama lewat **History** di GitHub.
Tip: cek penulisan JSON di jsonlint.com (tempel isi file) sebelum commit.

## Yang masih perlu dicek manual
Lihat `LAPORAN/DAFTAR-BELUM-SELESAI.md`.
