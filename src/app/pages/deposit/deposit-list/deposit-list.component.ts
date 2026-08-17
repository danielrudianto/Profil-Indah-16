import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { DepositViewComponent } from '../deposit-view/deposit-view.component';

/**
 * Daftar deposit yang menunggu konfirmasi — pola app-list-page.
 *
 * Tidak ada tombol tambah: deposit lahir dari formulir faktur penjualan
 * (tipe transaksi deposit), bukan dari halaman ini. Yang bisa dilakukan
 * di sini hanyalah meninjau dan masuk ke halaman konfirmasinya —
 * dulu jalur konfirmasi bersembunyi di dalam dialog tinjau, sekarang
 * tombolnya berdiri di barisnya sendiri.
 */
@Component({
  selector: 'app-deposit-list',
  templateUrl: './deposit-list.component.html',
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
export class DepositListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakDeposit = (_: number, item: any): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('sales-deposit', {
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
    this.page = 1;
    this.ambilData();
  }

  /** Nilai deposit: jumlah netto seluruh barangnya. */
  nilai(item: any): number {
    return (item.sales_deposit ?? []).reduce(
      (a: number, b: any) => a + b.quantity * (b.price - b.discount),
      0,
    );
  }

  lihat(item: any): void {
    this.dialog
      .open(DepositViewComponent, {
        data: {
          id: item.id,
          noAction: false,
          print: true,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === 'reject') {
          const index = this.dataSource.findIndex((x) => x.id === item.id);
          if (index !== -1) {
            this.dataSource.splice(index, 1);
            this.dataCount = this.dataCount - 1;
          }
        }
      });
  }

  konfirmasi(item: any): void {
    this.router.navigate(['/Deposit/Confirm', item.id]);
  }

  keArsip(): void {
    this.router.navigate(['/Deposit/Archive']);
  }
}
