# CHANGES — delta sejak push sebelumnya

> Baca ini dulu; README.md tetap sumber lengkap. Yang tidak disebut di sini tidak berubah.

## 15 Agustus 2026 (push #16)
- **Pengembalian diskon (FITUR BARU, form Buat Faktur Penjualan)** — card baru "Pengembalian diskon" tepat di bawah card Pembayaran. Kasus bisnis: diskon sering dikembalikan sebagai uang cash/transfer ke pelanggan (mis. tukang); selama ini tidak tercatat sehingga rekonsiliasi bank vs laporan tiap sore tidak cocok. Bentuk: banner info penjelas; 2 kartu pilihan "Diskon di faktur saja" (tanpa uang keluar) vs "Dikembalikan ke pelanggan" (uang keluar, tercatat & ikut rekonsiliasi); jika dikembalikan → segmented Cash/Transfer + Nominal Rp (default = total diskon faktur) + Nama penerima (cash) ATAU bank/nama akun/nomor akun (transfer — pola sama dengan Kelebihan Bayar 16a/16b). Pembukuan: uang keluar dicatat sebagai transaksi kas/bank tersendiri yang terikat ke fakturnya.
- **Topbar SERAGAM & FINAL di semua halaman kerja**: kanan atas SELALU berisi (urutan): ikon dark-mode toggle (ph-moon), lang selector ID/EN (toggle kapsul), lalu kartu profil (avatar inisial + nama + email + caret). 33 topbar yang belum punya sudah ditambahkan. JANGAN diubah-ubah atau dihilangkan per halaman.
- **Label "Mode administrator" DIHAPUS** dari topbar 10c/10d/20b — perbedaan role cukup dari isi form, tidak perlu diumumkan.
- **Tabel Stok (15a)**: kolom Tipe = pill tag-neutral (bukan avatar); nama barang = avatar bundar 30px berisi huruf pertama REFERENSI + ref bold + deskripsi kecil ellipsis. Brand tetap pill.

## 15 Agustus 2026 (push #15 — gaya tabel penuh + banyak layar baru)
- **Gaya tabel penuh (SEMUA daftar)**: header kolom uppercase 11px letter-spacing 0.07em warna neutral-600; baris lebih tinggi (padding 16px, density "Rapat" = 10px); konten daftar max-width lebih lebar (s.d. 1640px). Sel dua baris: nilai utama bold + baris kedua kecil neutral-600. Kolom entitas (supplier, tipe barang) pakai avatar inisial 28px + nama ber-max-width dengan overflow ellipsis. Brand = pill tag-neutral. Jumlah (count) = pill "N barang".
- **Input = Material OUTLINE** (bukan fill): ring 1px currentColor 32%, radius 6px, bg transparan; hover ring 60%; fokus ring aksen 2px. Implementasi: mat-form-field appearance="outline".
- **Faktur pajak**: TANPA tanda hubung/titik — placeholder "16 digit angka", maxlength 16, helper "Tanpa tanda hubung & titik · maks. 16 digit" (semua form faktur pembelian).
- **20a/20b/20c Faktur Pembelian**: antrean (filter segmented default "Belum beres"), halaman lengkapi dari penerimaan (data GR read-only + banner gembok "tidak bisa diubah di sini", jumlah terkunci, isi harga + faktur), dialog pilih periode (grid 12 bulan + stepper tahun, bulan tanpa data nonaktif, tombol bulan di samping refresh).
- **21a Avatar**: side panel → dialog 560px; 6 dropdown → tab per grup (Rambut 15/Aksesori 5/Pakaian 8/Mata 11/Alis 7/Mulut 12) + petak bergambar; label Indonesia; pratinjau live + saklar "Lingkaran latar" (slider warna nonaktif saat mati); banner "Perubahan langsung terlihat di pratinjau" di atas footer.
- **17c daftar Promosi**: capaian target = progress bar aksen + %, status Berjalan (hijau)/Akan datang (amber)/Selesai (netral).
- **16a/16b banner metode pengembalian**; **18a-18c Pengeluaran**: tombol bulan + cetak laporan + keadaan saringan-tanpa-hasil (pola kosong 19a).
- **Login 3a/3b**: ornamen 3D (assets/images/orn-*.png) — lihat push #14/#14b.
- **Seragam**: semua tag topbar & chip filter aktif = wash aksen 12% transparan (tanpa --active-bg terang); semua backdrop dialog 78% + blur 6px; semua btn-primary ber-background wash aksen 10%.

