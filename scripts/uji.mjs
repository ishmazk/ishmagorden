// Pengujian otomatis. Jalankan: node build.mjs && node scripts/uji.mjs
import fs from 'node:fs'; import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DIST = path.join(ROOT, 'dist');
let fail = 0, ok = 0; const out = [];
const t = (name, cond, detail = '') => { if (cond) { ok++; } else { fail++; out.push(`GAGAL: ${name} ${detail}`); } };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(DIST); const htmls = files.filter((f) => f.endsWith('.html'));
const rel = (f) => '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
const resolveUrl = (u) => { let p = u.split('#')[0].split('?')[0]; if (!p) return true; if (p.endsWith('/')) p += 'index.html'; return fs.existsSync(path.join(DIST, p)); };
const WA = '6282331219722';
const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const baseMatch = locs[0] && locs[0].match(/^(https?:\/\/[^/]+)\//); const BASE = baseMatch ? baseMatch[1] : '';
// ambil harga asli
const asli = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/arsip/sharp-point-catalog.ASLI-dari-ZIP.json'), 'utf8'));
const asliHarga = new Set([...asli.curtain_fabrics.map((r) => r.price), ...asli.curtain_motors_and_tracks.map((r) => r.price)]);
const biayaAsli = asli.sewing_and_installation_notes.map((r) => r.price);
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/harga-sharp-point.json'), 'utf8')).harga;
// 1. data harga == asli
const asliList = [...asli.curtain_fabrics.map((r) => ['kain', r.name, r.variant, r.price]), ...asli.curtain_motors_and_tracks.map((r) => ['motor', r.name, '', r.price]), ...asli.sewing_and_installation_notes.map((r) => ['biaya', r.name, '', r.price])];
t('jumlah baris harga sama dengan ZIP asli', src.length === asliList.length, `${src.length} vs ${asliList.length}`);
for (const [k, n, v, p] of asliList) { const r = src.find((x) => x.nama === n && (x.varian || '') === v && x.kelompok === (k === 'motor' ? 'motorized' : k)); t(`harga ${n} ${v} identik dengan sumber asli`, r && r.harga === p, r ? `${r.harga} != ${p}` : 'baris tidak ada'); }
for (const r of src) t(`baris ${r.id} punya halaman sumber`, r.hal_cetak && r.hal_pdf);
// 2. semua halaman
const expected = ['/', '/katalog/', '/katalog/daftar-harga/', '/galeri/', '/artikel/', '/layanan/', '/tentang/', '/faq/', '/kontak/', '/kebijakan-privasi/'];
for (const e of expected) t(`halaman ${e} ada`, htmls.some((f) => rel(f) === e));
const hargaTerlihat = [];
let waCount = 0;
for (const f of htmls) {
  const u = rel(f); const h = fs.readFileSync(f, 'utf8'); const is404 = u === '/404.html';
  t(`${u} satu H1`, (h.match(/<h1[ >]/g) || []).length === 1);
  const title = ((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/&amp;/g, '&'); const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  t(`${u} title ada`, title.length > 10); t(`${u} title <= 70 karakter`, title.length <= 70, `(${title.length}) ${title}`);
  t(`${u} description 50-165 karakter`, desc.length >= 50 && desc.length <= 165, `(${desc.length})`);
  if (!is404) { const c = (h.match(/<link rel="canonical" href="([^"]*)"/) || [])[1]; t(`${u} canonical benar`, c === BASE + u, `${c}`); }
  t(`${u} lang id & viewport`, /<html lang="id">/.test(h) && /name="viewport"/.test(h));
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); ok++; } catch (e) { fail++; out.push(`GAGAL: JSON-LD tidak valid di ${u}`); } }
  for (const m of h.matchAll(/<img [^>]*>/g)) { t(`${u} img punya alt`, /alt="[^"]+"/.test(m[0]) , m[0].slice(0, 80)); }
  for (const m of h.matchAll(/(?:href|src|srcset)="(\/[^"]*)"/g)) { const link = m[1]; if (link.startsWith('//')) continue; t(`${u} tautan ${link} ada`, resolveUrl(link)); }
  for (const m of h.matchAll(/href="(https:\/\/wa\.me\/[^"]*)"/g)) { waCount++; const x = new URL(m[1].replace(/&amp;/g, '&')); t(`${u} nomor WA benar`, x.pathname === '/' + WA); const text = x.searchParams.get('text'); t(`${u} WA punya pesan`, text && text.length > 10); }
  for (const m of h.matchAll(/<a [^>]*href="(?!https?:|\/|#|mailto:)([^"]*)"/g)) t(`${u} tautan relatif tak terduga ${m[1]}`, false);
  // anchor internal
  for (const m of h.matchAll(/href="(\/[^"#]*)#([^"]+)"/g)) { const target = path.join(DIST, m[1] === '/' ? '' : m[1], m[1].endsWith('/') || m[1] === '/' ? 'index.html' : ''); if (fs.existsSync(target)) t(`${u} anchor #${m[2]} ada di ${m[1]}`, new RegExp(`id="${m[2]}"`).test(fs.readFileSync(target, 'utf8'))); }
  for (const m of h.matchAll(/Rp\.? ?[\d.]+/g)) hargaTerlihat.push([u, m[0]]);
}
// 3. harga yang tampil harus ada di sumber asli
for (const [u, p] of hargaTerlihat) { const ok1 = asliHarga.has(p) || biayaAsli.some((b) => b.startsWith(p)) || asli.terms.some((x) => x.includes(p)); t(`harga ${p} di ${u} ada di sumber asli`, ok1); }
const all = htmls.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
t('harga yang ditandai perlu-cek tidak tampil', !all.includes('14.000.000'));
t('tarif Bodetabek tidak tampil', !/Bodetabek/.test(all));
t('tidak ada klaim showroom/toko fisik', !/(kunjungi|datang ke) (showroom|toko)/i.test(all));
const siteJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
const kontakH = fs.readFileSync(path.join(DIST, 'kontak/index.html'), 'utf8'), homeH = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (siteJ.tampilkanAlamat) { t('alamat tampil di Kontak', kontakH.includes('Genteng Wetan')); t('alamat tampil di footer', homeH.includes('Genteng Wetan')); t('tautan Google Maps ada', kontakH.includes(siteJ.gmapsUrl)); t('schema memuat PostalAddress', homeH.includes('PostalAddress')); }
else t('tidak ada alamat tampil (saklar mati)', !/Jl\./.test(all));
t('tidak ada placeholder BASE_URL / TODO', !/BASE_URL|NAMA-SITUS|TODO|lorem ipsum/i.test(all));
// semua harga di sumber (status tampil) benar-benar muncul di situs
for (const r of src.filter((x) => ['transkripsi-sebelumnya', 'terverifikasi'].includes(x.status))) { const p = r.harga.replace(/\/.*$/, ''); t(`harga ${r.nama} tampil di situs`, all.includes(r.harga.replace(/\s*\/.*/, '')) || all.includes(r.harga)); }
// 4. sitemap & robots
t('sitemap berisi semua halaman terindeks', htmls.filter((f) => rel(f) !== '/404.html').every((f) => locs.includes(BASE + rel(f))));
t('sitemap tidak berisi 404', !locs.some((l) => l.includes('404')));
t('sitemap XML bentuk benar', /^<\?xml/.test(sitemap) && sitemap.trim().endsWith('</urlset>'));
const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8'); t('robots.txt menyebut sitemap', robots.includes(`Sitemap: ${BASE}/sitemap.xml`)); t('robots.txt tidak memblokir semua', !/Disallow:\s*\/\s*$/m.test(robots));
// 5. gambar tidak 0 byte & ukuran
for (const f of files.filter((x) => /\.(jpe?g|png|webp)$/i.test(x))) t(`gambar ${path.relative(DIST, f)} valid`, fs.statSync(f).size > 500);
const cssBytes = fs.statSync(files.find((f) => f.endsWith('style.css'))).size, jsBytes = fs.statSync(files.find((f) => f.endsWith('site.js'))).size;
console.log(`CSS ${cssBytes} B, JS ${jsBytes} B, halaman HTML ${htmls.length}, tombol/tautan WhatsApp diperiksa ${waCount}, harga tampil diperiksa ${hargaTerlihat.length}`);
console.log(out.join('\n') || 'Tidak ada kegagalan.');
console.log(`\nHASIL: ${ok} lulus, ${fail} gagal`);
process.exit(fail ? 1 : 0);
