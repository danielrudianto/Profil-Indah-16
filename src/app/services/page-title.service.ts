import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, filter, map, startWith } from 'rxjs';
import { NAV_FOOTER, NAV_ITEMS } from 'src/app/constants/navigation.constant';

/**
 * Kunci i18n judul halaman yang sedang terbuka, untuk tag di topbar.
 *
 * DITURUNKAN DARI ALAMAT, bukan disetel satu per satu oleh tiap halaman.
 * Meminta setiap halaman mendaftarkan judulnya sendiri berarti menyunting
 * ratusan komponen, dan satu yang terlewat menampilkan judul halaman
 * SEBELUMNYA — keliru diam-diam, yang lebih buruk daripada kosong.
 *
 * Pencocokannya memilih jalur TERPANJANG yang cocok. Tanpa itu
 * /Administrator/Product-brand akan terbaca sebagai "Barang", karena
 * "/Product" memang potongan awal dari "/Product-brand".
 */
/** Keterangan tambahan yang boleh dipasang sebuah halaman ke topbar. */
export interface KonteksHalaman {
  /** Kunci i18n label tombol kembali; kosong berarti tidak ada. */
  kembaliLabel?: string;
  kembaliJalur?: string;
  /** Kunci i18n tag halaman, menggantikan yang diturunkan dari alamat. */
  tag?: string;
  /** Kunci i18n penanda mode di kanan, misalnya "Mode administrator". */
  mode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  private router = inject(Router);

  private judul = new BehaviorSubject<string | null>(null);

  /*
    Konteks halaman: jalan kembali, tag khusus, dan penanda mode.

    Diperlukan karena tag di topbar tidak selalu sama dengan nama menunya —
    formulir buat penerimaan berjudul "Penerimaan baru", bukan "Penerimaan
    Barang" — dan karena sebagian halaman punya wajah berbeda menurut peran
    yang perlu dinyatakan di layar.

    Dikosongkan sendiri pada setiap perpindahan halaman, jadi halaman yang
    memasangnya tidak perlu ingat membersihkannya.
  */
  private konteksSubject = new BehaviorSubject<KonteksHalaman | null>(null);

  get konteks$(): Observable<KonteksHalaman | null> {
    return this.konteksSubject.asObservable();
  }

  pasangKonteks(konteks: KonteksHalaman): void {
    this.konteksSubject.next(konteks);
  }

  get judul$(): Observable<string | null> {
    return this.judul.asObservable();
  }

  constructor() {
    this.router.events
      .pipe(
        filter(
          (peristiwa): peristiwa is NavigationEnd =>
            peristiwa instanceof NavigationEnd,
        ),
        map((peristiwa) => peristiwa.urlAfterRedirects),
        startWith(this.router.url),
        map((alamat) => this.cocokkan(alamat)),
      )
      .subscribe((kunci) => {
        this.konteksSubject.next(null);
        this.judul.next(kunci);
      });
  }

  private cocokkan(alamat: string): string | null {
    /* Buang parameter dan fragmen; keduanya tidak menentukan halaman. */
    const jalur = alamat.split(/[?#]/)[0].replace(/\/$/, '') || '/';

    /* Satu-satunya akar sekarang; keempat subpohon peran sudah digabung. */
    if (jalur === '/') {
      return 'nav__dashboard';
    }

    let terbaik: { kunci: string; panjang: number } | null = null;

    const timbang = (kunci: string, potongan: string) => {
      if (!jalur.includes(potongan)) return;
      if (terbaik != null && terbaik.panjang >= potongan.length) return;
      terbaik = { kunci, panjang: potongan.length };
    };

    for (const item of NAV_ITEMS) {
      timbang(item.label, `/${item.path}`);
    }

    /* Jalur kaki sudah lengkap dengan garis miring di depannya. */
    for (const item of NAV_FOOTER) {
      timbang(item.label, item.path);
    }

    return terbaik == null ? null : (terbaik as { kunci: string }).kunci;
  }
}
