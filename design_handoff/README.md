# Handoff: Profil Indah — Nocturne Redesign (v2, final)

> **Versi ini menggantikan README lama.** Semua keputusan final per 15 Agustus 2026 ada di sini.

## Overview
Redesign UI aplikasi manajemen **Profil Indah** (Angular 16, repo `Profil-Indah-16`) dari tema lama ke sistem desain **Nocturne** dengan aksen biru perusahaan. Mencakup: login, dashboard per-role, faktur penjualan (daftar + form buat), master barang (buat item, brand, tipe + dialog tambah), dialog tambah pelanggan, dan laporan penjualan.

## About the Design Files
File di bundle ini adalah **referensi desain dalam HTML** (`Profil Indah - Nocturne.dc.html` — buka di browser), bukan kode produksi. Tugasnya: **recreate desain ini di codebase Angular 16 yang sudah ada** (`src/app/pages/...`), memakai pola komponen, routing, translate pipe, dan service yang sudah berlaku di repo. Jangan menyalin HTML mentah-mentah.

## Fidelity
**High-fidelity.** Warna, tipografi, spacing, radius, dan copy sudah final — implementasikan pixel-perfect.

## Design Tokens (final)

> ⚠️ **STOP — buka `TOKENS.md` dulu.** Semua warna di README ini ditulis sebagai rumus; TOKENS.md berisi HEX FINAL yang sudah dihitung per tema dan MENANG atas file mana pun kalau ada konflik. Khusus warna background, sidebar, state aktif, pill, dan banner: ikuti TOKENS.md persis.

### Aksen
- Accent (light mode): `#154dec`
- Accent (dark mode): `color-mix(in srgb, #154dec 62%, #b5d1ff)` — aksen dicerahkan agar kontras di ground gelap. Jangan pakai #154dec mentah di dark mode.
- Active/selected ground (kedua tema): `#E7ECFB` di light; di dark pakai `color-mix(in srgb, #154dec 16%, surface)`.
- Pola state aktif (menu sidebar, tag halaman, chip, avatar): background active-ground + `inset 0 0 0 1px accent` + teks/ikon accent.

### Dark theme
- bg: `color-mix(in srgb, #14244a 45%, #161826)` · surface: `color-mix(in srgb, #14244a 28%, #232532)`
- text: `#e9e9ed` · divider: `color-mix(in srgb, #e9e9ed 12%, transparent)`

### Light theme
- bg: `color-mix(in srgb, #b5d1ff 30%, #eef1fa)` · surface: `color-mix(in srgb, #b5d1ff 12%, #f8fafe)`
- text: `#292b31`

### Tipografi & bentuk
- Font: **Plus Jakarta Sans** (heading & body), heading weight 500 (jangan lebih tebal), body 400.
- Radius: 8px (md) / 12px (lg untuk card). Ikon: **Phosphor** (`ph ph-*`).
- Background dekoratif: 2 lingkaran radial-gradient besar (900–1100px) warna aksen/tint, `filter: blur(190–210px)`, opacity 0.16–0.75, absolute di belakang konten.

## Screens (id = penanda di file HTML)

### Penerimaan Barang — SATU catatan dengan Faktur Pembelian (daftar `10a`, buat `10b`/`10c`/`10d`)
**Model baru:** Faktur Pembelian bukan dokumen terpisah — dia catatan penerimaan yang sama yang kolom fakturnya sudah terisi. Form buat penerimaan punya tiga wajah per role:
- `10b` — role pembelian: hanya barang & jumlah, tanpa harga, tanpa faktur (seperti semula).
- `10c` — administrator/pemilik, **Surat jalan saja**: di atas form ada pilihan "Keadaan dokumen" (2 kartu). Barang datang, faktur belum → dokumen berstatus **Menunggu faktur** (konsekuensi tertulis di kartunya). Slot kolom faktur di-reserve sebagai placeholder dashed setinggi sama (min-height 148px) supaya form tidak melompat saat toggle. Tabel barang dengan harga/diskon + bookmark save_price. Tombol: "Simpan — menunggu faktur".
- `10d` — administrator/pemilik, **Dokumen lengkap**: kartu Faktur supplier terisi (no. faktur supplier, no. faktur pajak, **diskon dokumen Rp** — di luar diskon per baris). Ringkasan kanan ikut berubah (baris Diskon dokumen; checklist "dokumen final, masuk hutang"). Tombol: "Simpan — dokumen final".
- **Jalan pulang:** `10a` punya kolom Status (pill Lengkap hijau / Menunggu faktur amber) + chip amber "3 menunggu faktur" di samping search sebagai filter; melengkapi faktur = buka penerimaan ber-status menunggu.
- Konsekuensi: **11a/11b menjadi daftar & arsip saja** — bukan form buat lagi.

