/**
 * Palet aksen Nocturne.
 *
 * Nilainya disalin apa adanya dari berkas serah-terima desain
 * (design_handoff_nocturne_redesign, blok `palette`), bukan dihitung ulang.
 * Seluruh warna disusun pada lightness dan chroma yang sama di ruang OKLCH
 * (L 0.66 / C 0.125), sehingga bobot visualnya setara — perhitungan ulang
 * dengan cara lain akan merusak kesetaraan itu.
 *
 * TIAP AKSEN MEMBAWA EMPAT NILAI, dan itu bukan kemewahan:
 *
 *   base  dipakai sebagai aksen pada mode terang;
 *   tint  warna muda yang dicampurkan agar aksen tetap terbaca di atas ground
 *         gelap — desain melarang memakai `base` mentah pada mode gelap;
 *   d800  ground untuk keadaan aktif dan bidang dekoratif pada mode gelap;
 *   d900  LATAR mode gelap itu sendiri.
 *
 * Karena d900 menjadi latar, mengganti aksen tidak hanya mengubah warna tombol
 * — seluruh ground ikut bergeser mengikuti rona yang dipilih.
 */

export interface AccentColor {
  /** Kunci i18n untuk nama warnanya. */
  label: string;
  /** Aksen pada mode terang; sekaligus penanda pilihan yang tersimpan. */
  base: string;
  /** Warna muda pasangannya, dicampur untuk aksen pada mode gelap. */
  tint: string;
  /** Ground keadaan aktif pada mode gelap. */
  d800: string;
  /** Latar mode gelap. */
  d900: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { label: 'accent__blue', base: '#154dec', tint: '#b5d1ff', d800: '#223a70', d900: '#14244a' },
  { label: 'accent__forest', base: '#002b00', tint: '#bedabb', d800: '#2f442d', d900: '#1b2b1a' },
  { label: 'accent__violet', base: '#7160bd', tint: '#cfcaff', d800: '#3c365f', d900: '#262140' },
  { label: 'accent__azure', base: '#1f74bf', tint: '#acd5ff', d800: '#1e3f60', d900: '#0e2841' },
  { label: 'accent__purple', base: '#8559b2', tint: '#dcc5f9', d800: '#46335a', d900: '#2d1f3c' },
  { label: 'accent__magenta', base: '#9e4f98', tint: '#eec0e9', d800: '#512f4e', d900: '#361b33' },
  { label: 'accent__rose', base: '#b24866', tint: '#fdbdca', d800: '#5b2c38', d900: '#3d1923' },
  { label: 'accent__orange', base: '#b2511e', tint: '#fcc2a9', d800: '#5a301d', d900: '#3c1c0d' },
  { label: 'accent__amber', base: '#a45f00', tint: '#f1c99c', d800: '#54360d', d900: '#382102' },
  { label: 'accent__green', base: '#308639', tint: '#b3dfb3', d800: '#244626', d900: '#132d14' },
  { label: 'accent__emerald', base: '#008a5d', tint: '#a3e1c5', d800: '#0d4834', d900: '#012f1f' },
  { label: 'accent__teal', base: '#00898b', tint: '#95e1e0', d800: '#004848', d900: '#002f2f' },
  { label: 'accent__cyan', base: '#0082a9', tint: '#99ddf3', d800: '#004556', d900: '#002c39' },
  { label: 'accent__slate', base: '#71707d', tint: '#d0d0d9', d800: '#3d3c43', d900: '#26262b' },
];

/** Biru perusahaan; nilai bawaan panel desain. */
export const ACCENT_DEFAULT = ACCENT_COLORS[0];
