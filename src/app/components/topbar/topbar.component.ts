import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgIf } from '@angular/common';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import {
  KonteksHalaman,
  PageTitleService,
} from 'src/app/services/page-title.service';
import { SideNavService } from 'src/app/services/side-nav.service';
import { VersionService } from 'src/app/services/version.service';
import { DarkModeSelectorComponent } from './dark-mode-selector/dark-mode-selector.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { CircleAvatarComponent } from '../circle-avatar/circle-avatar.component';
import { AvatarComponent } from '../avatar/avatar.component';

/**
 * Topbar — sistem desain Nocturne.
 *
 * Tombol hamburgernya kini berbicara LANGSUNG ke SideNavService, bukan lewat
 * @Output yang harus disambungkan ulang di setiap shell. Sebelumnya hanya
 * shell Sales yang menyambungkannya, sehingga tombol yang sama tidak berbuat
 * apa-apa di shell lain — perbedaan yang tidak pernah disengaja, hanya
 * terlewat ketika templatenya disalin.
 *
 * PEMILIH AKSEN TIDAK LAGI DI SINI. Tempatnya di halaman pengaturan bersama
 * pilihan tampilan lain; baris atas ini dipakai sepanjang hari untuk bekerja,
 * dan warna adalah sesuatu yang dipilih sekali lalu dilupakan.
 */
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  imports: [
    NgIf,
    DatePipe,
    TranslatePipe,
    DarkModeSelectorComponent,
    LanguageSelectorComponent,
    RouterLink,
    CircleAvatarComponent,
    AvatarComponent,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
})
export class TopbarComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private sideNavService: SideNavService,
    private pageTitleService: PageTitleService,
    private versionService: VersionService,
  ) {}

  private destroyRef = inject(DestroyRef);

  /* Versi aplikasi di kaki menu profil; lihat VersionService. */
  versi = '';
  dibangun: Date | null = null;
  adaVersiBaru = false;

  isAvatarAvailable: boolean = false;
  avatar: any = null;
  name: string = '';

  /**
   * Baris kedua kartu profil.
   *
   * Berkas desain meminta SUREL di sini. Catatan pengguna di sistem ini tidak
   * menyimpan surel — tabel user hanya punya name dan username — jadi yang
   * ditampilkan username, data terdekat yang benar-benar ada. Bukan peran:
   * push #16 justru melepas pengumuman peran dari baris atas.
   */
  subJudul: string = '';

  /** Kunci i18n judul halaman aktif, atau null bila alamatnya tidak dikenali. */
  judulHalaman: string | null = null;

  /** Jalan kembali, tag khusus, dan penanda mode yang dipasang halaman. */
  konteks: KonteksHalaman | null = null;

  ngOnInit(): void {
    this.versionService.versi
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => (this.versi = v));

    this.versionService.dibangun
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((d) => (this.dibangun = d));

    this.versionService.adaVersiBaru
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ada) => (this.adaVersiBaru = ada));

    this.pageTitleService.judul$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((kunci) => (this.judulHalaman = kunci));

    this.pageTitleService.konteks$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((k) => (this.konteks = k));

    const avatar = this.authService.getSelfAvatar();
    if (avatar != null) {
      this.isAvatarAvailable = true;
      this.avatar = avatar;
    }

    const userInfo = this.authService.getUserInfo();
    this.name = userInfo?.name ?? '';
    this.subJudul = userInfo?.roleText ?? userInfo?.username ?? '';
  }

  toggleSideNav(): void {
    this.sideNavService.toggle();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/Login']);
  }

  bukaPengaturan() {
    this.router.navigate(['/Settings']);
  }

  muatUlang(): void {
    this.versionService.muatUlang();
  }
}
