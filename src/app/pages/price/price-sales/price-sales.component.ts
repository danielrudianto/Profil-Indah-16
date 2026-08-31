import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { PriceSalesUpdateComponent } from './price-sales-update/price-sales-update.component';

/**
 * Daftar harga jual — mengikuti susunan daftar pelanggan. Ukuran halaman
 * ditentukan server lewat process.env.LIMIT, jadi pilihan 10/25/50 dimatikan;
 * tidak ada tombol tambah karena barangnya lahir dari halaman produk, di sini
 * hanya harganya yang diubah.
 */
import { persenDiskon } from 'src/app/utils/diskon-persen.utils';

@Component({
  selector: 'app-price-sales',
  templateUrl: './price-sales.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class PriceSalesComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  /*
    Sepuluh, sama dengan bawaan translatePageSize di server dan dengan dua
    puluh enam daftar lain di aplikasi ini. Nilainya kini IKUT TERKIRIM ke
    server, jadi angka di sini menentukan hasilnya alih-alih menebaknya —
    dulu dipatok 20 sementara server mengirim 10, dan separuh nomor halaman
    membuka tabel kosong.
  */
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakProduk = (_: number, item: any): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('product-price-sales', {
        keyword: this.keyword,
        page: this.page,
        pageSize: this.pageSize,
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

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    /* Kembali ke halaman satu: nomor halaman lama menunjuk potongan lain. */
    this.page = 1;
    this.ambilData();
  }

  ubah(item: any): void {
    this.dialog
      .open(PriceSalesUpdateComponent, {
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
          this.dataSource[index].sales_price = data[0].price;
          this.dataSource[index].sales_discount = data[0].discount;
        }
      });
  }

  /**
   * Diskon sebagai persen dari harga — kolom di sebelah kolom rupiah.
   *
   * null berarti persennya memang tidak punya arti (harga atau diskon nol),
   * dan template menampilkan tanda pisah, sama seperti kolom rupiahnya.
   */
  persen(item: any): number | null {
    return persenDiskon(item?.sales_price, item?.sales_discount);
  }
}
