import { Component, DestroyRef, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
  MatDrawerMode,
} from '@angular/material/sidenav';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { SideNavService } from 'src/app/services/side-nav.service';
import { SidenavComponent } from 'src/app/components/sidenav/sidenav.component';
import { TopbarComponent } from 'src/app/components/topbar/topbar.component';
import { NAV_ITEMS } from 'src/app/constants/navigation.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageBloomComponent } from 'src/app/components/page-bloom/page-bloom.component';
import { AdministratorDashboardComponent } from './administrator-dashboard/administrator-dashboard.component';

/**
 * Dashboard utama — layar pertama setelah masuk.
 *
 * Sebelumnya halaman ini adalah LAUNCHER: empat kartu peran yang harus diklik
 * lebih dulu sebelum pengguna sampai ke pekerjaannya. Desain meniadakannya.
 *
 * Yang menggantikannya bukan pengalihan, melainkan pemilihan: halaman ini
 * menentukan NAVIGASI MANA yang ditampilkan berdasarkan peran, lalu pengguna
 * bergerak dari situ. Alamatnya tetap '/', sehingga tidak ada lompatan alamat
 * yang membingungkan tepat setelah masuk.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [PageBloomComponent,
    AdministratorDashboardComponent,
    NgIf,
    AsyncPipe,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    RouterOutlet,
    SidenavComponent,
    TopbarComponent,
    TranslatePipe,
  ],
})
export class DashboardComponent {
  constructor(
    private authService: AuthService,
    private sideNavService: SideNavService,
    private router: Router,
  ) {}

  private destroyRef = inject(DestroyRef);

  isSideNavOpen$ = this.sideNavService.isOpen$;
  drawerMode: MatDrawerMode = 'side';
  nama: string = '';

  /**
   * Benar ketika sebuah halaman anak sedang terbuka di outlet.
   *
   * DITURUNKAN DARI ALAMAT, bukan dari peristiwa (activate) pada router-outlet.
   * Peristiwa itu menyala DI TENGAH pemeriksaan perubahan — setelah *ngIf yang
   * membacanya sudah diperiksa — sehingga Angular melemparkan NG0100 berulang
   * kali dan halamannya berhenti tergambar sama sekali. Alamatnya sudah pasti
   * sebelum pemeriksaan dimulai, jadi tidak ada nilai yang berubah di tengah
   * jalan.
   *
   * Sejak keempat subpohon peran digabung, SEMUA halaman adalah anak dashboard;
   * yang tidak punya anak hanyalah dashboard itu sendiri di alamat '/'.
   */
  adaAnak = false;

  ngOnInit(): void {
    const info = this.authService.getUserInfo();
    this.nama = info?.name ?? '';

    this.perbaruiAdaAnak(this.router.url);
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((peristiwa) => {
        if (peristiwa instanceof NavigationEnd) {
          this.perbaruiAdaAnak(peristiwa.urlAfterRedirects);
        }
      });

    this.sideNavService.updateSideNavState(window.innerWidth);
  }

  /**
   * Benar bila peran ini punya setidaknya satu menu.
   *
   * Dulu diturunkan dari ada-tidaknya subpohon rute milik perannya. Sejak
   * keempat subpohon digabung menjadi satu pohon, subpohon itu tidak ada lagi,
   * dan yang menentukan tinggal daftar menunya sendiri — saat ini hanya Gudang
   * yang kosong.
   */
  private perbaruiAdaAnak(alamat: string): void {
    const jalur = alamat.split(/[?#]/)[0].replace(/\/$/, '');
    this.adaAnak = jalur !== '' && jalur !== '/';
  }

  /** Peran 5 dan 7 mendapat dashboard 9c, bukan sekadar sapaan. */
  get adalahAdministrator(): boolean {
    return this.authService.isAdministrator();
  }

  get punyaNavigasi(): boolean {
    const peran = this.authService.getUserInfo()?.role;
    return (
      peran != null && NAV_ITEMS.some((item) => item.roles.includes(peran))
    );
  }
}
