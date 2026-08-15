import { Component, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ItemBrand } from 'src/app/models/item.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { ProductBrandCreateComponent } from './product-brand-create/product-brand-create.component';
import { ProductBrandUpdateComponent } from './product-brand-update/product-brand-update.component';

/**
 * Daftar merek barang — sistem desain Nocturne.
 *
 * Kembar dengan daftar tipe barang; yang berbeda hanya nama kolom pembuatnya
 * di sisi server (`user` di sini, `user_item_type_created_byTouser` di sana)
 * dan jalan yang dipakai membuka dialognya.
 */
@Component({
  selector: 'app-product-brand',
  templateUrl: './product-brand.component.html',
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
export class ProductBrandComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private translateService: TranslateService,
  ) {}

  isLoading = true;
  dataSource: ItemBrand[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakMerek = (_: number, item: ItemBrand): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('product-brand', {
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
    this.dialog
      /*
        panelClass mengosongkan permukaan bawaan Material; dialognya sendiri
        yang melukis ground dan sudutnya — lihat catatan di styles.scss.
      */
      .open(ProductBrandCreateComponent, {
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        /* Data baru masuk di halaman pertama, jadi daftarnya diambil ulang. */
        if (data) {
          this.page = 1;
          this.ambilData();
        }
      });
  }

  ubah(item: ItemBrand): void {
    this.dialog
      .open(ProductBrandUpdateComponent, { data: { id: item.id } })
      .afterClosed()
      .subscribe((data) => {
        if (!data) {
          return;
        }

        const index = this.dataSource.findIndex((x) => x.id === data.id);
        if (index !== -1) {
          this.dataSource[index].name = data.name;
        }
      });
  }

  hapus(item: ItemBrand): void {
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

            this.apiService.delete(`product-brand/${item.id}`).subscribe({
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