## 15 Agustus 2026 (push #14b — ornamen juga di login tablet)
- **Login tablet (frame 3a, 1280×800)** ikut pola ornamen, diskalakan: maskot 320px + animasi float-y 5s; 2 ornamen jelas dekat maskot (orn-graph 84px top 12px/right -8px delay -2s; orn-cone 68px bottom 84px/left -18px delay -4s, durasi 5.5-6s); 3 ornamen pudar statis di layer background (orn-dome 110px top -20px rotate 160deg; orn-rock 110px bottom -24px; orn-cone 96px right -26px rotate -15deg; opacity 0.4-0.45, sebagian terpotong tepi).

## 15 Agustus 2026 (push #14 — halaman Login + ornamen)
Referensi: frame 3b di "Profil Indah - Nocturne.dc.html". Aset baru di `assets/images/`: orn-cone.png, orn-dome.png, orn-graph.png, orn-rock.png (ornamen 3D biru), maskot tetap mascot-2d.png.
- **Maskot besar**: kolom kanan, 620×620px, object-fit contain, drop-shadow(0 28px 56px rgba(0,0,0,.35)), di atas glow radial aksen 28% blur 60px, animasi `float-y 5s ease-in-out infinite`.
- **Ornamen sisi maskot (4, jelas)**: orn-graph 120px (top 14% / right 10%), orn-cone 96px (bottom 12% / right 20%), orn-dome 92px (top 22% / left 8%), orn-rock 110px (bottom 18% / left 13%). Semua opacity 0.85-0.9, animasi float-y dengan durasi BEDA (5-6.5s) dan animation-delay negatif beda-beda supaya tidak serempak.
- **Ornamen background sisi form (3, pudar)**: opacity 0.4-0.5, sebagian dipotong tepi layar (top -22px / bottom -18px / left -34px), boleh dirotasi (160deg, -15deg). TANPA animasi — hanya aksen diam.
- **Aturan**: ornamen pointer-events none (di dalam layer background), jangan menutupi form/teks, jumlah maksimal ±4 animasi + 3 statis per halaman, HANYA di halaman login (halaman kerja tidak diberi ornamen).
- @keyframes yang dipakai: float-y (translateY 0 → -10px → 0).

## 15 Agustus 2026 (push #13)
- **Font default: Montserrat** (Google Fonts, weight 400-700). Heading 500, body 400. Tweak fontFamily tetap ada; default berubah dari Plus Jakarta Sans.
- **Jarak header form**: subtitle → card pertama diberi padding bawah 10px (semua form, seragam).
- **18a/18b Pengeluaran**: daftar (Tanggal/Deskripsi/Tipe tag netral/Perusahaan/Dibuat oleh/Nominal kanan) + total bulan berjalan di kanan atas header; saringan pola kapsul yang sama dengan Penerimaan (funnel + badge angka + kapsul ✕); tombol "Cetak laporan" (secondary, ikon printer) di kiri "Catat pengeluaran" — cetakan mengikuti saringan & bulan aktif. Form catat = DIALOG 560px (form pendek): Tanggal, Expense type (autocomplete), Deskripsi textarea, Perusahaan (autocomplete), Nominal rata kanan.
- **19a Empty state — POLA WAJIB SEMUA DAFTAR**: saat tabel kosong JANGAN sembunyikan apa pun — baris alat (search/saring/tombol tambah), HEADER KOLOM tabel, dan PAGINATOR ("0 dari 0") tetap tampil; hanya body tabel diganti blok kosong: ilustrasi ikon (lingkaran wash aksen 8% + ring dashed berdenyut + kotak ikon 56px float, ikon menyesuaikan konteks halaman) + judul + 1 kalimat penjelasan. TANPA CTA tambah duplikat (tambah lewat tombol toolbar yang sudah ada). Khusus hasil cari kosong: judul mengutip kata kunci ("Tidak ada hasil untuk "galvanis"") + tombol "Reset pencarian" (secondary). TIDAK ADA link "hapus semua saringan". Jangan pakai gambar maskot/foto di empty state.