#### Detail lama 10a/10b (masih berlaku untuk role pembelian)
Untuk role pembelian: penerimaan hanya mencatat barang & jumlah dari surat jalan supplier, **tanpa harga**.
- `10a` daftar: kolom Tanggal, Nomor GR, Supplier, Perusahaan penerima, No. surat jalan (tanpa kolom uang). Pola daftar sama dengan 4a (arsip bulan, search, filter, Buat primary + refresh ujung kanan, paginasi seg).
- `10b` buat: card Data umum (tanggal surat jalan, no. surat jalan, supplier autocomplete + "Tambah supplier baru", perusahaan penerima) + card Barang diterima: banner aksen "Penerimaan hanya mencatat jumlah barang masuk. Harga diinput terpisah melalui Faktur Pembelian."; tabel per baris = ref + deskripsi + stok saat ini, input jumlah + satuan + hint konversi ("3 box = 300 pcs"), tombol hapus di-center setinggi input (container 40px). Kanan: card "Sebelum simpan" (checklist) + Aksi (Simpan penerimaan / Batal).

### Faktur Pembelian — daftar `11a`, buat `11b`
Versi ber-harga; hanya role dengan akses harga.
- `11a` daftar: Tanggal, Nomor FB, Supplier, Faktur supplier, Total (kanan, tabular), Pembayaran (tag Lunas hijau/Belum lunas outline) + filter chips Lunas/Belum lunas.
- `11b` buat: Data umum = supplier, perusahaan, tanggal & no. surat jalan, **no. faktur supplier, no. faktur pajak** (format XXX.XXX-XX.XXXXXXXX). Card Item: banner ikon gembok "Harga & diskon hanya terlihat oleh role dengan akses harga…"; kolom Barang / Harga beli (input) / Diskon Rp (input) / Jumlah + konversi / Total baris / aksi. Aksi per baris: ikon **bookmark** toggle `save_price` (terisi aksen = harga baru disimpan ke master barang; outline abu = tidak) + hapus, keduanya center dalam container 40px. Kanan: Ringkasan (subtotal, diskon, Total besar aksen), "Sebelum terbit" (checklist, termasuk peringatan faktur pajak kosong), Aksi (Terbitkan faktur / Pratinjau).
- `11c` dialog **Update harga & diskon** (dibuka dari baris item): header ber-ikon `ph-tag` + nama item; input Harga beli (Rp) & Diskon (Rp) rata kanan; baris info "Setara diskon X%" + "Harga sebelumnya: Rp … · disk. Rp …"; lalu checkbox berbingkai **"Simpan untuk selanjutnya"** — dicentang: harga & diskon baru disimpan ke master barang untuk pembelian berikutnya; tidak: hanya berlaku di faktur ini (sinkron dengan ikon bookmark di tabel). Footer Batal / Terapkan. Lebar 560px, backdrop blur 3px.

### Login — `3a` (tablet 1280×800), `3b` (desktop)
Card login 430px (logo + "Selamat datang", username, password, ingat saya, tombol Masuk outline accent, seg ID/EN) + **maskot gajah** (`assets/images/mascot-2d.png`, 320px, glow radial aksen + drop-shadow, caption "Sistem Manajemen · v16") mengambang di kanan, gap 56px. Maskot akan dianimasikan di Angular — posisinya konsisten di semua layar yang memakainya.

### Dashboard per role — `9c`
Setelah login langsung ke sini (TIDAK ada halaman launcher; akses role dibatasi lewat sidebar).
- Header: "Selamat pagi, {nama}" + tanggal + tag role.
- 4 kartu ringkasan hari ini (per role Administrator): Penjualan hari ini, Pembelian hari ini, Promosi berlangsung, Deposit hari ini. Kartu: ikon 48px kotak aksen, nilai 24px tabular, sub-teks.
- Baris kedua: kiri = card "Penjualan 7 hari terakhir" (bar chart div-based, hari ini aksen penuh, lainnya 45%) + daftar 5 faktur terbaru; kanan = card "Promosi berlangsung" + card "Aksi cepat" (4 tombol secondary).
- Kartu berbeda per role — render dari satu endpoint `dashboard/summary`.

### Faktur Penjualan — daftar `4a`
Sidebar 260px (search menu, grup Pinned/Menu/Master/Administrator dengan counter, item aktif ber-ring aksen) + top bar 64px (tag halaman, moon toggle, avatar). Konten: judul + arsip bulan (tag "Agustus 2026" + "Kembali ke arsip"), search, filter chips (Aktif/Dihapus, Lunas/Belum lunas), tombol urutan: **Buat faktur (primary) lalu refresh di ujung kanan**. Tabel sortable (caret ⇅): Tanggal (no-wrap), Nomor faktur, Pelanggan, **Sales (kolom sendiri)**, Total, Status, Pembayaran. Tag **Lunas/Aktif hijau** (`#308639` ramp), Belum lunas outline. Paginasi seg 10/25/50.

