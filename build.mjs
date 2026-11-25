// ISHMA Gorden - generator website statis. Tanpa dependensi (hanya Node.js bawaan).
// Dijalankan otomatis oleh Netlify: node build.mjs  -> hasil di folder dist/
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
const rj = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const warn = [];

const site = rj('data/site.json');
const produkData = rj('data/produk.json');
const hargaData = rj('data/harga-sharp-point.json');
const faq = rj('data/faq.json');
const layanan = rj('data/layanan.json');
let galeriCfg = { foto: [] };
try { galeriCfg = rj('data/galeri.json'); } catch (e) { warn.push('data/galeri.json tidak terbaca: ' + e.message); }

// ---------- URL dasar ----------
let BASE = (process.env.SITE_URL || site.siteUrl || process.env.URL || '').replace(/\/+$/, '');
if (!BASE) warn.push('URL situs tidak diketahui: canonical dan sitemap memakai alamat relatif. Di Netlify ini terisi otomatis.');
const abs = (p) => (BASE ? BASE + p : p);
const TODAY = new Date().toISOString().slice(0, 10);

// ---------- helper aset ----------
const hashCache = new Map();
function hashOf(rel) {
  if (!hashCache.has(rel)) {
    try { hashCache.set(rel, crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex').slice(0, 8)); }
    catch { hashCache.set(rel, 'x'); }
  }
  return hashCache.get(rel);
}
const A = (rel) => `/${rel}?v=${hashOf(rel)}`; // rel mis. assets/css/style.css
const IMG_RE = /\.(jpe?g|png|webp)$/i;
function listImages(dir) {
  const d = path.join(ROOT, dir);
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((f) => IMG_RE.test(f) && !f.startsWith('.')).sort();
}
// <picture> dengan WebP otomatis bila ada salinan di _dioptimasi
function picture(relUnderImages, alt, { eager = false, cls = '' } = {}) {
  const full = `assets/images/${relUnderImages}`;
  if (!exists(full)) { warn.push('Gambar tidak ditemukan: ' + full); return ''; }
  const webpRel = `assets/images/_dioptimasi/${relUnderImages.replace(/\.[^.]+$/, '')}.webp`;
  const load = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  const c = cls ? ` class="${cls}"` : '';
  const img = `<img src="${A(full)}" alt="${esc(alt)}" ${load}${c}>`;
  if (exists(webpRel) && !/\.webp$/i.test(full)) return `<picture><source srcset="${A(webpRel)}" type="image/webp">${img}</picture>`;
  return img;
}
const wa = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
const waBtn = (text, label = 'Tanya via WhatsApp', cls = 'btn btn-wa') => `<a class="${cls}" href="${wa(text)}" rel="noopener">${esc(label)}</a>`;

// ---------- data harga ----------
const TAMPIL = new Set(['terverifikasi', 'transkripsi-sebelumnya']);
const hargaTampil = hargaData.harga.filter((r) => TAMPIL.has(r.status));
const hargaBy = (kode) => hargaTampil.filter((r) => r.produk === kode);
const ket = hargaData.ketentuan;
const biayaJahit = hargaTampil.filter((r) => r.produk === 'biaya-jahit');
const biayaMotor = hargaTampil.filter((r) => r.produk === 'motorized-pemasangan');
const halSumber = (rows) => [...new Set(rows.map((r) => r.hal_cetak))].sort((a, b) => a - b).join(', ');

// ---------- galeri otomatis (per tipe: standart / premium / deluxe) ----------
let tipeCfg = [{ slug: 'standart', nama: 'Standart', deskripsi: '' }, { slug: 'premium', nama: 'Premium', deskripsi: '' }, { slug: 'deluxe', nama: 'Deluxe', deskripsi: '' }];
try { tipeCfg = rj('data/tipe-gorden.json').tipe; } catch (e) { warn.push('data/tipe-gorden.json tidak terbaca: ' + e.message); }
const TIPE = tipeCfg.map((x) => x.slug);
function buildGallery() {
  const found = []; // {file, folder}
  for (const f of listImages('assets/images/gallery')) found.push({ file: f, folder: '' });
  for (const s of TIPE) for (const f of listImages('assets/images/gallery/' + s)) found.push({ file: f, folder: s });
  const byName = new Map();
  for (const x of found) { if (byName.has(x.file)) warn.push(`Nama foto kembar "${x.file}" (folder ${x.folder || 'gallery'} dan ${byName.get(x.file).folder || 'gallery'}); yang kedua diabaikan.`); else byName.set(x.file, x); }
  const cfg = new Map((galeriCfg.foto || []).map((f) => [f.file, f]));
  for (const k of cfg.keys()) if (!byName.has(k)) warn.push(`galeri.json menyebut "${k}" tetapi file tidak ada di folder gallery (diabaikan).`);
  for (const c of cfg.values()) if (c.tipe && !TIPE.includes(c.tipe)) warn.push(`galeri.json: tipe "${c.tipe}" pada ${c.file} tidak dikenal (pakai ${TIPE.join('/')}); dipakai tipe dari folder.`);
  const ordered = [...(galeriCfg.foto || []).map((f) => f.file).filter((f) => byName.has(f)), ...[...byName.keys()].filter((f) => !cfg.has(f)).sort()];
  return [...new Set(ordered)].map((f) => {
    const c = cfg.get(f) || {}; const x = byName.get(f);
    const words = f.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
    const judul = c.judul || words.charAt(0).toUpperCase() + words.slice(1);
    const alt = c.alt || `${judul} - hasil pemasangan ISHMA Gorden`;
    const tipe = TIPE.includes(c.tipe) ? c.tipe : (x.folder || '');
    return { file: f, tipe, rel: `gallery/${x.folder ? x.folder + '/' : ''}${f}`, judul, alt };
  });
}
const gallery = buildGallery();

// ---------- markdown mini ----------
function inline(s) {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => `<a href="${u.replace(/&amp;/g, '&')}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
}
function md(src) {
  const out = []; let list = null, para = [];
  const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushL = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of src.split(/\r?\n/)) {
    const l = raw.trimEnd();
    let m;
    if (!l.trim()) { flushP(); flushL(); continue; }
    if ((m = l.match(/^(#{2,3})\s+(.*)/))) { flushP(); flushL(); out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); continue; }
    if ((m = l.match(/^[-*]\s+(.*)/))) { flushP(); if (list !== 'ul') { flushL(); out.push('<ul>'); list = 'ul'; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    if ((m = l.match(/^\d+\.\s+(.*)/))) { flushP(); if (list !== 'ol') { flushL(); out.push('<ol>'); list = 'ol'; } out.push(`<li>${inline(m[1])}</li>`); continue; }
    flushL(); para.push(l.trim());
  }
  flushP(); flushL();
  return out.join('\n');
}
function loadArticles() {
  const dir = path.join(ROOT, 'konten/artikel');
  const arts = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md') && !x.startsWith('_'))) {
    const txt = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) { warn.push(`Artikel ${f} dilewati: tidak ada bagian pembuka --- ... ---`); continue; }
    const meta = {};
    for (const line of m[1].split(/\r?\n/)) { const k = line.match(/^([a-z_]+):\s*(.*)$/i); if (k) meta[k[1].toLowerCase()] = k[2].trim().replace(/^["']|["']$/g, ''); }
    if (!meta.judul) { warn.push(`Artikel ${f} dilewati: baris "judul:" kosong.`); continue; }
    if (/^(false|tidak|draft)$/i.test(meta.tayang || '')) continue;
    arts.push({ slug: f.replace(/\.md$/, ''), meta, html: md(m[2]) });
  }
  return arts.sort((a, b) => String(b.meta.tanggal || '').localeCompare(String(a.meta.tanggal || '')));
}
const articles = loadArticles();

// ---------- layout ----------
const pages = []; // {url, title, desc, noindex}
const NAV = [['/', 'Beranda'], ['/katalog/', 'Katalog'], ['/galeri/', 'Galeri'], ['/layanan/', 'Layanan'], ['/artikel/', 'Artikel'], ['/tentang/', 'Tentang']];
const heroFile = (() => { const l = listImages('assets/images/hero'); return l.find((f) => /^hero-beranda/i.test(f)) || l[0] || null; })();
const ldOrg = () => {
  const sameAs = [`https://www.instagram.com/${site.instagram}/`, `https://www.tiktok.com/@${site.tiktok}`];
  if (site.facebookUrl) sameAs.push(site.facebookUrl);
  const jam = (site.jamBuka || []).map((j) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: j.days, opens: j.dari, closes: j.sampai }));
  const biz = {
    '@type': 'LocalBusiness', '@id': abs('/#bisnis'), name: site.nama, url: abs('/'), telephone: '+' + site.whatsapp,
    image: abs(A(`assets/images/hero/${heroFile || ''}`).split('?')[0]), logo: abs('/assets/images/logo/logo-ishma-gorden.png'),
    parentOrganization: { '@type': 'Organization', name: site.perusahaanInduk, slogan: site.tagline },
    description: 'Penjualan dan konsultasi gorden, vitrase, blinds, rel, dan gorden motorized secara online melalui WhatsApp untuk Banyuwangi dan sekitarnya.',
    areaServed: site.wilayah.map((n) => ({ '@type': 'AdministrativeArea', name: n + ', Banyuwangi' })), sameAs,
    openingHoursSpecification: jam, contactPoint: { '@type': 'ContactPoint', telephone: '+' + site.whatsapp, contactType: 'customer service', availableLanguage: 'id' }
  };
  if (site.tampilkanAlamat && site.alamat) { biz.address = { '@type': 'PostalAddress', streetAddress: site.alamat, addressLocality: 'Genteng', addressRegion: 'Jawa Timur', addressCountry: 'ID' }; if (site.gmapsUrl) biz.hasMap = site.gmapsUrl; }
  return biz;
};
const ldSite = () => ({ '@type': 'WebSite', '@id': abs('/#web'), url: abs('/'), name: site.nama, inLanguage: 'id-ID', publisher: { '@id': abs('/#bisnis') } });
const ldCrumb = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: abs(it[1]) })) });
const crumbHtml = (items) => `<nav class="crumb" aria-label="Breadcrumb">${items.map((it, i) => (i < items.length - 1 ? `<a href="${it[1]}">${esc(it[0])}</a><span>›</span>` : `<span aria-current="page" style="margin:0">${esc(it[0])}</span>`)).join('')}</nav>`;

