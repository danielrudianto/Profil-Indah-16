import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { PaymentMethodCreateComponent } from './payment-method-create/payment-method-create.component';
import { PaymentMethodUpdateComponent } from './payment-method-update/payment-method-update.component';

/**
 * Daftar metode pembayaran — mengikuti susunan daftar pelanggan. Ukuran
 * halaman ditentukan server lewat process.env.LIMIT dan tidak bisa diminta
 * lain, jadi pilihan 10/25/50 dimatikan (alasannya sama dengan perusahaan).
 */
@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    TranslatePipe,
  ],
})
export class PaymentMethodComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
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

  lacakMetode = (_: number, item: any): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('payment-method', {
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

  tambah(): void {
    this.dialog
      .open(PaymentMethodCreateComponent, {
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.page = 1;
          this.ambilData();
        }
      });
  }

  ubah(item: any): void {
    /* Metode bawaan (id 0) milik sistem — tidak bisa diubah atau dihapus. */
    if (!item.id) {
      return;
    }

    this.dialog
      .open(PaymentMethodUpdateComponent, {
        data: { id: item.id },
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (!data) {
          return;
        }

        const index = this.dataSource.findIndex((x) => x.id === item.id);
        if (index === -1) {
          return;
        }

        if (data === 'deleted') {
          this.dataSource.splice(index, 1);
          this.dataCount = this.dataCount - 1;
          return;
        }

        this.dataSource[index] = { ...this.dataSource[index], ...data };
      });
  }
}
