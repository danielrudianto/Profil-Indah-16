import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { CircleAvatarComponent } from 'src/app/components/circle-avatar/circle-avatar.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Kredensial pengguna baru — SEKALI TAMPIL.
 *
 * Kata sandinya dibuat server dan tidak pernah disimpan dalam bentuk yang
 * bisa dibaca lagi, jadi dialog ini satu-satunya kesempatan mencatatnya.
 * disableClose dipasang pemanggil, dan tombol Batal disembunyikan: tidak
 * ada apa pun untuk dibatalkan — akunnya sudah jadi.
 *
 * `data.role` adalah TEKS nama jabatan; backend menerjemahkan role_id
 * sebelum membalas, jadi tidak perlu memetakan ulang di sini.
 *
 * Dipakai DUA pintu: sesudah membuat akun, dan sesudah administrator
 * me-reset sandi pengguna yang lupa (data.mode === 'reset'). Bedanya cuma
 * judul — isinya memang harus sama, sama-sama serah terima kredensial.
 */
@Component({
  selector: 'app-user-create-status',
  templateUrl: './user-create-status.component.html',
  styleUrls: ['./user-create-status.component.scss'],
  imports: [DialogShellComponent, CircleAvatarComponent, TranslatePipe],
})
export class UserCreateStatusComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clipboard: Clipboard,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<UserCreateStatusComponent>,
  ) {}

  get judul(): string {
    return this.data?.mode === 'reset'
      ? 'user__reset__title'
      : 'user__status__title';
  }

  salinSatu(nilai: string | undefined): void {
    if (!nilai) {
      return;
    }
    this.clipboard.copy(nilai);
    this.alertService.showSuccess(
      this.translateService.instant('user__status__copied-one'),
    );
  }

  /** Salinan utuh untuk diserahkan langsung kepada pemilik akunnya. */
  salin(): void {
    this.clipboard.copy(
      `Nama: ${this.data?.name}\r\nUsername: ${this.data?.username}\r\nNIK: ${this.data?.nik}\r\nPassword: ${this.data?.password}`,
    );
    this.alertService.showSuccess(
      this.translateService.instant('user__status__copied'),
    );
  }

  selesai(): void {
    this.dialogRef.close();
  }
}
