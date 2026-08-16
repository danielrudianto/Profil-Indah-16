import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { PricePurchaseUpdateComponent } from './price-purchase-update/price-purchase-update.component';

/**
 * Daftar harga beli — kembaran daftar harga jual; hanya administrator yang
 * sampai ke sini (lihat AdministratorGuard pada rutenya). Ukuran halaman
 * ditentukan server lewat process.env.LIMIT, jadi pilihan 10/25/50 dimatikan.
 */
@Component({
  selector: 'app-price-purchase',
  templateUrl: './price-purchase.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class PricePurchaseComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 20;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakProduk = (_: number, item: any): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('product-price-purchase', {
        keyword: this.keyword,
        page: this.page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataCount = data.count;
          this.dataSource = data.data;
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  cari(kataKunci: string): void {
    this.keyword = kataKunci;
    this.page = 1;
    this.ambilData();
  }

  resetPencarian(): void {
    this.cari('');
  }

  bukaHalaman(halaman: number): void {
    this.page = halaman;
    this.ambilData();
  }

  ubah(item: any): void {
    this.dialog
      .open(PricePurchaseUpdateComponent, {
        data: { id: item.id },
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        /*
          Dialognya mengembalikan seluruh baris satuan; baris pertama selalu
          satuan dasar, dan itulah yang tampil di daftar ini.
        */
        if (!data || !data.length) {
          return;
        }

        const index = this.dataSource.findIndex((x) => x.id === item.id);
        if (index !== -1) {
          this.dataSource[index].purchase_price = data[0].price;
          this.dataSource[index].purchase_discount = data[0].discount;
        }
      });
  }
}
