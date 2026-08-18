import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * Pemegang deposit terbuka satu produk — tampilan baca.
 *
 * Dibuka dari kartu deposit di halaman kartu stok: angka totalnya berhak
 * dirinci menjadi SIAPA memegang BERAPA. Terbuka berarti setorannya belum
 * menjadi faktur dan belum dibatalkan; setoran tanpa pelanggan tampil
 * sebagai Retail, mengikuti kebiasaan daftar faktur.
 */
@Component({
  selector: 'app-deposit-list-dialog',
  templateUrl: './deposit-list-dialog.component.html',
  styleUrls: ['./deposit-list-dialog.component.scss'],
  imports: [NgIf, NgFor, DecimalPipe, DatePipe, TranslatePipe],
})
export class DepositListDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { productID: number; reference: string },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<DepositListDialogComponent>,
  ) {}

  isLoading = true;
  baris: {
    document: string;
    date: string;
    customer: string | null;
    quantity: number;
    unit: string | null;
  }[] = [];

  get total(): number {
    return this.baris.reduce((jumlah, b) => jumlah + b.quantity, 0);
  }

  ngOnInit(): void {
    this.apiService
      .get(`sales-deposit/product/${this.data.productID}`)
      .subscribe({
        next: (data: any) => {
          this.baris = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialogRef.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  tutup(): void {
    this.dialogRef.close();
  }
}