### Buat Faktur — `5a`
Tanpa tombol back di top bar. Konten center, kolom kiri max 1080px gap **32px** antar card + kolom kanan 320px (gap 32px):
1. Header "Buat Faktur" + tag "Nomor dibuat otomatis saat terbit" (tidak ada input nomor faktur).
2. Card "Info faktur": Tanggal (pertama), Pelanggan (autocomplete + link "Tambah pelanggan baru" → dialog `7f`), Salesman (autocomplete). Tipe transaksi = **3 kartu pilihan besar** (Penjualan/Deposit/Deposit internal), yang aktif ber-ring + ground aktif.
3. Card "Item": banner info border+teks aksen, ground `#E7ECFB` (dark: campuran aksen): "Harga dan diskon yang tertera akan diperhitungkan ulang pada saat faktur diterbitkan." Tabel item + tombol Tambah produk/paket.
4. Kanan: card "Sebelum terbit" (checklist) + card "Aksi": **Terbitkan faktur** (primary) + **Pratinjau** (secondary). Tidak ada simpan draf. Pembayaran dicatat lewat **Tambah pembayaran** (bukan toggle lunas).
Semua input: `background: var(--color-bg)`, min-height 44px, label di atas.

### Buat Barang — `7a`
Judul "Buat Barang" + back "← Barang". Card 1 "Info barang": Reference (max 420px), Deskripsi (textarea 84px), Product brand & Product type (autocomplete + link "Tambah … baru" → dialog `7d`/`7e`).
Card 2 "Satuan & harga": banner aksen "Satuan pertama adalah satuan terkecil…"; grid kolom: Satuan (input) / Konversi ("1 box = [input] pcs" — baris pertama "Satuan dasar (terkecil)") / Harga jual / **Diskon (Rp)** / Harga beli / **Diskon (Rp)** / hapus. Diskon dalam Rupiah, bukan persen. Baris "+ Tambah satuan" dashed.

### Master data — `7b` Product Brand, `7c` Product Type
Daftar center (max 1240px): judul, search 320px, **Tambah (primary) + refresh di kanan**. Tabel: Nama (avatar inisial bulat aksen), Deskripsi, Dibuat oleh, Dibuat pada, Jumlah barang. Sidebar: item Barang / Product Brand / Product Type terpisah (tidak ada "Data Master").

### Dialog — `7d` brand, `7e` tipe, `7f` pelanggan
Pola header ala kartu: bar atas (ground sedikit beda + divider bawah) berisi **ikon 40px kotak aksen** + judul + subjudul + tombol ✕; body form padding 24; footer Batal (secondary) + Simpan (primary) kanan. `7f`: Prefix* (select 160px) / Nama*, Email / Telepon*, Alamat* (textarea), Kota* / Provinsi*, NPWP (max 320px). Backdrop: bg 55% + blur 3px.

### Laporan — landing `9b`, Laporan Penjualan `9a`
- `9b`: grid 3 kolom kartu jenis laporan (ikon, judul, deskripsi, "Buka →"); kartu difilter per role.
- `9a`: header + picker bulan + tombol **Excel** & **PDF** (secondary). 4 hero card — "Total penjualan" di-highlight (light: `#E7ECFB` + ring; dark: aksen 16% + ring). Card grafik harian (bar nilai aksen 75% + bar transaksi neutral, seg toggle "Nilai & transaksi/Detail nilai", legend) + card "Terbaik bulan ini" (Pelanggan/Sales/Brand/Tipe, klik → drill). Card "Penjualan per brand": baris nama + bar horizontal (lebar relatif thd terbesar, warna bertingkat dari aksen) + % + nilai.
Data dari endpoint `report/sales` yang sudah ada (chart, salesInvoiceCount, total, discount, delivery, service, brand, type, returned_value, returns).

### Penyesuaian Stok (Adjustment Case) — `12a` daftar, `12b` buat, `12c` konfirmasi, `12d` dialog setujui
- `12a` daftar: Tanggal, Nomor AC, Tipe (pill), Perusahaan (— untuk Hilang), Dibuat oleh; filter tipe.
- `12b` buat: tipe = 2 kartu pilihan besar — **Ditemukan** (stok bertambah, wajib perusahaan) / **Hilang** (stok berkurang, tanpa perusahaan); tanggal; tabel barang + jumlah (tanpa harga). Tombol "Ajukan penyesuaian" — stok berubah setelah konfirmasi admin.
- `12c` konfirmasi (admin): tabel kasus menunggu (dibuat oleh dengan avatar inisial, tipe pill), aksi per baris Lihat / Setujui.
- `12d` dialog setujui: ikon seal-check + ringkasan kasus, detail dibuat-oleh & jumlah barang, banner info: "Setelah disetujui, penyesuaian langsung masuk ke stok dan ikut perhitungan jurnal akuntansi. Tindakan ini tidak bisa dibatalkan." Footer Batal / Ya, setujui.

