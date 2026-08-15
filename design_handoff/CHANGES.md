# CHANGES — delta sejak push sebelumnya

> Baca ini dulu; README.md tetap sumber lengkap. Yang tidak disebut di sini tidak berubah.

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
