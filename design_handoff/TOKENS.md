# TOKENS.md — SATU-SATUNYA SUMBER KEBENARAN WARNA

> **Untuk Claude Code:** pakai hex PERSIS dari tabel ini. JANGAN menghitung ulang dari rumus color-mix di file lain — file ini adalah hasil hitungnya. Kalau ada konflik antara file lain dan file ini, **file ini yang menang.**
> Implementasi disarankan sebagai CSS custom properties di `:root` (light) dan `[data-theme="dark"]`.

## 1. Ground / permukaan

| Token | Dark | Light | Dipakai untuk |
|---|---|---|---|
| `--bg` | `#0d121d` | `#dde7fb` | Background halaman |
| `--surface` | `#161b29` | `#f0f5fe` | Card, dialog, tabel |
| `--sidebar-bg` | `#121724` | `#e8eefc` | Side navigation (SOLID, bukan transparan) |
| `--topbar-bg` | sama dengan `--bg` | sama dengan `--bg` | Top bar (hanya dipisah border bawah) |
| `--divider` | `rgba(233,233,237,0.12)` | `rgba(41,43,49,0.14)` | Semua garis pemisah, border card 1px |
| `--input-bg` | sama dengan `--bg` | sama dengan `--bg` | Background semua input/textarea |

## 2. Teks

| Token | Dark | Light |
|---|---|---|
| `--text` | `#e9e9ed` | `#292b31` |
| `--text-muted` | `#8f93a3` | `#595d6c` |
| `--text-faint` | `#6b7080` | `#75798c` |

## 3. Aksen (biru perusahaan)

| Token | Dark | Light | Catatan |
|---|---|---|---|
| `--accent` | `#527ff3` | `#154dec` | JANGAN pakai #154dec mentah di dark — kurang kontras |
| `--active-bg` | `#142044` | `#E7ECFB` | Ground state aktif/terpilih (kartu tipe, ikon dialog, avatar, banner) |
| `--accent-wash-12` | `rgba(82,127,243,0.12)` | `rgba(21,77,236,0.10)` | Item sidebar aktif, tag bookmark, chip filter aktif |
| `--accent-wash-10` | `rgba(82,127,243,0.10)` | `rgba(21,77,236,0.08)` | Isi tombol primary |

## 4. Side navigation — SPESIFIKASI PASTI (sering salah, baca pelan)

- Lebar `260px`, background `--sidebar-bg` (solid), border kanan 1px `--divider`.
- Item biasa: background transparan; teks `--text-muted`; ikon `--text-faint`; radius 8px; padding 7px 8px; font 13.5px.
- Item hover: background `rgba(233,233,237,0.06)` (dark) / `rgba(41,43,49,0.05)` (light).
- **Item AKTIF: background `--accent-wash-12`; teks & ikon `--accent`. TIDAK ADA border/ring/outline. TIDAK ADA chip terang.** (Desain lama pakai chip #E7ECFB + ring — itu SUDAH DIBUANG.)
- Label grup: uppercase 10px, `--text-faint`, letter-spacing 0.1em.

## 5. Top bar

- Tinggi 64px, background = `--bg`, border bawah 1px `--divider`.
- Tag halaman (bookmark): background `--accent-wash-12`, teks `--accent`, uppercase 11px, radius pill. TANPA ring.

## 6. Tombol

| Jenis | Spek |
|---|---|
| Primary | Border 1px `--accent`, teks `--accent`, background `--accent-wash-10`. BUKAN solid fill. |
| Secondary | Border 1px `--divider`, teks `--text`, background transparan |
| Ghost | Tanpa border, teks `--accent` |
| Bahaya (Hapus) | Border `#c46a66`, teks `#f2a5a0` (dark) / border & teks `#b3261e` (light) |
| Focus semua elemen | `outline: 2px solid var(--accent); outline-offset: 2px` |

## 7. Pill status (kapsul, radius 999px, ikon 15px, padding 4px 12px 4px 8px, font 12.5px/600)

| Status | Dark: bg / teks / ring | Light: bg / teks / ring | Ikon |
|---|---|---|---|
| Hijau (Lunas, Aktif, Lengkap) | `#1d3325` / `#7fd489` / `#4a9a52` | `#d9f0da` / `#1d6b26` / `#308639` | check-circle (fill) |
| Hijau (Ditemukan) | sama hijau | sama hijau | arrow-circle-up (fill) |
| Amber (Belum lunas, Menunggu faktur) | `#33270f` / `#f0c27a` / `#c98f3d` | `#f8ecd7` / `#8a5200` / `#a45f00` | clock (fill) |
| Merah (Dihapus) | `#331717` / `#f2a5a0` / `#c46a66` | `#f9e0e0` / `#a02c25` / `#b3261e` | x-circle (fill) |
| Merah (Hilang) | sama merah | sama merah | arrow-circle-down (fill) |

Ring = `box-shadow: inset 0 0 0 1px <warna>`.

## 8. Banner info (di dalam card form)

- Background `--active-bg`, teks & ikon `--accent`, ring inset 1px `--accent`, radius 8px, padding 10px 14px, font 13px.
- Banner peringatan merah (mis. hapus perusahaan): background dark `#2a1a1c` / light `#f9e0e0`, ring `#c46a66`/`#b3261e`.

## 9. Dialog

- Backdrop: `rgba(13,18,29,0.78)` (dark) / `rgba(221,231,251,0.78)` (light) + `backdrop-filter: blur(6px)`.
- Panel: `--surface`, radius 12px, tanpa border, shadow besar.
- Header: padding 20px 24px, background sedikit lebih gelap dari panel (`rgba(13,18,29,0.40)` di dark / `rgba(221,231,251,0.40)` di light), border bawah `--divider`, ikon 40×40 kotak radius 8 background `--active-bg` ring `--accent` warna `--accent`.

## 10. Lain-lain

- Font: Plus Jakarta Sans; heading weight 500 (maks), body 400. Ikon: Phosphor.
- Radius: 8px kontrol, 12px card/dialog, 999px pill/chip.
- Background dekoratif: 2 lingkaran radial blur besar — dark: warna `#154dec` opacity 0.16 & `#14244a` opacity 0.7; light: `#b5d1ff`. Blur 190–210px.
- Tabel: header uppercase kecil `--text-faint`; baris hover `rgba(233,233,237,0.05)`; padding sel 13px 20px.
