import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { PageTitleService } from 'src/app/services/page-title.service';
import { SalesInvoiceViewComponent } from 'src/app/components/document-view/sales-invoice-view/sales-invoice-view.component';
import { ReceivablePaymentCreateComponent } from './receivable-payment-create/receivable-payment-create.component';

/**
 * Piutang satu pelanggan — faktur yang belum lunas beserta sisanya.
 *
 * Klik baris membuka view faktur, dan riwayat pembayaran dibaca DI SANA
 * — dialog view faktur memuat daftar pembayarannya sendiri. Dialog
 * riwayat yang berdiri sendiri karena itu dihapus; aksi per baris
 * tinggal satu: tambah pembayaran.
 */
@Component({
  selector: 'app-receivable-view',
  templateUrl: './receivable-view.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
  ],
})
export class ReceivableViewComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
  ) {}

  isLoading = true;
  namaPelanggan = '';
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;

  /**
   * Total SELURUH faktur pelanggan ini, dihitung server. Menjumlah
   * dataSource saja pernah membuat header berbunyi Rp 184 juta untuk
   * pelanggan yang di daftar tertulis Rp 260 juta — halamannya cuma
   * memuat 10 dari 20 faktur.
   */
  totalPiutang = 0;

  ngOnInit(): void {
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'receivable__title',
      kembaliJalur: '/Receivable',
    });

    const id = this.route.snapshot.params['id'];
    if (id != 0) {
      this.apiService.get(`customer/${id}`).subscribe({
        next: (data: any) => {
          this.namaPelanggan = data.name;
        },
      });
    }

    this.ambilData();
  }

  ambilData(page: number = this.page): void {
    this.page = page;
    this.isLoading = true;
    this.apiService
      .get(`receivable/customer/${this.route.snapshot.params['id']}`, {
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
          this.totalPiutang = Number(data.total ?? 0);
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Receivable']);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  bukaHalaman(halaman: number): void {
    this.ambilData(halaman);
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.ambilData(1);
  }

  lacakFaktur = (_: number, item: any): number => item.id;

  /* ---------------------------------------------------------------- */
  /* Nilai per faktur                                                  */
  /* ---------------------------------------------------------------- */

  nilai(item: any): number {
    const barang = (item.sales_invoice ?? []).reduce(
      (a: number, b: any) => a + (b.price - b.discount) * b.quantity,
      0,
    );
    return (
      barang +
      Number(item.delivery ?? 0) +
      Number(item.service ?? 0) -
      Number(item.discount ?? 0)
    );
  }

  terbayar(item: any): number {
    return (item.sales_invoice_payment ?? []).reduce(
      (a: number, b: any) => a + Number(b.value),
      0,
    );
  }

  sisa(item: any): number {
    return this.nilai(item) - this.terbayar(item);
  }

  /* ---------------------------------------------------------------- */
  /* Aksi per faktur                                                   */
  /* ---------------------------------------------------------------- */

  lihatFaktur(item: any): void {
    this.dialog.open(SalesInvoiceViewComponent, {
      data: { id: item.id, noAction: true },
    });
  }

  bayar(item: any): void {
    this.dialog
      .open(ReceivablePaymentCreateComponent, {
        data: { id: item.id, max: this.sisa(item) },
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (!data) {
          return;
        }

        this.alertService.showSuccess(
          this.translateService.instant('receivable__success__message'),
        );

        /*
          Faktur yang lunas hilang dari piutang; muat ulang dari server
          supaya baris dan totalnya menyatakan hal yang sama.
        */
        this.ambilData();
      });
  }

  kembali(): void {
    this.router.navigate(['/Receivable']);
  }
}
