import { DatePipe, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Cara menghitung rekomendasi stok minimum — tampilan baca.
 *
 * Dibuka dari banner laporan barang kurang: angka "Min. disarankan"
 * tidak boleh jadi kotak hitam. Isinya statis — rumus reorder point
 * dan parameternya dikirim dari meta endpoint, bukan di-hardcode,
 * supaya banner dan dialog selalu menceritakan hitungan yang sama.
 */
@Component({
  selector: 'app-minimum-stock-info-dialog',
  templateUrl: './minimum-stock-info-dialog.component.html',
  styleUrls: ['./minimum-stock-info-dialog.component.scss'],
  imports: [NgIf, DatePipe, TranslatePipe],
})
export class MinimumStockInfoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      lastCalculated: string | null;
      windowDays: number;
      leadDays: number;
      serviceLevel: number;
    },
    private dialogRef: MatDialogRef<MinimumStockInfoDialogComponent>,
  ) {}

  tutup(): void {
    this.dialogRef.close();
  }
}
