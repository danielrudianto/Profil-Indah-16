import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatDrawer, MatDrawerContainer, MatDrawerContent, MatDrawerMode } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { SideNavService } from 'src/app/services/side-nav.service';
import { SidenavComponent } from 'src/app/components/sidenav/sidenav.component';
import { TopbarComponent } from 'src/app/components/topbar/topbar.component';
import {
  ROLE_NAV_BASE,
  ROLE_NAV_BASE_FALLBACK,
} from 'src/app/constants/role-landing.constant';

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
  imports: [
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
    private sideNavService: SideNavService
  ) {}

  isSideNavOpen$ = this.sideNavService.isOpen$;
  drawerMode: MatDrawerMode = 'side';
  navBase: string = ROLE_NAV_BASE_FALLBACK;
  nama: string = '';

  /** Benar ketika sebuah halaman anak sedang terbuka di outlet, misal /Settings. */
  adaAnak = false;

  ngOnInit(): void {
    const info = this.authService.getUserInfo();
    this.nama = info?.name ?? '';

    /*
      Peran yang belum punya subpohon — saat ini Gudang — mendapat awalan
      kosong, sehingga navigasinya tampil kosong. Itu memang keadaan
      sebenarnya; menampilkan menu milik peran lain hanya mengantar pengguna
      ke halaman yang akan ditolak server.
    */
    this.navBase =
      info?.role != null && ROLE_NAV_BASE[info.role]
        ? ROLE_NAV_BASE[info.role]
        : ROLE_NAV_BASE_FALLBACK;

    this.sideNavService.updateSideNavState(window.innerWidth);
  }

  get punyaNavigasi(): boolean {
    return this.navBase !== '';
  }
}
