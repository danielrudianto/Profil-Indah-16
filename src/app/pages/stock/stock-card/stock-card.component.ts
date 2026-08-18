import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SalesReturnArchiveViewComponent } from 'src/app/components/document-view/sales-return-archive-view/sales-return-archive-view.component';
import { SalesInvoiceViewComponent } from 'src/app/components/document-view/sales-invoice-view/sales-invoice-view.component';
import { GoodReceiptViewComponent } from 'src/app/components/document-view/good-receipt-view/good-receipt-view.component';
import { AdjustmentCaseViewComponent } from 'src/app/components/document-view/adjustment-case-view/adjustment-case-view.component';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { DepositListDialogComponent } from './deposit-list-dialog/deposit-list-dialog.component';

/**
 * Kartu stok satu produk — riwayat mutasi tersimpan, berhalaman dari
 * server. Bentuknya pola list-page seperti daftar lain; klik baris
 * membuka dokumen yang mencatat mutasinya (faktur, penerimaan,
 * penyesuaian, atau retur).
 */
@Component({
  selector: 'app-stock-card',
  templateUrl: './stock-card.component.html',
  styleUrls: ['./stock-card.component.scss'],
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
export class StockCardComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  isLoadingCard: boolean = false;
  isLoadingData: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  productDataSource: any = null;
  id: number | null = null;

  /**
   * Posisi stok kini — diambil dari saldo baris TERBARU kartu (halaman
   * pertama, urutan menurun). Payload produk tidak membawa angka stok,
   * dan halaman lama menampilkan ruas `deposit` yang tidak pernah
   * dikirim siapa pun — kotaknya selamanya kosong.
   */
  stokKini: number | null = null;

  /*
    Deposit terbuka produk ini — jumlah yang sudah dibayar pelanggan dan
    belum diambil. Kotak lamanya berlabel Deposit tetapi berisi stok kini;
    sekarang keduanya punya kotak masing-masing, dan angka depositnya bisa
    diklik untuk melihat siapa memegang berapa.
  */
  depositTerbuka: number | null = null;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.params['id']);

    this.fetchProduct();
    this.fetchStockCard(1);
    this.fetchDeposit();
  }

  fetchDeposit(): void {
    this.apiService.get(`sales-deposit/product/${this.id}`).subscribe({
      next: (data: any) => {
        this.depositTerbuka = (data as any[]).reduce(
          (jumlah, b) => jumlah + Number(b.quantity),
          0,
        );
      },
      /* Kotak deposit diam di "—" bila gagal; kartunya tetap berguna. */
      error: () => {},
    });
  }

  bukaDeposit(): void {
    this.dialog.open(DepositListDialogComponent, {
      data: {
        productID: this.id,
        reference: this.productDataSource?.reference ?? '',
      },
    });
  }

  fetchStockCard(page: number = this.page) {
    this.page = page;
    this.isLoadingCard = true;
    const id = Number(this.route.snapshot.params['id']);
    this.apiService
      .get(`product-stock/${id}`, {
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;

          if (this.page === 1 && data.data.length > 0) {
            const teratas = data.data[0];
            this.stokKini =
              teratas.stock == null ? null : Number(teratas.stock);
          }
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingCard = false;
      });
  }

  fetchProduct() {
    this.isLoadingData = true;
    const id = Number(this.route.snapshot.params['id']);
    this.apiService
      .get(`product/${id}`)
      .subscribe({
        next: (data) => {
          this.productDataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingData = false;
      });
  }

  viewDocument(data: any) {
    if (data.sales_return_code_id != null) {
      this.dialog.open(SalesReturnArchiveViewComponent, {
        data: {
          id: data.sales_return_code_id,
        },
      });
      return;
    }

    if (data.sales_invoice_code_id != null) {
      this.dialog.open(SalesInvoiceViewComponent, {
        data: {
          id: data.sales_invoice_code_id,
          noAction: true,
        },
      });
    }

    if (data.good_receipt_code_id != null) {
      this.dialog.open(GoodReceiptViewComponent, {
        data: {
          id: data.good_receipt_code_id,
        },
      });
    }

    if (data.adjustment_case_code_id != null) {
      this.dialog.open(AdjustmentCaseViewComponent, {
        data: {
          id: data.adjustment_case_code_id,
          noAction: true,
        },
      });
    }
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.fetchStockCard(1);
  }

  /*
    Lawan transaksi baris: supplier untuk barang masuk, pelanggan untuk
    barang keluar, Retail untuk faktur tanpa pelanggan, INTERNAL untuk
    mutasi yang memang tidak berlawan (penyesuaian dsb.).
  */
  lawanBaris(item: any): string {
    return (
      item.supplier?.name ??
      item.customer?.name ??
      (item.sales_invoice_code_id != null ? 'Retail' : 'INTERNAL')
    );
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  lacak = (_: number, item: any): number => item.id ?? 0;

  onBackButtonPressed() {
    const backUrl = this.route.snapshot.queryParams['backLocation'];
    if (backUrl == undefined) {
      const url = this.router.url.split('/');
      if (url.length > 2) {
        for (let i = 0; i < url.length - 2; i++) {
          url.pop();
        }
      }

      this.router.navigate(url);
    } else {
      const decodedURL = decodeURIComponent(backUrl);
      this.router.navigateByUrl(decodedURL);
    }
  }
}
