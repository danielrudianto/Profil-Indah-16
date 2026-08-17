import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Konfirmasi tindakan yang tidak bisa dibatalkan — sistem desain Nocturne.
 *
 * KONTRAKNYA TIDAK BERUBAH dan dijaga enam belas pemanggil: dibuka dengan
 * data { title, header?, document? }, dan menutup dengan `true` HANYA
 * lewat tombol setuju — batal dan tekan latar mengirim undefined, dan
 * banyak pemanggil menggantungkan `hasil !== true` padanya.
 *
 * Panel Material-nya ditransparankan lewat aturan :has() di styles.scss,
 * jadi pemanggil tidak perlu menambahkan panelClass satu-satu.
 */
@Component({
  selector: 'app-delete-confirmation',
  templateUrl: './delete-confirmation.component.html',
  styleUrls: ['./delete-confirmation.component.scss'],
  imports: [NgIf, TranslatePipe],
})
export class DeleteConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DeleteConfirmationComponent>,
  ) {}

  batal(): void {
    this.dialogRef.close();
  }

  setuju(): void {
    this.dialogRef.close(true);
  }
}
