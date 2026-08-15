import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { SideNavService } from 'src/app/services/side-nav.service';
import { DarkModeSelectorComponent } from './dark-mode-selector/dark-mode-selector.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { CircleAvatarComponent } from '../circle-avatar/circle-avatar.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';

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
    TranslatePipe,
    DarkModeSelectorComponent,
    LanguageSelectorComponent,
    CircleAvatarComponent,
    AvatarComponent,
    ProfileDialogComponent,
  ],
})
export class TopbarComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private sideNavService: SideNavService,
    private pageTitleService: PageTitleService,
  ) {}

  private destroyRef = inject(DestroyRef);

  isProfileOpened: boolean = false;
  isAvatarAvailable: boolean = false;
  avatar: any = null;
  name: string = '';
  roleText: string = '';

  /** Kunci i18n judul halaman aktif, atau null bila alamatnya tidak dikenali. */
  judulHalaman: string | null = null;

  ngOnInit(): void {
    this.pageTitleService.judul$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((kunci) => (this.judulHalaman = kunci));

    const avatar = this.authService.getSelfAvatar();
    if (avatar != null) {
      this.isAvatarAvailable = true;
      this.avatar = avatar;
    }

    const userInfo = this.authService.getUserInfo();
    this.name = userInfo?.name ?? '';
    this.roleText = userInfo?.roleText ?? '';
  }

  toggleSideNav(): void {
    this.sideNavService.toggle();
  }

  logout() {
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/Login']);
    }, 500);
  }

  navigateToProfile() {
    setTimeout(() => {
      this.router.navigate(['/Profile']);
    }, 500);
  }
}