## 15 Agustus 2026 (push #12 — bundle penuh)
- **15a Stok — daftar**: kolom Barang (ref + deskripsi), Brand, Stok rata kanan (angka + satuan dasar, MERAH kalau minus), pill kondisi Menipis (amber, ikon warning) / Minus (merah, arrow-down), aksi per baris "Kartu stok" & "Mutasi" (tombol secondary kecil). Header: chip ringkasan "2 menipis" & "1 minus" (bentuk toggle saring gaya 10a).
- **16a/16b Kelebihan Bayar — form**: card Penerimaan (urutan: Tanggal → Customer autocomplete → Metode penerimaan uang dari payment method → Nominal rata kanan) + card Pengembalian (tanggal rencana + toggle 2 kartu Cash/Transfer; Transfer = Bank/Nama akun/Nomor akun; Cash = nama penerima saja). Ringkasan kanan ikut metode.
- **16c Kelebihan Bayar — daftar**: kolom jatuh tempo + status pill Menunggu/Lewat jatuh tempo/Dikembalikan; menu titik-tiga per baris (Lihat detail / Update / "Sudah dikembalikan" aksen); seluruh baris klik = view.
- **17a/17b Promosi — buat**: Info (nama, deskripsi, mulai/berakhir, target Rp opsional, supplier), Merek peserta = AUTOCOMPLETE + chip terpilih ber-✕ (merek ±100, jangan render semua sebagai chip), Aturan SKU = baris [kondisi: Dimulai dengan/Diakhiri dengan/Tidak dimulai/Tidak diakhiri/Mengandung/Tidak mengandung] + nilai + hapus, "+ Tambah aturan" dashed, badge "Semua aturan harus terpenuhi (AND)" + penghitung "≈ N SKU cocok". 17a = default KOSONG: empty state dashed "Belum ada aturan SKU — tanpa aturan semua SKU merek terpilih ikut".

