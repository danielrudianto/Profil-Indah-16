import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, filter, map, startWith } from 'rxjs';
import { NAV_FOOTER, NAV_ITEMS } from 'src/app/constants/navigation.constant';
import { ROLE_NAV_BASE } from 'src/app/constants/role-landing.constant';

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
@Injectable({
  providedIn: 'root',
})
export class PageTitleService {
  private router = inject(Router);

  /** Akar tiap shell peran; semuanya menampilkan dashboard. */
  private readonly akarShell = new Set(
    ['', ...Object.values(ROLE_NAV_BASE)].map((b) => `/${b}`),
  );

  private judul = new BehaviorSubject<string | null>(null);

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
      .subscribe((kunci) => this.judul.next(kunci));
  }

  private cocokkan(alamat: string): string | null {
    /* Buang parameter dan fragmen; keduanya tidak menentukan halaman. */
    const jalur = alamat.split(/[?#]/)[0].replace(/\/$/, '') || '/';

    if (this.akarShell.has(jalur) || jalur === '/') {
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
