import { DatePipe, DecimalPipe, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * Tampilan BACA kelebihan pembayaran — dokumen, bukan formulir
 * berbaju kolom input. Murni melihat: satu-satunya aksinya menutup.
 */
@Component({
  selector: 'app-overpayment-archive-view',
  templateUrl: './overpayment-archive-view.component.html',
  styleUrls: ['./overpayment-archive-view.component.scss'],
  imports: [NgIf, DecimalPipe, DatePipe, TranslatePipe],
})
export class OverpaymentArchiveViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dialogRef: MatDialogRef<OverpaymentArchiveViewComponent>,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  isLoading = true;
  dokumen: any = null;

  ngOnInit(): void {
    this.apiService
      .get(`overpayment/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.dokumen = {
            date: data.date,
            value: Number(data.value),
            customer: data.customer == null ? null : data.customer.name,
            paymentMethod:
              data.payment_method == null ? 'Cash' : data.payment_method.name,
            returnDate: data.return_payment_date,
            returnMethod: data.return_payment_method,
            returnName: data.return_payment_name,
            returnBank: data.return_payment_bank,
            returnNumber: data.return_payment_number,
          };
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

  get namaPelanggan(): string {
    return this.dokumen?.customer ?? 'Retail';
  }

  get inisial(): string {
    return this.namaPelanggan.trim().charAt(0).toUpperCase() || '?';
  }

  tutup(): void {
    this.dialogRef.close();
  }
}