## 15 Agustus 2026 (push #11)
- **BARU: `TOKENS.md` — satu-satunya sumber kebenaran warna.** Semua hex FINAL per tema (bg #0d121d, surface #161b29, sidebar #121724, accent dark #527ff3, active-bg #142044/#E7ECFB, pill, banner, dialog, tombol) sudah dihitung — jangan hitung ulang dari color-mix. Kalau file lain bertentangan, TOKENS.md yang menang. Spesifikasi sidebar & state aktif ditulis eksplisit di sana (item aktif = wash aksen 12%, TANPA ring, TANPA chip terang).

## 15 Agustus 2026 (push #10)
- **Sistem saring 10a/10e dua tingkat, satu sumber kebenaran**:
  - Chip mandiri "3 menunggu faktur" di baris alat — toggle sekali tekan, amber (warna pill status). Keadaan MATI: kapsul outline netral + ikon jam amber (tetap terbaca satu keluarga saringan). Keadaan NYALA: pillAmber penuh.
  - Tombol funnel = saringan sesekali → dialog berisi HANYA rentang tanggal + Keadaan data (Aktif/Dihapus), plus catatan "daftar sudah per bulan; Menunggu faktur ada di baris alat". Saat ada saringan dialog aktif, funnel dapat badge angka (jumlah saringan).
  - SEMUA saringan aktif (chip maupun dialog) tampil sebagai kapsul ✕ di baris alat yang sama + "Hapus semua" — kapsul menyisip inline di baris alat (flex-wrap), tidak ada baris kosong / layout melompat.

## 15 Agustus 2026 (push #9)
- **Token `--active-bg` jadi theme-aware**: light tetap `color-mix(tint 30%, #f4f7fd)` (≈ #E7ECFB untuk biru); dark jadi `color-mix(accent 16%, #141824)`. Otomatis membenahi warna kartu Ditemukan/Hilang (12b), ikon header semua dialog, avatar inisial, tile laporan/dashboard, dan kartu tipe transaksi di dark mode.
- **Semua banner info** (Harga & diskon dihitung ulang, Satuan terkecil, Penerimaan tanpa harga, banner gembok akses harga) tidak lagi hardcode #E7ECFB — pakai `var(--active-bg)` sehingga ikut gelap di dark mode.

## 15 Agustus 2026 (push #8)
- **State aktif diseragamkan & dilembutkan (semua layar)**: item sidebar aktif + tag bookmark top bar = wash aksen 12% transparan, TANPA ring/chip terang. Tombol primary: outline aksen + wash aksen 10% transparan di dalamnya.
- **10e — dialog Filter penerimaan**: dari/sampai tanggal, supplier, perusahaan penerima, status dokumen (Semua/Lengkap/Menunggu faktur); footer Reset kiri + Batal/Terapkan. Filter aktif tampil sebagai **chip yang bisa dilepas** ("Status: Menunggu faktur ✕", dst.) di atas daftar + link "Hapus semua". Pola filter ini berlaku untuk semua daftar arsip.
- 10c/10d dirapatkan agar muat 1080px (gap 16px, padding card 12/28/16, slot faktur min-height 128px).

## 15 Agustus 2026 (push #7)
- **Dark mode: ground baru** — bg `color-mix(d900 16%, #0c0e14)`, surface `color-mix(d900 12%, #161a24)` (near-black navy ala referensi user). Light mode tidak berubah.
- **Backdrop semua dialog digelapkan**: bg 78% (dulu 55%), blur 6px.
- **Penerimaan = satu catatan dengan Faktur Pembelian** (lihat README bagian Penerimaan): 10c/10d mode administrator dengan pilihan "Keadaan dokumen" (Surat jalan saja → status Menunggu faktur; Dokumen lengkap → kolom faktur + diskon dokumen, final & masuk hutang). Slot kolom faktur di-reserve agar form tidak melompat. 10a dapat kolom Status + chip "3 menunggu faktur". 11a/11b jadi daftar & arsip saja.

## 15 Agustus 2026 (push #6)
- **14a Pilih produk — rework multi-baris**: klik baris = langsung tambah 1 baris ke dokumen (tanpa tombol "Tambahkan", tanpa state disabled). Barang sama boleh dipilih berulang (bonus supplier: 10 box @150rb + 1 box @0). Barang yang sudah masuk: ring aksen + pill "N baris" (tooltip rincian) + tombol "+ Baris lagi". Footer netral: "N baris di dokumen · dari M barang" + Tutup. Chip satuan menentukan satuan baris berikutnya.
- **Pengaman duplikat di form faktur (5a)**: baris dengan barang yang sama diberi pill halus "×2" (tooltip peringatan) di samping nama item; contoh dua baris Besi Hollow (Rp 150.000 & Rp 0).
- Stok, harga, jumlah dihapus dari dialog picker — diisi di tabel dokumen.

## 15 Agustus 2026 (push #5)
- **14a Pilih produk — satuan multi-unit**: barang dengan >1 satuan mendapat baris kedua di kartu terpilih (border-top dashed): chip kapsul per satuan (aktif = ring aksen + ground aktif; light `#E7ECFB`, dark `mix(accent 18%, surface)`), keterangan konversi rata kanan ("1 ikat = 50 batang · 5 ikat = 250 batang"). Ganti chip ⇒ update harga & perhitungan konversi.

## Push #4 (sebelumnya)
- 12a–12d Penyesuaian Stok (daftar, buat, konfirmasi admin, dialog setujui + catatan jurnal akuntansi).
- 13a–13c Perusahaan (daftar, dialog tambah, dialog edit + hapus admin-only). NPWP full width.
- 14a dialog Pilih produk (multi-pilih, stok+harga, stepper qty, fix kontras dark mode).
- Pill status diseragamkan SEMUA halaman (pillGreen/pillAmber/pillRed + ikon; lihat README "Pill status").

## Push #3
- 11a–11c Faktur Pembelian (daftar, buat dengan harga/diskon editable + bookmark save_price, dialog update harga & diskon + "Simpan untuk selanjutnya").
- 10a–10b Penerimaan Barang (tanpa harga; banner pemisah dari faktur pembelian).
