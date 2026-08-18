import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';

/**
 * Tampilan BACA hasil promosi — dokumen, bukan formulir berbaju input.
 *
 * Dulu dua nominalnya tampil sebagai kolom isian bertopeng di dalam
 * akordeon Material, dan daftar barangnya bersembunyi di panel kedua yang
 * harus diklik dulu. Kini kisi baca biasa dan tabel yang langsung terlihat.
 * Unduhan Excel dipertahankan persis, naik dari menu tersembunyi ke kaki
 * dialog.
 */
@Component({
  selector: 'app-promotion-result',
  templateUrl: './promotion-result.component.html',
  styleUrls: ['./promotion-result.component.scss'],
  imports: [NgIf, NgFor, DecimalPipe, TranslatePipe],
})
export class PromotionResultComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private excelService: ExcelService,
    private dialog: MatDialogRef<PromotionResultComponent>,
    private alertService: AlertService,
    private translateService: TranslateService,
  ) {}

  isLoading = true;
  isDownloading = false;

  hasil = { sales: 0, purchase: 0 };
  barang: {
    reference: string;
    description: string;
    merek: string;
    tipe: string;
  }[] = [];

  ngOnInit(): void {
    this.fetchPromotionResult();
  }

  tutup(): void {
    this.dialog.close();
  }

  fetchPromotionResult() {
    this.isLoading = true;
    this.apiService
      .get(`promotion/result/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.hasil = {
            sales: data.result.sales,
            purchase: data.result.purchase,
          };
          this.barang = data.products.map((x: any) => ({
            reference: x.reference,
            description: x.description,
            merek: x.product_brand.name,
            tipe: x.product_type.name,
          }));
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialog.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  downloadReport(type: 'sales' | 'purchase') {
    this.isDownloading = true;
    if (type == 'sales') {
      this.apiService
        .get(`promotion/result/sales/${this.data.id}`)
        .subscribe({
          next: (data: any) => {
            /*
              Urutan lamanya menukar kolom Customer dan Reference —
              header bilang satu hal, isinya hal lain. Di sini disejajarkan.
            */
            this.excelService
              .unduh('Hasil_promosi_penjualan_' + this.data.id, [
                {
                  nama: 'Sales',
                  judul: 'Hasil promosi — sales',
                  kolom: [
                    { judul: 'Date', format: 'tanggal' },
                    { judul: 'Name', lebar: 24 },
                    { judul: 'Customer', lebar: 28 },
                    { judul: 'Reference', lebar: 18 },
                    { judul: 'Quantity', format: 'angka' },
                    { judul: 'Price', format: 'uang' },
                    { judul: 'Discount', format: 'uang' },
                    { judul: 'Unit', lebar: 10 },
                  ],
                  baris: (data.data as any[]).map((x) => [
                    new Date(x.date),
                    x.name,
                    x.customer,
                    x.reference,
                    x.quantity,
                    x.price,
                    x.discount,
                    x.unit,
                  ]),
                },
              ])
              .then(() => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'promotion__result__download__success',
                  ),
                );
              });
          },
          error: (error) => {
            this.alertService.showError(error);
          },
        })
        .add(() => {
          this.isDownloading = false;
        });
    }

    if (type == 'purchase') {
      this.apiService
        .get(`promotion/result/purchase/${this.data.id}`)
        .subscribe({
          next: (data: any) => {
            /*
              Urutan lamanya menukar kolom Supplier dan Reference —
              header bilang satu hal, isinya hal lain. Di sini disejajarkan.
            */
            this.excelService
              .unduh('Hasil_promosi_pembelian_' + this.data.id, [
                {
                  nama: 'Purchase',
                  judul: 'Hasil promosi — purchase',
                  kolom: [
                    { judul: 'Date', format: 'tanggal' },
                    { judul: 'Name', lebar: 24 },
                    { judul: 'Supplier', lebar: 28 },
                    { judul: 'Reference', lebar: 18 },
                    { judul: 'Quantity', format: 'angka' },
                    { judul: 'Price', format: 'uang' },
                    { judul: 'Discount', format: 'uang' },
                    { judul: 'Unit', lebar: 10 },
                  ],
                  baris: (data.data as any[]).map((x) => [
                    new Date(x.date),
                    x.name,
                    x.supplier,
                    x.reference,
                    x.quantity,
                    x.price,
                    x.discount,
                    x.unit,
                  ]),
                },
              ])
              .then(() => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'promotion__result__download__success',
                  ),
                );
              });
          },
          error: (error) => {
            this.alertService.showError(error);
          },
        })
        .add(() => {
          this.isDownloading = false;
        });
    }
  }
}
