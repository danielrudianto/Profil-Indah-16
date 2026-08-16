import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Daftar paket — bundel beberapa barang dengan satu harga paket, tampil
 * sebagai satu baris di faktur penjualan.
 *
 * Pencariannya ditenagai Meilisearch (indeks "package"), jadi kata kunci
 * hidup; ukuran halamannya ditentukan server lewat process.env.LIMIT dan
 * pilihan 10/25/50 dimatikan. Buat dan ubah adalah HALAMAN, bukan dialog:
 * isinya tabel barang yang butuh ruang.
 */
@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class PackageListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
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

  lacakPaket = (_: number, item: any): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('product-package', {
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

  buat(): void {
    this.router.navigate(['/Package/Create']);
  }

  ubah(item: any): void {
    this.router.navigate(['/Package/Edit', item.id]);
  }
}
