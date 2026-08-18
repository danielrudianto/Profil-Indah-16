import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Dialog konfirmasi setuju — kembaran delete-confirmation dalam varian
 * aksen. Dulu berkulit Material polos (putih, Poppins) dan dipakai di
 * banyak tempat termasuk penjaga keluar-tanpa-simpan, sampai pemiliknya
 * menyebut rupanya busuk.
 */
@Component({
  selector: 'app-submit-confirmation',
  templateUrl: './submit-confirmation.component.html',
  styleUrls: ['./submit-confirmation.component.scss'],
  imports: [NgIf, TranslatePipe],
})
export class SubmitConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SubmitConfirmationComponent>,
  ) {}

  batal(): void {
    this.dialog.close(false);
  }

  deleteDocument(): void {
    this.dialog.close(true);
  }
}
