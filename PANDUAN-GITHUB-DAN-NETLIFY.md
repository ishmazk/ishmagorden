# Panduan Menaruh Website di GitHub dan Netlify (dari HP)

Ada **2 cara**. Cara 1 paling mudah untuk HP: cukup unggah **satu file ZIP**, GitHub yang membukanya sendiri.

> Cara 1 memakai fitur GitHub Actions gratis. Saya tidak bisa mengujinya langsung di akun GitHub Anda; jika ada langkah yang tidak cocok dengan tampilan GitHub Anda, pakai Cara 2.

---
## CARA 1 — Satu file ZIP (disarankan, cukup HP)

Anda butuh 2 file dari saya: **`paket-website.zip`** dan **`buka-zip.yml`** (simpan di HP).

### Langkah 1. Buat repository
1. Buka **github.com** di Chrome HP, login (atau daftar gratis).
2. Ketuk **+** (kanan atas) → **New repository**.
3. Repository name: `ishma-gorden-website`. Pilih **Public** (atau Private).
4. Jangan centang apa pun. Ketuk **Create repository**.

### Langkah 2. Unggah ZIP
1. Di halaman repository kosong, ketuk tautan **uploading an existing file**.
2. Ketuk **choose your files** → pilih **`paket-website.zip`**. **Jangan diekstrak.**
3. Tunggu sampai file muncul, gulir ke bawah, ketuk **Commit changes**.

### Langkah 3. Buat "pembuka ZIP" (hanya sekali seumur hidup)
1. Di halaman repository ketuk **Add file** → **Create new file**.
2. Di kolom nama, ketik persis: `.github/workflows/buka-zip.yml`
   (setelah mengetik `/` GitHub otomatis membuat folder).
3. Buka file **`buka-zip.yml`** di HP, salin seluruh isinya, tempel ke kotak isi.
4. Ketuk **Commit changes** → **Commit changes**.

### Langkah 4. Tunggu website terbuka otomatis
1. Ketuk tab **Actions**. Jika ada tombol hijau **"I understand my workflows, go ahead and enable them"**, ketuk.
2. Akan ada proses **Buka paket ZIP** (kuning berputar → hijau ✓, sekitar 1 menit). Jika sudah hijau, kembali ke tab **Code**: semua folder (`assets`, `data`, `konten`, dll.) sudah ada dan `paket-website.zip` sudah hilang.
3. Jika prosesnya tidak berjalan sendiri: Actions → **Buka paket ZIP** → **Run workflow** → **Run workflow**.
4. Jika gagal (merah ✗): ketuk prosesnya, baca pesan, atau pakai Cara 2.

### Langkah 5. Hubungkan ke Netlify (gratis)
1. Buka **app.netlify.com**, ketuk **Log in with GitHub**.
2. **Add new project** → **Import an existing project** → **GitHub** → izinkan akses → pilih `ishma-gorden-website`.
3. Pengaturan terisi otomatis dari file `netlify.toml` (Build command `node build.mjs`, Publish directory `dist`). Biarkan.
4. Ketuk **Deploy**. Tunggu status **Published** (hijau, 1-2 menit).
5. Ketuk alamat situs (misal `nama-acak.netlify.app`). Ganti nama: **Site configuration** → **Change site name** (contoh `ishmagorden`).

Selesai. Canonical, sitemap, dan robots.txt terisi otomatis sesuai alamat situs.

---
## CARA 2 — Lewat komputer/laptop (jika Cara 1 bermasalah)
1. Ekstrak `paket-website.zip` di komputer (hasilnya folder berisi `build.mjs`, `assets`, `data`, ...).
2. Di github.com, buat repository (Langkah 1 di atas) → **uploading an existing file**.
3. Buka folder hasil ekstrak, **seleksi semua isi folder** (bukan foldernya), seret ke halaman GitHub. Tunggu semua terunggah → **Commit changes**.
4. Lanjut ke **Langkah 5** (Netlify).

> Upload per folder dari HP tanpa ZIP bisa dilakukan, tetapi harus per folder (±18 folder). Tidak disarankan.

---
## Setelah tayang
1. Buka semua halaman di HP, coba tombol WhatsApp, foto, dan Galeri.
2. Daftarkan di **Google Search Console** → tambahkan situs → kirim `https://ALAMAT-ANDA/sitemap.xml`. Waktu Google mengindeks tidak bisa dijamin.
3. Jika nanti memakai domain sendiri: isi `siteUrl` di `data/site.json` (contoh `"https://www.contoh.com"`).
4. Setiap perubahan: edit/unggah di GitHub → **Commit changes** → Netlify memperbarui otomatis dalam 1-2 menit.

## Jika build Netlify gagal (merah)
Deploys → klik yang merah → baca pesan. Penyebab paling umum: salah koma/kutip di file `.json`. Kembalikan versi lama lewat **History** file di GitHub.