function layout({ url, title, desc, body, ld = [], crumbs = null, ogImage = null, noindex = false, preload = '', type = 'website' }) {
  const graph = [...ld];
  if (url === '/') graph.unshift(ldOrg(), ldSite());
  if (crumbs) graph.push(ldCrumb(crumbs));
  const og = ogImage || (heroFile ? abs(`/assets/images/hero/${heroFile}`) : '');
  const nav = NAV.map(([h, t]) => `<a href="${h}"${url === h || (h !== '/' && url.startsWith(h)) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex,follow">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
${noindex ? '' : `<link rel="canonical" href="${abs(url)}">`}
<meta property="og:locale" content="id_ID"><meta property="og:type" content="${type}"><meta property="og:site_name" content="${esc(site.nama)}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${abs(url)}">
${og ? `<meta property="og:image" content="${og}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#2b2019">
<link rel="icon" href="${A('assets/images/logo/favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${A('assets/images/logo/logo-ishma-gorden.png')}">
${preload}
<link rel="stylesheet" href="${A('assets/css/style.css')}">
<script defer src="${A('assets/js/site.js')}"></script>
${graph.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>` : ''}
</head>
<body>
<a class="skip" href="#isi">Lewati ke isi</a>
<header class="site-header"><div class="wrap">
<a class="brand" href="/" aria-label="${esc(site.nama)} - Beranda"><img src="${A('assets/images/logo/logo-ishma-gorden-256.webp')}" width="46" height="46" alt="Logo ISHMA Gorden"><span><b>ISHMA</b><small>GORDEN BANYUWANGI</small></span></a>
<button class="menu-toggle" type="button" aria-label="Buka menu" aria-expanded="false" aria-controls="nav">☰</button>
<nav class="nav" id="nav" aria-label="Menu utama">${nav}<a class="nav-cta" href="/kontak/">Hubungi Kami</a></nav>
</div></header>
<main id="isi">
${body}
</main>
<footer class="footer"><div class="wrap">
<div class="cols">
<div><b>${esc(site.nama)}</b><p>Bagian dari ${esc(site.perusahaanInduk)}<br>${esc(site.tagline)}</p><p>Unit usaha: ${site.unitUsaha.map((u) => esc(u.nama)).join(' · ')}</p>${site.tampilkanAlamat && site.alamat ? `<p>${esc(site.alamat)}</p>${site.gmapsUrl ? `<p><a href="${esc(site.gmapsUrl)}" rel="noopener">Lihat di Google Maps →</a></p>` : ''}${jamHtml()}` : ''}</div>
<div><b>Jelajahi</b><a href="/katalog/">Katalog Produk</a><a href="/katalog/daftar-harga/">Daftar Harga</a><a href="/galeri/">Galeri Pemasangan</a><a href="/layanan/">Layanan</a><a href="/artikel/">Artikel</a></div>
<div><b>Informasi</b><a href="/tentang/">Tentang Kami</a><a href="/faq/">Pertanyaan Umum</a><a href="/kontak/">Kontak</a><a href="/kebijakan-privasi/">Kebijakan Privasi</a></div>
<div><b>Hubungi</b><a href="${wa('Halo ISHMA Gorden, saya ingin konsultasi.')}" rel="noopener">WhatsApp ${esc(site.whatsappTampil)}</a><a href="https://www.instagram.com/${site.instagram}/" rel="noopener me">Instagram @${esc(site.instagram)}</a><a href="https://www.tiktok.com/@${site.tiktok}" rel="noopener me">TikTok @${esc(site.tiktok)}</a>${site.facebookUrl ? `<a href="${esc(site.facebookUrl)}" rel="noopener me">Facebook ${esc(site.facebookNama)}</a>` : `<p>Facebook: ${esc(site.facebookNama)}</p>`}</div>
</div>
<p class="copy">© ${new Date().getFullYear()} ${esc(site.perusahaanInduk)} · ${esc(site.nama)}. Harga produk Sharp Point mengikuti katalog; ketersediaan dikonfirmasi melalui WhatsApp.</p>
</div></footer>
<a class="fab" href="${wa(`Halo ISHMA Gorden, saya sedang melihat halaman ${title.split('|')[0].trim()} dan ingin bertanya.`)}" rel="noopener" aria-label="Chat WhatsApp ISHMA Gorden"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-5 4V4a1 1 0 0 1 1-1z"/></svg><span>WhatsApp</span></a>
</body>
</html>`;
  pages.push({ url, title, desc, noindex });
  const outPath = url === '/404.html' ? path.join(DIST, '404.html') : path.join(DIST, url, 'index.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
}

// ---------- potongan umum ----------
const phImg = (relOrEmpty, alt, label) => (relOrEmpty && exists('assets/images/' + relOrEmpty) ? picture(relOrEmpty, alt) : `<div class="noimg">${esc(label)}<br><small>(foto menyusul)</small></div>`);
const pageHero = (crumbs, eyebrow, h1, p) => `<section class="page-hero"><div class="wrap">${crumbHtml(crumbs)}<p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(h1)}</h1><p>${esc(p)}</p></div></section>`;
const ctaBand = (eyebrow, h, p, text, label = 'Tanya melalui WhatsApp') => `<section class="cta"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(h)}</h2><p>${esc(p)}</p>${waBtn(text, label)}</section>`;
const jamHtml = () => (site.jamBuka && site.jamBuka.length ? `<ul class="jam">${site.jamBuka.map((j) => `<li><strong>${esc(j.hari)}</strong>: ${esc(j.jam)}</li>`).join('')}</ul>${site.jamOnline ? `<p class="micro">Layanan online (WhatsApp): ${esc(site.jamOnline)}.</p>` : ''}` : '');
const NO_SHOWROOM = 'ISHMA Gorden melayani penjualan dan konsultasi melalui WhatsApp dan media sosial' + (site.tampilkanAlamat && site.alamat ? ', serta dapat dikunjungi di alamat pada halaman Kontak.' : '.');

function priceTable(rows, mode) {
  if (!rows.length) return '';
  if (mode === 'kain') {
    return `<div class="tw"><table><thead><tr><th>Koleksi</th><th>Varian</th><th>Lebar kain</th><th>Harga</th></tr></thead><tbody>${rows.map((r) => `<tr data-row="${esc((r.nama + ' ' + r.varian).toLowerCase())}"><td>${esc(r.nama)}</td><td>${esc(r.varian)}</td><td>${esc(r.lebar)}</td><td class="pr">${esc(r.harga)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  if (mode === 'biaya') {
    return `<div class="tw"><table><thead><tr><th>Biaya</th><th>Harga</th></tr></thead><tbody>${rows.map((r) => `<tr data-row="${esc(r.nama.toLowerCase())}"><td>${esc(r.nama)}</td><td class="pr">${esc(r.harga)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  return `<div class="tw"><table><thead><tr><th>Jenis</th><th>Nama</th><th>Harga</th><th>Satuan</th></tr></thead><tbody>${rows.map((r) => `<tr data-row="${esc((r.jenis + ' ' + r.nama + ' ' + (r.merek || '')).toLowerCase())}"><td>${esc(r.jenis)}</td><td>${esc(r.nama)}</td><td class="pr">${esc(r.harga)}</td><td>${esc(r.satuan)}</td></tr>`).join('')}</tbody></table></div>`;
}
const srcNote = (rows) => (rows.length ? `<p class="src">Sumber: Katalog Sharp Point Price List 2025, halaman cetak ${halSumber(rows)}. Harga disalin tanpa perubahan.</p>` : '');
const priceNotice = '<div class="notice"><strong>Catatan harga.</strong> Harga mengikuti katalog Sharp Point apa adanya. Ketersediaan varian, ongkos kirim, dan biaya tambahan dikonfirmasi melalui WhatsApp. Produk yang tidak tercantum di tabel belum ditampilkan harganya; silakan tanyakan langsung.</div>';

// ---------- BERANDA ----------
function pageHome() {
  const cats = produkData.kategori.map((k) => {
    const n = produkData.produk.filter((p) => p.kategori === k.slug).length;
    return `<a class="card" href="/katalog/#${k.slug}"><div class="ph">${phImg(k.foto, k.alt, k.nama)}</div><div class="tx"><h3>${esc(k.nama)}</h3><p>${esc(k.deskripsi)}</p></div></a>`;
  }).join('');
  const homeGal = [...TIPE.flatMap((s) => gallery.filter((g) => g.tipe === s).slice(0, 2)), ...gallery].filter((g, i, a) => a.indexOf(g) === i).slice(0, 6);
  const gal = homeGal.map((g) => `<figure><a href="${A('assets/images/' + g.rel)}" data-lb data-alt="${esc(g.alt)}" data-cap="${esc(g.judul)}">${picture(g.rel, g.alt)}</a><figcaption>${esc(g.judul)}</figcaption></figure>`).join('');
  const arts = articles.slice(0, 3).map(artCard).join('');
  const hero = heroFile ? picture('hero/' + heroFile, 'Gorden dan vitrase hasil pemasangan ISHMA Gorden pada ruang keluarga yang luas', { eager: true }) : '';
  const heroWebp = heroFile && exists(`assets/images/_dioptimasi/hero/${heroFile.replace(/\.[^.]+$/, '')}.webp`) ? `<link rel="preload" as="image" href="${A(`assets/images/_dioptimasi/hero/${heroFile.replace(/\.[^.]+$/, '')}.webp`)}" type="image/webp">` : '';
  const body = `
<section class="hero"><div class="wrap">
<div class="hero-copy"><p class="eyebrow">Gorden Banyuwangi · ISHMA Gorden</p>
<h1>Gorden yang membuat rumah terasa lebih istimewa.</h1>
<p class="lead">Pilihan gorden custom, vitrase, blinds, rel, dan gorden motorized untuk rumah, hotel, villa, dan kantor di Banyuwangi dan sekitarnya. Konsultasi dan pemesanan melalui WhatsApp.</p>
<div class="actions">${waBtn('Halo ISHMA Gorden, saya ingin konsultasi pilihan gorden untuk rumah saya.', 'Konsultasi via WhatsApp')}<a class="btn btn-line" href="/katalog/">Lihat Katalog</a></div>
<p class="micro">Penjualan online · Instagram &amp; TikTok @${esc(site.instagram)}</p></div>
<div class="hero-img">${hero}</div>
</div></section>
<div class="trust wrap" style="max-width:var(--w)"><div>Konsultasi langsung via WhatsApp</div><div>Harga mengikuti katalog Sharp Point</div><div>Foto asli hasil pemasangan</div></div>

<section class="s"><div class="wrap">
<div class="head"><div><p class="eyebrow">Katalog</p><h2>Temukan yang sesuai dengan ruang Anda.</h2></div><a class="tlink" href="/katalog/">Lihat semua produk →</a></div>
<div class="grid g3">${cats}</div></div></section>

<section class="s soft"><div class="wrap">
<div class="head"><div><p class="eyebrow">Galeri</p><h2>Inspirasi dari hasil pemasangan.</h2><p>Foto-foto dokumentasi pemasangan gorden dan vitrase ISHMA. Gunakan sebagai gambaran saat berkonsultasi.</p></div><a class="tlink" href="/galeri/">Lihat galeri lengkap →</a></div>
<div class="gal g-home">${gal}</div></div></section>

<section class="s"><div class="wrap split">
<div><p class="eyebrow">Cara kerja</p><h2>Dari ide sampai gorden terpasang, dibantu lewat WhatsApp.</h2><p class="lead" style="font-size:16px">Setiap ruangan punya kebutuhan berbeda. Kami membantu Anda mempertimbangkan fungsi, cahaya, privasi, ukuran jendela, dan gaya interior sebelum memilih.</p><p><a class="tlink" href="/artikel/cara-memilih-gorden-ruang-tamu/">Baca panduan memilih gorden →</a></p></div>
<div class="steps">
<div><b>01</b><div><h3>Ceritakan kebutuhan</h3><p>Kirim foto ruangan, ukuran jendela, dan gaya yang Anda sukai.</p></div></div>
<div><b>02</b><div><h3>Pilih produk</h3><p>Kami bantu arahkan bahan, warna, dan model dari katalog.</p></div></div>
<div><b>03</b><div><h3>Atur pesanan</h3><p>Harga, pengiriman, dan pemasangan dikonfirmasi sesuai lokasi dan kesepakatan.</p></div></div>
</div></div></section>

<section class="s soft"><div class="wrap">
<div class="head"><div><p class="eyebrow">Wilayah</p><h2>Melayani konsultasi untuk Banyuwangi dan sekitarnya.</h2><p>Kami menerima konsultasi dari berbagai kecamatan di Banyuwangi, juga dari warga Banyuwangi yang berada di luar kota atau luar negeri. Layanan pengukuran dan pemasangan dikonfirmasi per lokasi.</p></div></div>
<ul class="chips">${site.wilayah.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div></section>

${arts ? `<section class="s"><div class="wrap"><div class="head"><div><p class="eyebrow">Artikel</p><h2>Panduan sebelum Anda memilih.</h2></div><a class="tlink" href="/artikel/">Semua artikel →</a></div><div class="grid g3">${arts}</div></div></section>` : ''}

<section class="s soft"><div class="wrap prose" style="max-width:860px">
<div class="head"><div><p class="eyebrow">FAQ</p><h2>Pertanyaan yang sering diajukan.</h2></div><a class="tlink" href="/faq/">Lihat semua →</a></div>
${faq.slice(0, 4).map((f) => `<details><summary>${esc(f.t)}</summary><p>${esc(f.j)}</p></details>`).join('')}
</div></section>
${ctaBand('Mulai dari kebutuhan ruang Anda', 'Masih bingung menentukan model gorden?', 'Ceritakan kebutuhan dan ukuran jendela Anda. Kami bantu arahkan pilihan yang relevan.', 'Halo ISHMA Gorden, saya ingin dibantu memilih gorden.')}`;
  layout({
    url: '/', title: 'ISHMA Gorden Banyuwangi | Jual Gorden Custom, Vitrase & Blinds',
    desc: 'Jual gorden Banyuwangi: gorden custom, vitrase, blinds, rel, dan gorden motorized. Lihat katalog dan galeri pemasangan, konsultasi cepat via WhatsApp.',
    body, preload: heroWebp
  });
}
function artCard(a) {
  const img = a.meta.gambar && exists('assets/images/' + a.meta.gambar) ? picture(a.meta.gambar, a.meta.judul) : `<div class="noimg">${esc(a.meta.kategori || 'Artikel')}</div>`;
  return `<a class="card art" href="/artikel/${a.slug}/"><div class="ph">${img}</div><div class="tx"><span class="tag">${esc(a.meta.kategori || 'Artikel')}</span><h3>${esc(a.meta.judul)}</h3><p>${esc(a.meta.deskripsi || '')}</p></div></a>`;
}

// ---------- KATALOG ----------
function prodCard(p) {
  const rows = p.harga ? hargaBy(p.harga) : [];
  const note = rows.length ? 'Harga katalog tersedia' : 'Konsultasi via WhatsApp';
  return `<a class="card" href="/produk/${p.slug}/"><div class="ph">${phImg(p.foto, p.alt || p.nama, p.nama)}</div><div class="tx"><span class="tag">${note}</span><h3>${esc(p.nama)}</h3><p>${esc(p.deskripsi.length > 130 ? p.deskripsi.slice(0, 127).replace(/\s+\S*$/, '') + '…' : p.deskripsi)}</p></div></a>`;
}
function pageKatalog() {
  const secs = produkData.kategori.map((k) => {
    const ps = produkData.produk.filter((p) => p.kategori === k.slug);
    if (!ps.length) return '';
    return `<section id="${k.slug}" style="margin-bottom:56px"><div class="head"><div><h2>${esc(k.nama)}</h2><p>${esc(k.deskripsi)}</p></div></div><div class="grid g3">${ps.map(prodCard).join('')}</div></section>`;
  }).join('');
  const crumbs = [['Beranda', '/'], ['Katalog', '/katalog/']];
  const body = `${pageHero(crumbs, 'Katalog produk', 'Katalog gorden, vitrase, blinds, dan rel.', 'Produk mengikuti katalog Sharp Point. Harga yang sudah tercantum disalin tanpa perubahan; produk lain dapat ditanyakan melalui WhatsApp.')}
<div class="wrap main">${priceNotice}<p><a class="btn btn-line btn-sm" href="/katalog/daftar-harga/">Lihat semua daftar harga →</a></p><br>${secs}</div>
${ctaBand('Tidak menemukan yang dicari?', 'Tanyakan produk yang Anda inginkan.', 'Kirim foto atau gambaran model gorden yang Anda cari.', 'Halo ISHMA Gorden, saya ingin menanyakan produk yang belum ada di katalog website.')}`;
  layout({ url: '/katalog/', title: 'Katalog Gorden, Vitrase & Blinds Banyuwangi | ISHMA Gorden', desc: 'Katalog produk ISHMA Gorden Banyuwangi: gorden kain, vitrase, window blinds, rel, dan gorden motorized. Konsultasi dan tanya harga via WhatsApp.', body, crumbs });
}
function pageDaftarHarga() {
  const kain = hargaTampil.filter((r) => r.kelompok === 'kain');
  const brands = ['somfy', 'raex', 'novo', 'stage'];
  const crumbs = [['Beranda', '/'], ['Katalog', '/katalog/'], ['Daftar Harga', '/katalog/daftar-harga/']];
  const mot = brands.map((b) => {
    const rows = hargaBy('motorized-' + b);
    return `<div data-grp><h3>${esc(b[0].toUpperCase() + b.slice(1))}</h3>${priceTable(rows, 'motor')}</div>`;
  }).join('');
  const body = `${pageHero(crumbs, 'Daftar harga', 'Daftar harga gorden dan sistem motorized.', 'Harga disalin dari katalog Sharp Point tanpa perubahan. Bagian katalog yang belum diperiksa tidak ditampilkan harganya.')}
<div class="wrap main">${priceNotice}
<input id="finder" class="finder" type="search" placeholder="Cari koleksi atau produk (mis. Boston, Somfy)" aria-label="Cari di daftar harga">
<div data-grp><h2>Kain gorden</h2>${priceTable(kain, 'kain')}${srcNote(kain)}<p class="src">${esc(ket[0])}</p></div>
<div data-grp><h2>Biaya jahit</h2>${priceTable(biayaJahit, 'biaya')}${srcNote(biayaJahit)}<p class="src">${esc(ket[1])}</p></div>
<h2>Sistem motorized</h2>${mot}
<div data-grp><h3>Biaya pemasangan motorized</h3>${priceTable(biayaMotor, 'biaya')}${srcNote(biayaMotor)}</div>
<div class="notice"><strong>Ketentuan sistem motorized (sesuai katalog):</strong><ul>${ket.slice(2).map((k) => `<li>${esc(k)}</li>`).join('')}</ul></div>
<p>${waBtn('Halo ISHMA Gorden, saya ingin menanyakan harga dari daftar harga di website.', 'Tanya harga via WhatsApp')}</p></div>`;
  layout({ url: '/katalog/daftar-harga/', title: 'Daftar Harga Gorden & Motorized | ISHMA Gorden Banyuwangi', desc: 'Daftar harga gorden Sharp Point: kain gorden, biaya jahit, dan sistem motorized (Somfy, Raex, Novo, Stage). Harga sesuai katalog, konfirmasi via WhatsApp.', body, crumbs });
}
function pageProduk(p) {
  const kat = produkData.kategori.find((k) => k.slug === p.kategori);
  const rows = p.harga ? hargaBy(p.harga) : [];
  const crumbs = [['Beranda', '/'], ['Katalog', '/katalog/'], [kat.nama, `/katalog/#${kat.slug}`], [p.nama, `/produk/${p.slug}/`]];
  let priceHtml = '';
  if (rows.length) {
    const isKain = rows[0].kelompok === 'kain';
    const motor = ['Motor', 'Controller', 'Track'].map((j) => ({ j, r: rows.filter((x) => x.jenis === j) })).filter((x) => x.r.length);
    priceHtml = `<h2>Harga katalog</h2>` + (isKain ? priceTable(rows, 'kain') : motor.map((m) => `<h3>${esc({ Motor: 'Motor', Controller: 'Remote / kontroler', Track: 'Rel (track)' }[m.j])}</h3>${priceTable(m.r, 'motor')}`).join('')) + srcNote(rows);
    if (isKain) priceHtml += `<p class="src">${esc(ket[0])}</p>`;
    if (p.motorized) priceHtml += `<h3>Biaya pemasangan motorized</h3>${priceTable(biayaMotor, 'biaya')}${srcNote(biayaMotor)}<div class="notice"><strong>Ketentuan (sesuai katalog):</strong><ul>${ket.slice(2).map((k) => `<li>${esc(k)}</li>`).join('')}</ul></div>`;
  } else {
    priceHtml = `<div class="notice"><strong>Harga:</strong> belum ditampilkan di website. Silakan tanyakan harga dan ketersediaan terbaru melalui WhatsApp.</div>`;
  }
  if (p.biaya_jahit && biayaJahit.length) priceHtml += `<h3>Biaya jahit</h3>${priceTable(biayaJahit, 'biaya')}${srcNote(biayaJahit)}<p class="src">${esc(ket[1])}</p>`;
  const list = (t, a) => (a && a.length ? `<h3>${t}</h3><ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '');
  const rel = produkData.produk.filter((x) => x.kategori === p.kategori && x.slug !== p.slug).slice(0, 3);
  const hasFoto = !!(p.foto && exists('assets/images/' + p.foto));
  const body = `${pageHero(crumbs, kat.nama, p.nama, p.deskripsi)}
<div class="wrap main"><div class="${hasFoto ? 'pgrid' : ''}">${hasFoto ? `<div><div class="pimg">${phImg(p.foto, p.alt || p.nama, p.nama)}</div></div>` : ''}
<div class="prose">${list('Spesifikasi', p.spesifikasi)}${list('Pilihan warna', p.warna)}${list('Informasi ukuran', p.ukuran)}
<h3>Tanya atau pesan</h3><div class="actions">${waBtn(`Halo ISHMA Gorden, saya ingin menanyakan harga dan ketersediaan ${p.nama}.`, 'Tanya harga & stok')}${waBtn(`Halo ISHMA Gorden, saya ingin konsultasi pilihan warna dan model untuk ${p.nama}.`, 'Konsultasi warna', 'btn btn-line')}</div>
<p class="micro">Kirim ukuran jendela dan foto ruangan agar konsultasi lebih cepat.</p></div></div>
<div class="prose" style="max-width:none;margin-top:46px">${priceHtml}</div>
${rel.length ? `<h2 style="margin-top:56px">Produk terkait</h2><div class="grid g3">${rel.map(prodCard).join('')}</div>` : ''}</div>
${ctaBand('Konsultasi', `Tertarik dengan ${p.nama}?`, 'Kami bantu cek ketersediaan dan arahkan pilihan yang cocok untuk ruangan Anda.', `Halo ISHMA Gorden, saya tertarik dengan ${p.nama}. Mohon info lebih lanjut.`)}`;
  const ld = [{ '@type': 'Product', name: p.nama, description: p.deskripsi, category: kat.nama, brand: { '@type': 'Brand', name: 'Sharp Point' }, url: abs(`/produk/${p.slug}/`), ...(p.foto && exists('assets/images/' + p.foto) ? { image: abs('/assets/images/' + p.foto) } : {}) }];
  layout({ url: `/produk/${p.slug}/`, title: `${p.nama} - ISHMA Gorden Banyuwangi`, desc: `${p.nama}: ${p.deskripsi}`.slice(0, 158), body, ld, crumbs });
}

// ---------- GALERI ----------
const figHtml = (g) => `<figure><a href="${A('assets/images/' + g.rel)}" data-lb data-alt="${esc(g.alt)}" data-cap="${esc(g.judul)}">${picture(g.rel, g.alt)}</a><figcaption>${esc(g.judul)}</figcaption></figure>`;
function galeriTabs(aktif) {
  const tab = (href, label, n, on) => `<a class="btn ${on ? '' : 'btn-line'} btn-sm" href="${href}"${on ? ' aria-current="page"' : ''}>${esc(label)} (${n})</a>`;
  return `<div class="tabs" role="navigation" aria-label="Jenis gorden">${tab('/galeri/', 'Semua', gallery.length, aktif === '')}${tipeCfg.map((x) => tab(`/galeri/${x.slug}/`, x.nama, gallery.filter((g) => g.tipe === x.slug).length, aktif === x.slug)).join('')}</div>`;
}
function pageGaleri() {
  const crumbs = [['Beranda', '/'], ['Galeri', '/galeri/']];
  const body = `${pageHero(crumbs, 'Galeri', 'Galeri hasil pemasangan gorden.', 'Dokumentasi asli pemasangan gorden dan vitrase oleh tim ISHMA Gorden. Pilih tipe Standart, Premium, atau Deluxe, lalu ketuk foto untuk memperbesar.')}
<div class="wrap main">${galeriTabs('')}${gallery.length ? `<div class="gal">${gallery.map(figHtml).join('')}</div>` : '<p>Foto akan segera ditambahkan.</p>'}</div>
${ctaBand('Suka dengan salah satu tampilan?', 'Kirim foto yang Anda suka.', 'Kami bantu cari pilihan bahan dan model yang mendekati.', 'Halo ISHMA Gorden, saya melihat galeri di website dan ingin konsultasi model yang serupa.')}`;
  const ld = [{ '@type': 'ImageGallery', name: 'Galeri hasil pemasangan ISHMA Gorden', url: abs('/galeri/'), image: gallery.slice(0, 20).map((g) => abs('/assets/images/' + g.rel)) }];
  layout({ url: '/galeri/', title: 'Galeri Pemasangan Gorden & Vitrase | ISHMA Gorden Banyuwangi', desc: 'Lihat foto asli hasil pemasangan gorden dan vitrase ISHMA Gorden tipe Standart, Premium, dan Deluxe untuk inspirasi rumah Anda.', body, crumbs, ld });
}
function pageGaleriTipe(tp) {
  const list = gallery.filter((g) => g.tipe === tp.slug);
  const url = `/galeri/${tp.slug}/`;
  const crumbs = [['Beranda', '/'], ['Galeri', '/galeri/'], [`Gorden ${tp.nama}`, url]];
  const body = `${pageHero(crumbs, 'Galeri', `Gorden tipe ${tp.nama}.`, tp.deskripsi || `Foto hasil pemasangan gorden tipe ${tp.nama} oleh tim ISHMA Gorden.`)}
<div class="wrap main">${galeriTabs(tp.slug)}${list.length ? `<div class="gal">${list.map(figHtml).join('')}</div>` : '<p>Foto tipe ini akan segera ditambahkan.</p>'}</div>
${ctaBand(`Tertarik tipe ${tp.nama}?`, `Tanyakan gorden tipe ${tp.nama}.`, 'Kami bantu arahkan bahan dan model yang sesuai dengan ruangan Anda.', `Halo ISHMA Gorden, saya tertarik dengan gorden tipe ${tp.nama}. Mohon info lebih lanjut.`)}`;
  const ld = list.length ? [{ '@type': 'ImageGallery', name: `Galeri gorden tipe ${tp.nama} - ISHMA Gorden`, url: abs(url), image: list.slice(0, 20).map((g) => abs('/assets/images/' + g.rel)) }] : [];
  layout({ url, noindex: !list.length, title: `Gorden ${tp.nama} Banyuwangi - Galeri | ISHMA Gorden`, desc: `Foto hasil pemasangan gorden tipe ${tp.nama} oleh ISHMA Gorden Banyuwangi. Lihat model dan konsultasikan kebutuhan Anda via WhatsApp.`, body, crumbs, ld });
}

// ---------- ARTIKEL ----------
function pageArtikelIndex() {
  const crumbs = [['Beranda', '/'], ['Artikel', '/artikel/']];
  const body = `${pageHero(crumbs, 'Artikel & edukasi', 'Kenali pilihan sebelum menentukan gorden.', 'Panduan praktis memilih gorden, vitrase, blinds, dan rel sesuai fungsi dan karakter ruang.')}
<div class="wrap main"><div class="grid g3">${articles.map(artCard).join('')}</div></div>
${ctaBand('Butuh saran langsung?', 'Konsultasikan kebutuhan gorden Anda.', 'Kirim foto ruangan dan ukuran jendela melalui WhatsApp.', 'Halo ISHMA Gorden, saya sudah membaca artikel di website dan ingin konsultasi.')}`;
  layout({ url: '/artikel/', title: 'Artikel Tips Memilih Gorden | ISHMA Gorden Banyuwangi', desc: 'Artikel edukasi tentang cara memilih gorden, perbedaan blackout dan dimout, mengukur jendela, vitrase, blinds, dan perawatan gorden.', body, crumbs });
}
function pageArtikel(a) {
  const url = `/artikel/${a.slug}/`;
  const crumbs = [['Beranda', '/'], ['Artikel', '/artikel/'], [a.meta.judul, url]];
  const imgOk = a.meta.gambar && exists('assets/images/' + a.meta.gambar);
  const body = `<section class="page-hero"><div class="wrap">${crumbHtml(crumbs)}<p class="eyebrow">${esc(a.meta.kategori || 'Artikel')}</p><h1>${esc(a.meta.judul)}</h1><p>${esc(a.meta.deskripsi || '')}</p></div></section>
<div class="wrap main"><article class="prose">${imgOk ? `<div class="pimg" style="aspect-ratio:16/9;margin-bottom:30px">${picture(a.meta.gambar, a.meta.judul)}</div>` : ''}${a.html}
<div class="notice" style="margin-top:36px"><strong>Ingin dibantu memilih?</strong> Kirim ukuran dan foto ruangan Anda. Lihat juga <a href="/katalog/">katalog produk</a> dan <a href="/galeri/">galeri pemasangan</a>.</div>
<div class="actions">${waBtn(`Halo ISHMA Gorden, saya membaca artikel "${a.meta.judul}" dan ingin konsultasi.`, 'Konsultasi via WhatsApp')}</div></article></div>`;
  const ld = [{ '@type': 'Article', headline: a.meta.judul, description: a.meta.deskripsi || '', datePublished: a.meta.tanggal || TODAY, dateModified: a.meta.tanggal || TODAY, inLanguage: 'id-ID', mainEntityOfPage: abs(url), author: { '@type': 'Organization', name: site.nama }, publisher: { '@id': abs('/#bisnis') }, ...(imgOk ? { image: abs('/assets/images/' + a.meta.gambar) } : {}) }];
  layout({ url, title: `${a.meta.judul} | ISHMA Gorden`, desc: a.meta.deskripsi || a.meta.judul, body, ld, crumbs, type: 'article' });
}

// ---------- halaman lain ----------
function pageLayanan() {
  const crumbs = [['Beranda', '/'], ['Layanan', '/layanan/']];
  const body = `${pageHero(crumbs, 'Layanan', 'Layanan ISHMA Gorden.', NO_SHOWROOM + ' Berikut hal-hal yang dapat Anda konsultasikan.')}
<div class="wrap main"><div class="grid g3">${layanan.map((l) => `<div class="card"><div class="tx"><h3>${esc(l.judul)}</h3><p>${esc(l.isi)}</p><p style="margin-top:16px">${waBtn(l.wa, 'Tanya layanan ini', 'btn btn-line btn-sm')}</p></div></div>`).join('')}</div>
<div class="prose" style="margin-top:56px"><h2>Wilayah konsultasi</h2><p>Kami menerima konsultasi dari kecamatan-kecamatan berikut dan sekitarnya. Ketersediaan pengukuran, pengiriman, dan pemasangan dikonfirmasi per lokasi saat konsultasi.</p></div>
<ul class="chips" style="margin-top:16px">${site.wilayah.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
<div class="prose" style="margin-top:46px"><p>Lihat juga <a href="/katalog/">katalog produk</a>, <a href="/katalog/daftar-harga/">daftar harga</a>, dan <a href="/faq/">pertanyaan umum</a>.</p></div></div>
${ctaBand('Konsultasi', 'Ceritakan kebutuhan Anda.', 'Sampaikan jenis ruang, ukuran, dan lokasi pemasangan.', 'Halo ISHMA Gorden, saya ingin informasi layanan dan pemasangan.')}`;
  layout({ url: '/layanan/', title: 'Layanan Gorden Custom, Vitrase & Motorized | ISHMA Gorden', desc: 'Layanan konsultasi gorden custom, vitrase, blinds, rel, dan motorized untuk rumah, hotel, villa, kantor, dan proyek di Banyuwangi dan sekitarnya.', body, crumbs });
}
function pageTentang() {
  const crumbs = [['Beranda', '/'], ['Tentang', '/tentang/']];
  const body = `${pageHero(crumbs, 'Tentang kami', 'Mengenal ISHMA Gorden.', `${site.nama} merupakan salah satu unit usaha di bawah ${site.perusahaanInduk}.`)}
<div class="wrap main"><div class="prose"><h2>Solusi gorden lewat konsultasi yang mudah.</h2>
<p>ISHMA Gorden membantu calon pelanggan mengenali pilihan gorden, vitrase, blinds, rel, dan sistem motorized melalui komunikasi online. Kami mengutamakan informasi yang jelas mengenai produk, ukuran, dan proses pemesanan.</p>
<p>${NO_SHOWROOM} Pengukuran, pengiriman, dan pemasangan dikonfirmasi sesuai lokasi dan kesepakatan layanan.</p>
<h2>Untuk siapa?</h2><p>Masyarakat Banyuwangi, warga Banyuwangi yang bekerja atau tinggal di luar kota dan luar negeri, pendatang yang akan menetap, serta pemilik rumah, pengelola penginapan, hotel, villa, dan kebutuhan proyek.</p>
<h2>Bagian dari ${esc(site.perusahaanInduk)}</h2><p><em>${esc(site.tagline)}</em></p><p>Unit usaha: ${site.unitUsaha.map((u) => esc(u.nama)).join(', ')}. Website ini saat ini berfokus pada ISHMA Gorden dan disiapkan agar dapat berkembang bersama unit usaha lainnya.</p>
<div class="actions">${waBtn('Halo ISHMA Gorden, saya ingin berkenalan dan konsultasi.', 'Hubungi via WhatsApp')}<a class="btn btn-line" href="/galeri/">Lihat Galeri</a></div></div></div>`;
  layout({ url: '/tentang/', title: 'Tentang ISHMA Gorden Banyuwangi | Bagian dari UD. ISHMA', desc: 'ISHMA Gorden Banyuwangi adalah unit usaha UD. ISHMA yang melayani penjualan dan konsultasi gorden secara online melalui WhatsApp dan media sosial.', body, crumbs });
}
function pageFaq() {
  const crumbs = [['Beranda', '/'], ['FAQ', '/faq/']];
  const body = `${pageHero(crumbs, 'FAQ', 'Pertanyaan yang sering diajukan.', 'Jawaban singkat seputar pemesanan, produk, dan layanan ISHMA Gorden.')}
<div class="wrap main"><div class="prose">${faq.map((f) => `<details><summary>${esc(f.t)}</summary><p>${esc(f.j)}</p></details>`).join('')}<div class="actions" style="margin-top:34px">${waBtn('Halo ISHMA Gorden, saya punya pertanyaan yang belum terjawab di FAQ.', 'Tanya langsung via WhatsApp')}</div></div></div>`;
  const ld = [{ '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.t, acceptedAnswer: { '@type': 'Answer', text: f.j } })) }];
  layout({ url: '/faq/', title: 'FAQ Gorden Banyuwangi: Pemesanan, Harga, Blackout | ISHMA Gorden', desc: 'Jawaban pertanyaan umum tentang memesan gorden, perbedaan blackout dan dimout, vitrase, gorden motorized, dan layanan ISHMA Gorden.', body, ld, crumbs });
}
function pageKontak() {
  const crumbs = [['Beranda', '/'], ['Kontak', '/kontak/']];
  const body = `${pageHero(crumbs, 'Kontak', 'Mari bicarakan kebutuhan gorden Anda.', 'Kirim pertanyaan, ukuran jendela, foto ruangan, dan lokasi agar kami dapat membantu mengarahkan konsultasi.')}
<div class="wrap main"><div class="grid g2"><div class="card"><div class="tx"><h3>WhatsApp</h3><p style="font-size:20px;color:var(--ink);margin-bottom:6px">${esc(site.whatsappTampil)}</p><p>Cara tercepat untuk konsultasi dan pemesanan.</p><p style="margin-top:16px">${waBtn('Halo ISHMA Gorden, saya ingin konsultasi.', 'Mulai konsultasi')}</p></div></div>
${site.tampilkanAlamat && site.alamat ? `<div class="card"><div class="tx"><h3>Alamat</h3><p style="color:var(--ink)">${esc(site.alamat)}</p>${jamHtml()}<p>Mohon hubungi WhatsApp terlebih dahulu sebelum berkunjung.</p>${site.gmapsUrl ? `<p style="margin-top:16px"><a class="btn btn-line btn-sm" href="${esc(site.gmapsUrl)}" rel="noopener">Buka di Google Maps</a></p>` : ''}</div></div>` : ''}
<div class="card"><div class="tx"><h3>Media sosial</h3><p><a class="tlink" href="https://www.instagram.com/${site.instagram}/" rel="noopener me">Instagram @${esc(site.instagram)}</a></p><p><a class="tlink" href="https://www.tiktok.com/@${site.tiktok}" rel="noopener me">TikTok @${esc(site.tiktok)}</a></p>${site.facebookUrl ? `<p><a class="tlink" href="${esc(site.facebookUrl)}" rel="noopener me">Facebook ${esc(site.facebookNama)}</a></p>` : `<p>Facebook: ${esc(site.facebookNama)}</p>`}</div></div></div>
<div class="prose" style="margin-top:46px"><h2>Agar konsultasi cepat</h2><p>Siapkan hal berikut sebelum mengirim pesan:</p><ul><li>Lebar dan tinggi jendela atau pintu.</li><li>Foto ruangan.</li><li>Lokasi pemasangan (kecamatan atau kota).</li><li>Fungsi ruang dan warna atau gaya yang disukai.</li></ul>
<p>${NO_SHOWROOM}</p>
<p><a href="/faq/">Baca pertanyaan umum</a> · <a href="/layanan/">Lihat layanan</a></p></div></div>`;
  layout({ url: '/kontak/', title: 'Kontak, Alamat & WhatsApp ISHMA Gorden Genteng Banyuwangi', desc: 'Alamat dan kontak ISHMA Gorden di Genteng, Banyuwangi: WhatsApp 0823-3121-9722, Google Maps, Instagram, dan TikTok @gordenbwi.', body, crumbs });
}
function pagePrivasi() {
  const crumbs = [['Beranda', '/'], ['Kebijakan Privasi', '/kebijakan-privasi/']];
  const body = `${pageHero(crumbs, 'Kebijakan privasi', 'Kebijakan privasi.', 'Terakhir diperbarui: ' + TODAY)}
<div class="wrap main"><div class="prose">
<p>Website ${esc(site.nama)} dikelola oleh ${esc(site.perusahaanInduk)}. Halaman ini menjelaskan bagaimana informasi Anda diperlakukan.</p>
<h2>Data yang kami kumpulkan</h2><p>Website ini tidak memiliki formulir, akun pengguna, atau kolom komentar, dan tidak menyimpan data pribadi Anda di server website. Saat ini website tidak memasang alat analitik atau iklan pelacak.</p>
<h2>Komunikasi melalui WhatsApp</h2><p>Jika Anda menekan tombol WhatsApp, Anda akan diarahkan ke aplikasi WhatsApp dengan pesan awal yang sudah tersedia. Informasi yang Anda kirim (nama, nomor telepon, foto, alamat, dan lain-lain) kami gunakan hanya untuk melayani konsultasi dan pesanan Anda. Penggunaan WhatsApp tunduk pada kebijakan WhatsApp sendiri.</p>
<h2>Tautan ke pihak lain</h2><p>Website memuat tautan ke Instagram, TikTok, dan Facebook. Kami tidak bertanggung jawab atas kebijakan privasi layanan tersebut.</p>
<h2>Perubahan</h2><p>Kebijakan dapat diperbarui sewaktu-waktu, misalnya bila website menambah alat analitik. Tanggal pembaruan tertera di bagian atas halaman.</p>
<h2>Pertanyaan</h2><p>Hubungi kami melalui <a href="/kontak/">halaman kontak</a>.</p></div></div>`;
  layout({ url: '/kebijakan-privasi/', title: 'Kebijakan Privasi | ISHMA Gorden Banyuwangi', desc: 'Kebijakan privasi website ISHMA Gorden Banyuwangi: tidak ada formulir atau pelacak, konsultasi dilakukan melalui WhatsApp.', body, crumbs });
}
function page404() {
  layout({ url: '/404.html', noindex: true, title: 'Halaman tidak ditemukan | ISHMA Gorden', desc: 'Halaman yang Anda cari tidak ditemukan. Kembali ke beranda ISHMA Gorden atau lihat katalog produk.', body: `<div class="wrap main prose"><p class="eyebrow">404</p><h1>Halaman tidak ditemukan.</h1><p>Mungkin alamatnya sudah berubah. Silakan kembali ke beranda atau lihat katalog.</p><div class="actions"><a class="btn" href="/">Ke Beranda</a><a class="btn btn-line" href="/katalog/">Katalog</a></div></div>` });
}

// ---------- jalankan ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
pageHome(); pageKatalog(); pageDaftarHarga();
produkData.produk.forEach(pageProduk);
pageGaleri(); tipeCfg.forEach(pageGaleriTipe); pageArtikelIndex(); articles.forEach(pageArtikel);
pageLayanan(); pageTentang(); pageFaq(); pageKontak(); pagePrivasi(); page404();

// salin aset (tanpa file BACA-SAYA)
function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'BACA-SAYA.txt') continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
copyDir(path.join(ROOT, 'assets'), path.join(DIST, 'assets'));

// sitemap & robots
const idx = pages.filter((p) => !p.noindex);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${idx.map((p) => `  <url><loc>${abs(p.url)}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n${BASE ? `\nSitemap: ${BASE}/sitemap.xml\n` : ''}`);

console.log(`OK: ${pages.length} halaman, ${gallery.length} foto galeri, ${articles.length} artikel, ${hargaTampil.length}/${hargaData.harga.length} baris harga ditampilkan.`);
if (BASE) console.log('URL dasar:', BASE);
warn.forEach((w) => console.log('PERINGATAN:', w));
