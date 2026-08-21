export enum KEY_CODE {
  // only need the numbers
  ZERO = 48,
  NINE = 57,
  NUMPAD_ZERO = 96,
  NUMPAD_NINE = 105,
  ENTER = 13,
  NUMPAD_ENTER = 13,

  // only need the numpad numbers
}

/**
 * Tag yang tetap boleh menerima pintasan papan tik.
 *
 * angular2-hotkeys memblokir setiap pintasan yang ditekan saat fokus berada di
 * INPUT, SELECT, atau TEXTAREA — kecuali tag itu disebut pada argumen ketiga
 * `new Hotkey(...)`. Bawaannya larik kosong, sehingga pintasan yang tidak
 * mengisinya tampak "tidak jalan" justru pada saat orang paling
 * membutuhkannya: sedang mengetik di dalam formulir.
 *
 * Dipakai HANYA untuk pintasan berpengubah (alt+…). Pintasan huruf tunggal
 * seperti `f` atau `p` sengaja dibiarkan terblokir — mengizinkannya di dalam
 * kolom isian berarti mengetik huruf "p" ikut mencetak dokumen.
 */
export const KOLOM_ISIAN = ['INPUT', 'SELECT', 'TEXTAREA'];
