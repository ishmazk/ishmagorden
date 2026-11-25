# Laporan Pengujian

Tanggal: 2026-11-25 (diperbarui). Lingkungan: Node.js 22 (build), Chromium via Playwright (tampilan). **Belum diuji di server Netlify asli.**

## Yang DIUJI dan hasilnya
| Pengujian | Cara | Hasil |
|---|---|---|
| Build | `node build.mjs` | Berhasil: 39 halaman, 9 foto galeri, 8 artikel |
| Semua halaman terbuat | skrip `scripts/uji.mjs` | Lulus (10 halaman inti + 20 produk + 8 artikel + 404) |
| Tautan & aset internal (href/src/srcset) | skrip | Semua ada, 0 rusak |
| Anchor internal (#kategori) | skrip | Lulus |
| Tombol/tautan WhatsApp | skrip | 162 tautan: nomor 6282331219722 benar, semua ada pesan awal |
| Gambar | skrip + Chromium | Semua `<img>` ber-alt, tidak ada gambar gagal muat |
| Harga identik dengan sumber ZIP lama | skrip membandingkan 62 baris | 62/62 identik; semua `Rp.` yang tampil (146) ada di sumber |
| Harga yang ditahan tidak tampil | skrip | Rp. 14.000.000 dan tarif Bodetabek tidak muncul |
| Tidak ada klaim showroom/alamat | skrip | Lulus |
| Canonical | skrip | Benar di semua halaman terindeks (404 noindex) |
| Title/description/H1 | skrip | Title ≤70, description 50-165, 1 H1 per halaman |
| JSON-LD | skrip | Semua valid JSON |
| Sitemap & robots.txt | skrip | Memuat semua halaman, tanpa 404; robots menyebut sitemap |
| Placeholder (BASE_URL, TODO) | skrip | Tidak ada |
| Responsif | Chromium 390px dan 1366px, 8 halaman | Tidak ada scroll horizontal; menu HP dan lightbox berfungsi |
| Error konsol / permintaan gagal / HTTP ≥400 | Chromium | 0 |
| Foto baru tak terdaftar | tes manual | Tampil otomatis; nama salah ketik di galeri.json hanya peringatan, tidak error |
| Build tanpa URL | tes | Berjalan, memberi peringatan |
| Unggah foto baru ke folder tipe (tanpa daftar) | tes manual | Tampil otomatis hanya di tipe folder itu dan di Semua |
| Margin kiri-kanan di HP | screenshot 390 px | Ditemukan kurang, diperbaiki |

Total: **2.455 pemeriksaan otomatis lulus, 0 gagal** (42 halaman, 20 foto galeri dalam 3 tipe).

## BELUM diuji
- Workflow `buka-zip.yml` (pembuka ZIP otomatis di GitHub): sudah divalidasi sintaks YAML saja, belum dijalankan di GitHub.
- Build di Netlify sebenarnya, dan situs online.
- Lighthouse / Core Web Vitals / PageSpeed.
- Browser selain Chromium (Firefox, Safari), perangkat Android fisik, dan klik WhatsApp di aplikasi WhatsApp sungguhan.
- Pencocokan harga terhadap PDF Sharp Point asli (PDF tidak tersedia).
- Validasi Rich Results Google.
