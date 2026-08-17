import { Component, Inject } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Riwayat pembayaran satu faktur — baca saja.
 *
 * Datanya DIKIRIM PEMANGGIL dari baris yang sudah dimuat, bukan diambil
 * lagi dari server: GET /receivable/history/:id sudah dihapus, dan dialog
 * lamanya selalu gagal memuat lalu menutup dirinya sendiri. Tombol hapus
 * pembayaran ikut hilang — DELETE /receivable/:id sama matinya.
 */
@Component({
  selector: 'app-receivable-payment-history',
  templateUrl: './receivable-payment-history.component.html',
  styleUrls: ['./receivable-payment-history.component.scss'],
  imports: [DialogShellComponent, NgIf, NgFor, DecimalPipe, DatePipe, TranslatePipe],
})
export class ReceivablePaymentHistoryComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { name: string; payments: any[] },
    private dialogRef: MatDialogRef<ReceivablePaymentHistoryComponent>,
  ) {}

  get total(): number {
    return this.data.payments.reduce((a, b) => a + Number(b.value), 0);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
