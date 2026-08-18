import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ModeTampilan,
  SettingsService,
} from 'src/app/services/settings.service';
import { LanguageService } from 'src/app/services/language.service';
import {
  ACCENT_COLORS,
  ACCENT_DEFAULT,
  AccentColor,
} from 'src/app/constants/accent-color.constant';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';
import { CircleAvatarComponent } from 'src/app/components/circle-avatar/circle-avatar.component';
import { SetAvatarComponent } from 'src/app/pages/set-avatar/set-avatar.component';
import { ResetPasswordDialogComponent } from 'src/app/pages/profile-overview/reset-password-dialog/reset-password-dialog.component';

/**
 * Halaman pengaturan tampilan.
 *
 * Dibuat bersamaan dengan dikeluarkannya pemilih aksen dari topbar. Tanpa
 * halaman ini keempat belas warna itu tidak punya pintu masuk sama sekali —
 * fiturnya masih ada di kode tetapi tidak bisa dijangkau siapa pun.
 *
 * Semua pilihan di sini berlaku SEKETIKA dan tersimpan sendiri lewat
 * SettingsService; tidak ada tombol simpan. Pilihan yang hasilnya langsung
 * terlihat di layar tidak perlu dikonfirmasi — pengguna sudah melihat
 * akibatnya sebelum sempat menekan tombol apa pun.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [NgFor, NgIf, TranslatePipe, AvatarComponent, CircleAvatarComponent],
})
export class SettingsComponent implements OnInit {
  constructor(
    private settingsService: SettingsService,
    private languageService: LanguageService,
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  /** Avatar pengguna, atau null bila ia belum pernah mengaturnya. */
  avatar: any = null;

  /** Dipakai lingkaran inisial ketika avatarnya belum ada. */
  nama = '';

  /**
   * Membuka pengatur avatar.
   *
   * Dialognya SAMA dengan yang dipakai halaman profil, bukan salinan baru:
   * dua pengatur untuk satu hal adalah dua yang cepat atau lambat berbeda.
   * Sesudah ditutup, pratinjaunya dibaca ulang supaya perubahannya langsung
   * terlihat tanpa perlu memuat ulang halaman.
   */
  /** Ganti sandi memakai dialog yang sama dengan halaman profil. */
  gantiSandi(): void {
    this.dynamicComponentService.createDynamicComponent(
      ResetPasswordDialogComponent,
      {},
    );
  }

  aturAvatar(): void {
    this.dynamicComponentService
      .createDynamicComponent(SetAvatarComponent, {})
      .subscribe(() => {
        this.avatar = this.authService.getSelfAvatar();
      });
  }

  private destroyRef = inject(DestroyRef);

  readonly warna: AccentColor[] = ACCENT_COLORS;

  aksenSekarang: AccentColor = ACCENT_DEFAULT;
  mode: ModeTampilan = 'light';
  bahasa: string = '';

  ngOnInit(): void {
    this.avatar = this.authService.getSelfAvatar();
    this.nama = this.authService.getUserInfo()?.name ?? '';

    this.settingsService.accent
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((warna) => (this.aksenSekarang = warna));

    this.settingsService.mode
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => (this.mode = mode));

    this.languageService.currentLanguage
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bahasa) => (this.bahasa = bahasa));
  }

  lacakWarna = (_: number, warna: AccentColor): string => warna.label;

  pilihAksen(warna: AccentColor): void {
    this.settingsService.setAccent(warna);
  }

  pilihMode(mode: ModeTampilan): void {
    this.settingsService.setMode(mode);
  }

  pilihBahasa(bahasa: string): void {
    this.languageService.switchLanguage(bahasa);
  }
}
