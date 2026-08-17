import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Antrean penerimaan yang MENUNGGU FAKTUR — halaman kerja utama menu
 * faktur pembelian. Barang sudah datang dan tercatat; begitu faktur
 * suppliernya tiba, barisnya dilengkapi lewat tombol di kanan.
 *
 * Endpoint-nya tidak menerima kata kunci dan ukuran halamannya dipatok
 * server lewat LIMIT, jadi kotak cari dan pilihan ukuran tidak digambar.
 */
@Component({
  selector: 'app-purchase-invoice-confirm',
  templateUrl: './purchase-invoice-confirm.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DatePipe,
    TranslatePipe,
  ],
})
export class PurchaseInvoiceConfirmComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.ambilData();
  }

  ambilData(page: number = this.page): void {
    this.page = page;
    this.isLoading = true;
    this.apiService
      .get('good-receipt/unconfirmed', { page: this.page })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  bukaHalaman(halaman: number): void {
    this.ambilData(halaman);
  }

  lacakPenerimaan = (_: number, item: any): number => item.id;

  lengkapi(item: any): void {
    this.router.navigate(['Confirm', item.id], { relativeTo: this.route });
  }

  keArsip(): void {
    this.router.navigate(['/Purchase-invoice/Archive']);
  }
}
