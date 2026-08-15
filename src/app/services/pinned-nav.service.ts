import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Menu yang disematkan pengguna.
 *
 * DISIMPAN DI PERAMBAN, PER PENGGUNA. Belum ada tabelnya di server, jadi
 * pilihan ini tidak ikut berpindah ketika pengguna membuka aplikasi dari
 * komputer lain. Itu batasan yang disengaja untuk sekarang: menyematkan menu
 * adalah kenyamanan, bukan data usaha, dan menambah tabel hanya untuk itu
 * berarti menambah migrasi, endpoint, dan penjagaan yang harus ikut dirawat.
 *
 * Kuncinya dibubuhi nama pengguna. Satu komputer di toko dipakai bergantian,
 * dan tanpa pembeda itu sematan kasir akan muncul di navigasi orang berikutnya
 * yang masuk.
 *
 * Yang disimpan adalah `path` dari NavItem, bukan labelnya: label bisa berubah
 * kapan saja karena ia kunci terjemahan, sedangkan jalur menandai halaman yang
 * sama sepanjang rutenya tidak dipindah.
 */
@Injectable({
  providedIn: 'root',
})
export class PinnedNavService {
  private authService = inject(AuthService);

  private readonly AWALAN = 'nav_pinned';

  private tersemat = new BehaviorSubject<string[]>(this.baca());

  /** Daftar jalur yang sedang disematkan, berurutan sesuai waktu disematkan. */
  get pinned$(): Observable<string[]> {
    return this.tersemat.asObservable();
  }

  get pinned(): string[] {
    return this.tersemat.value;
  }

  isPinned(path: string): boolean {
    return this.tersemat.value.includes(path);
  }

  toggle(path: string): void {
    const sekarang = this.tersemat.value;
    const berikutnya = sekarang.includes(path)
      ? sekarang.filter((p) => p !== path)
      : [...sekarang, path];

    this.tersemat.next(berikutnya);
    this.simpan(berikutnya);
  }

  /**
   * Dipanggil setelah pengguna berganti — pemilik kuncinya ikut berganti.
   */
  muatUlang(): void {
    this.tersemat.next(this.baca());
  }

  private get kunci(): string {
    const pengguna = this.authService.getUserInfo()?.username;
    return pengguna ? `${this.AWALAN}:${pengguna}` : this.AWALAN;
  }

  private baca(): string[] {
    try {
      const isi = localStorage.getItem(this.kunci);
      if (isi == null) {
        return [];
      }

      const hasil = JSON.parse(isi);
      return Array.isArray(hasil)
        ? hasil.filter((p): p is string => typeof p === 'string')
        : [];
    } catch {
      /*
        Isi yang rusak diperlakukan sebagai belum ada sematan. Melempar di sini
        akan menjatuhkan seluruh navigasi hanya karena satu baris preferensi.
      */
      return [];
    }
  }

  private simpan(daftar: string[]): void {
    try {
      localStorage.setItem(this.kunci, JSON.stringify(daftar));
    } catch {
      /*
        Penyimpanan peramban bisa penuh atau ditolak (mode penyamaran ketat).
        Sematannya tetap berlaku selama sesi ini; yang hilang hanya
        keawetannya, dan itu tidak sepadan dengan menggagalkan klik pengguna.
      */
    }
  }
}
