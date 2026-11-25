# Panduan Menambah dan Mengedit Artikel dari HP

Setiap artikel adalah satu file di folder `konten/artikel/` berakhiran `.md`. Nama file menjadi alamat halaman, mis. `cara-memilih-gorden-ruang-tamu.md` → `/artikel/cara-memilih-gorden-ruang-tamu/`.

## Menambah artikel baru
1. GitHub → `konten` → `artikel` → **Add file** → **Create new file**.
2. Nama file: huruf kecil, pakai tanda minus, akhiri `.md`. Contoh: `memilih-gorden-kamar-anak.md`
3. Isi dengan format ini:

```
---
judul: Memilih gorden untuk kamar anak
deskripsi: Ringkasan 1-2 kalimat (120-155 karakter) yang muncul di Google.
kategori: Panduan
tanggal: 2026-12-01
gambar: articles/sampul-kamar-anak.jpg
---
Paragraf pembuka.

## Judul bagian
Isi paragraf. Teks **tebal** dan *miring*.

- Poin pertama
- Poin kedua

1. Langkah satu
2. Langkah dua

Tautan ke halaman lain: [lihat katalog](/katalog/).
```
- Baris `gambar:` boleh dihapus. Jika dipakai, upload gambarnya dulu ke `assets/images/articles/`.
- Baris `tayang: tidak` (tambahkan di bagian atas) menyembunyikan artikel sementara (draft).
4. **Commit changes**. Artikel muncul otomatis di halaman Artikel dan sitemap.

## Mengedit artikel
Buka file → ikon pensil → ubah → Commit.

## Menghapus artikel
Buka file → ⋯ → Delete file → Commit.

## Tips menulis
- Tulis dari pengalaman nyata dengan pelanggan; jawab satu pertanyaan per artikel.
- Jangan menulis klaim yang tidak pasti (harga, stok, wilayah pemasangan).
- Sisipkan tautan ke katalog, galeri, atau artikel lain.
- Judul harus memuat kata yang dicari orang, mis. "gorden kamar tidur Banyuwangi".
