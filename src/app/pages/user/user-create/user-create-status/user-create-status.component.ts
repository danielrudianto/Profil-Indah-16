import { Component, Inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Kredensial pengguna baru — SEKALI TAMPIL.
 *
 * Kata sandinya dibuat server dan tidak pernah disimpan dalam bentuk yang
 * bisa dibaca lagi, jadi dialog ini satu-satunya kesempatan mencatatnya.
 * disableClose dipasang pemanggil: menutupnya harus lewat tombol, bukan
 * tak sengaja menekan latar.
 */
@Component({
  selector: 'app-user-create-status',
  templateUrl: './user-create-status.component.html',
  styleUrls: ['./user-create-status.component.scss'],
  imports: [DialogShellComponent, NgFor, TranslatePipe],
})
export class UserCreateStatusComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private clipboard: Clipboard,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<UserCreateStatusComponent>,
  ) {}

  get baris(): { kunci: string; nilai: string }[] {
    return [
      { kunci: 'user__create__name', nilai: this.data?.name ?? '' },
      { kunci: 'user__create__username', nilai: this.data?.username ?? '' },
      { kunci: 'user__create__nik', nilai: this.data?.nik ?? '' },
      { kunci: 'user__create__role', nilai: this.data?.roleText ?? '' },
    ];
  }

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
