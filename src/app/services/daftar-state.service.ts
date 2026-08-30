import { Injectable } from '@angular/core';

/**
 * Mengingat keadaan sebuah daftar selama orang bolak-balik ke rinciannya.
 *
 * Yang diingat cuma tiga hal: halaman keberapa, kata kunci apa, dan berapa
 * baris per halaman. Itulah yang harus diketik ulang orang setiap kali
 * tombol kembali memulangkannya ke halaman satu.
 *
 * INGATANNYA SENGAJA PENDEK. Ia hidup selama aplikasi terbuka dan hanya
 * dibaca oleh halaman rincian untuk mengembalikan orang ke tempatnya; begitu
 * seseorang masuk lagi lewat menu — yaitu alamat tanpa query param sama
 * sekali — daftarnya mulai bersih. Daftar yang mengingat kata kunci dari
 * setengah jam lalu justru membingungkan: orang membukanya, melihat tiga
 * baris, dan mengira datanya hilang.
 */
@Injectable({ providedIn: 'root' })
export class DaftarStateService {
  /** Kunci daftar piutang — dipakai halamannya dan rinciannya. */
  static readonly PIUTANG = 'piutang';

  /** Kunci antrean "menunggu faktur" — dipakai halamannya dan layar lengkapi. */
  static readonly FAKTUR_PEMBELIAN = 'faktur-pembelian';

  private simpanan = new Map<string, Record<string, string | number>>();

  simpan(kunci: string, keadaan: Record<string, string | number>): void {
    const bersih: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(keadaan)) {
      if (v !== null && v !== undefined && v !== '') {
        bersih[k] = v;
      }
    }
    this.simpanan.set(kunci, bersih);
  }

  ambil(kunci: string): Record<string, string | number> {
    return this.simpanan.get(kunci) ?? {};
  }

  lupakan(kunci: string): void {
    this.simpanan.delete(kunci);
  }
}