### Perusahaan — `13a` daftar, `13b` dialog tambah, `13c` dialog edit
- `13a`: Nama (avatar inisial), Alamat, NPWP (mask XX.XXX.XXX.X-XXX.XXX, "—" jika kosong).
- `13b`: Nama, Alamat (textarea), NPWP full width (opsional).
- `13c`: field terisi + tombol **Hapus** merah kiri footer + banner peringatan "hanya administrator & jika tidak dipakai transaksi" (aturan can_delete); Batal / Simpan perubahan.

### Pilih produk (item selector) — `14a`
Dialog 820px dipakai semua form (faktur, penerimaan, penyesuaian): search + filter chips tipe; baris barang = reference + brand + deskripsi. **Klik baris = langsung menambah SATU baris ke dokumen pemanggil** — tidak ada tombol "Tambahkan", tidak ada state disabled: barang yang sama boleh dipilih berkali-kali (kasus bonus supplier: 10 box @ Rp 150.000 + 1 box @ Rp 0 = dua baris, barang & satuan sama, harga beda).
- Barang yang sudah masuk dokumen: ring aksen + pill "N baris" (tooltip = rincian tiap baris) + tombol "+ Baris lagi"; rincian baris juga tampil kecil di bawah deskripsi. Barang belum masuk: ikon + aksen di kanan.
- Barang >1 satuan: baris kedua (border-top dashed) berisi chip kapsul per satuan (aktif = ring + ground aksen) + keterangan konversi; chip menentukan satuan baris BERIKUTNYA yang ditambahkan.
- Jumlah & harga TIDAK diisi di dialog — semuanya di tabel dokumen.
- Footer netral: "N baris di dokumen · dari M barang" + tombol Tutup (wording "dokumen", bukan "faktur", karena dialog dipakai banyak form).
- **Pengaman duplikat di form tujuan**: baris item yang barangnya muncul >1 kali diberi pill halus "×2" abu (radius 999px, ring divider, cursor help, tooltip "Barang yang sama ada di 2 baris — sengaja? mis. bonus supplier") di samping nama — menandai tanpa menghalangi.

### Pill status — SATU bahasa di semua halaman
Kapsul radius 999px, ikon 15px, padding 4px 12px 4px 8px, font 12.5px/600, theme-aware (pillGreen/pillAmber/pillRed di kode referensi):
- Hijau + check-circle: Lunas, Aktif; hijau + arrow-circle-up: Ditemukan
- Oranye + clock: Belum lunas
- Merah + x-circle: Dihapus; merah + arrow-circle-down: Hilang
Warna: hijau light `bg #d9f0da / text #1d6b26 / ring #308639`, dark `bg mix(#308639 28%, surface) / text #7fd489 / ring #4a9a52`; amber light `#f8ecd7/#8a5200/#a45f00`, dark `mix(#a45f00 26%)/#f0c27a/#c98f3d`; merah light `#f9e0e0/#a02c25/#b3261e`, dark `mix(#b3261e 26%)/#f2a5a0/#c46a66`.

## Interactions
- Hover: item nav/baris = tint `color-mix(text 5-6%, transparent)`; card modul = border aksen + shadow-md.
- Focus: `outline: 2px solid accent; offset 2px`.
- Tombol primary = **outline accent** (bukan fill), secondary = outline divider, ghost = teks aksen.
- Tombol bantuan floating kanan-bawah (48px bulat, ikon `ph-question`) di tiap halaman → membuka panduan halaman.
- Dark/light toggle (ikon moon di top bar), pilihan font & aksen adalah preferensi pengguna di halaman Pengaturan (`2b`).

## Assets
- `assets/mascot-2d.png` — maskot gajah 2D (PNG transparan 1024×1024, dari user). Pakai apa adanya.
- Logo: SVG inline (dua siku "P" — stroke aksen + abu, dot aksen) — lihat markup di file HTML.

## Files
- `Profil Indah - Nocturne.dc.html` — semua layar (id: 14a, 13a-13c, 12a-12d, 11a-11c, 10a-10b, 9a-9c, 7a-7f, 5a, 4a, 3a-3c, 2a-2b). Buka di browser; panel Tweaks berisi theme/font/accent/density.
- `Profil Indah - Current UI.dc.html` — rekreasi UI lama (pembanding).
- `nocturne-styles.css` — token & kelas Nocturne (btn, tag, card, table, field, seg, dialog).
- `support.js`, `image-slot.js` — runtime preview; abaikan saat implementasi.
