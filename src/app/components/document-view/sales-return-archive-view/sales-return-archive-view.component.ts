import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';

/**
 * Tampilan BACA retur penjualan — dokumen, bukan formulir berbaju
 * kolom input. Hapus untuk administrator; menutup dengan 'deleted'
 * agar pemanggilnya menyegarkan daftar.
 */
@Component({
  selector: 'app-sales-return-archive-view',
  templateUrl: './sales-return-archive-view.component.html',
  styleUrls: ['./sales-return-archive-view.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class SalesReturnArchiveViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; noAction: boolean },
    private dialogRef: MatDialogRef<SalesReturnArchiveViewComponent>,
    private apiService: ApiService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private authService: AuthService,
    private translateService: TranslateService,
  ) {}

  isAdministrator = false;
  isSubmitting = false;
  isLoading = true;

  dokumen: any = null;
  jadwal: any = null;
  barang: any[] = [];

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.apiService
      .get('sales-return/' + this.data.id, {})
      .subscribe({
        next: (data: any) => {
          this.dokumen = {
            name: data.name,
            date: data.date,
            invoiceName: data.sales_invoice_code.name,
            invoiceDate: data.sales_invoice_code.date,
            customer:
              data.sales_invoice_code.customer == null
                ? null
                : data.sales_invoice_code.customer.name,
            sales:
              data.sales_invoice_code.sales == null
                ? 'INTERNAL'
                : data.sales_invoice_code.sales.toUpperCase(),
            isDelete: data.is_delete,
            paymentMethod:
              data.payment_method == null ? 'Cash' : data.payment_method.name,
            createdBy: data.user_sales_return_code_created_byTouser.name,
            createdAt: data.created_at,

            /* Pembagian nilai retur: berapa yang memotong tagihan dan berapa
               yang jadi kelebihan bayar. */
            potongTagihan: Number(data.receivable_value ?? 0),
            jadiKelebihan: Number(data.overpayment_value ?? 0),
          };

          /*
            Jadwal pengembaliannya — ke mana uangnya dikirim.

            Tersimpan pada baris kelebihan bayar, bukan pada dokumen retur.
            Petugas mengetik bank, nomor rekening, dan nama penerima di
            formulir retur, lalu membuka dokumennya dan tidak menemukan satu
            pun dari itu; yang tergambar hanya "Metode", yang menyebut kas
            mana yang berkurang, bukan rekening tujuannya.
          */
          this.jadwal = (data.overpayment ?? [])[0] ?? null;

          this.barang = (data.sales_return ?? []).map((x: any) => ({
            reference: x.sales_invoice.product.reference,
            description: x.sales_invoice.product.description,
            quantity: Number(x.quantity),
            unit:
              x.sales_invoice.product_unit == null
                ? x.sales_invoice.product.unit
                : x.sales_invoice.product_unit.unit,
            price: Number(x.sales_invoice.price),
            discount: Number(x.sales_invoice.discount),
          }));
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
    return (
      this.dokumen?.customer ??
      this.translateService.instant('sales-invoice__retail')
    );
  }

  get inisial(): string {
    return this.namaPelanggan.trim().charAt(0).toUpperCase() || '?';
  }

  get subtotal(): number {
    return this.barang.reduce(
      (a, b) => a + b.quantity * (b.price - b.discount),
      0,
    );
  }

  totalBaris(b: any): number {
    return b.quantity * (b.price - b.discount);
  }

  tutup(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('sales-return__delete__message'),
        },
      })
      .afterClosed()
      .subscribe((jawaban) => {
        if (jawaban == true) {
          this.isSubmitting = true;
          this.apiService
            .delete(`sales-return/${this.data.id}`)
            .subscribe({
              next: () => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'sales-return__delete__success',
                  ),
                );
                this.dialogRef.close('deleted');
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            })
            .add(() => {
              this.isSubmitting = false;
            });
        }
      });
  }
}
