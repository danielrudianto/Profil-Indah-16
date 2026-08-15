import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ItemType } from 'src/app/models/item.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { ProductTypeCreateComponent } from './product-type-create/product-type-create.component';
import { ProductTypeUpdateComponent } from './product-type-update/product-type-update.component';

/**
 * Daftar tipe barang — sistem desain Nocturne.
 *
 * Kerangkanya datang dari app-list-page; yang tinggal di sini hanya kolom
 * tabelnya, menu tindakannya, dan cara mengambil datanya.
 *
 * Tipe dan merek barang dibuka lewat DUA JALAN YANG BERBEDA — tipe memakai
 * DynamicComponentService, merek memakai MatDialog. Perbedaan itu diwarisi apa
 * adanya dari bentuk sebelumnya; menyeragamkannya berarti mengubah perilaku
 * dialognya, dan itu pekerjaan tersendiri.
 */
@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  imports: [
    NgIf,
    NgFor,
    DatePipe,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslatePipe,
    ListPageComponent,
  ],
})
export class ProductTypeComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService,
  ) {}

  isLoading = true;
  dataSource: ItemType[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakTipe = (_: number, item: ItemType): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('product-type', {
        keyword: this.keyword,
        page: this.page,
        pageSize: this.pageSize,
        content: 'false',
        mode: 'default',
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
    this.dynamicComponentService
      .createDynamicComponent(ProductTypeCreateComponent, {})
      .subscribe({
        next: (data) => {
          /* Data baru masuk di halaman pertama, jadi daftarnya diambil ulang. */
          if (data) {
            this.page = 1;
            this.ambilData();
          }
        },
      });
  }

  ubah(item: ItemType): void {
    this.dynamicComponentService
      .createDynamicComponent(ProductTypeUpdateComponent, { id: item.id })
      .subscribe({
        next: (data) => {
          if (data == null) {
            return;
          }

          const index = this.dataSource.findIndex((x) => x.id === data.id);
          if (index !== -1) {
            this.dataSource[index].name = data.name;
          }
        },
      });
  }

  hapus(item: ItemType): void {
    const index = this.dataSource.findIndex((x) => x.id === item.id);
    if (index === -1) {
      return;
    }

    this.translateService
      .get(['general__delete-confirmation', 'general__delete-successfully'])
      .subscribe((teks) => {
        this.dialog
          .open(DeleteConfirmationComponent, {
            data: {
              title: teks['general__delete-confirmation'],
              document: item.name,
            },
          })
          .afterClosed()
          .subscribe((setuju) => {
            if (setuju !== true) {
              return;
            }

            this.apiService.delete(`product-type/${item.id}`).subscribe({
              next: (data: any) => {
                this.dataSource.splice(index, 1);
                this.dataCount = this.dataCount - 1;
                this.alertService.showSuccess(
                  `${data.name} ${teks['general__delete-successfully']}`,
                );
              },
              error: (error: any) => {
                this.alertService.showError(error);
              },
            });
          });
      });
  }
}
