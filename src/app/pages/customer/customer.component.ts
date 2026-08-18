import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NgxMaskPipe } from 'ngx-mask';
import { TranslatePipe } from '@ngx-translate/core';

import { Router } from '@angular/router';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { CustomerUpdateComponent } from './customer-update/customer-update.component';

/**
 * Daftar pelanggan — mengikuti susunan daftar perusahaan; endpoint-nya
 * menerima pageSize, jadi pilihan 10/25/50 dibiarkan hidup.
 */
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    NgxMaskPipe,
    TranslatePipe,
  ],
})
export class CustomerComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  isLoading = true;
  isSuperAdministrator = false;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.isSuperAdministrator = this.authService.isSuperAdministrator();
    this.ambilData();
  }

  /** Laporan penjualan — nilai penjualan per pelanggan hanya untuk super admin. */
  laporan(item: any): void {
    this.router.navigate(['/Customer/Report', item.id]);
  }

  lacakPelanggan = (_: number, item: any): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('customer', {
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

  tambah(): void {
    this.dialog
      .open(CustomerCreateComponent, {
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
    this.dialog
      .open(CustomerUpdateComponent, {
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
