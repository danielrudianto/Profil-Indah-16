import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NgxMaskPipe } from 'ngx-mask';
import { TranslatePipe } from '@ngx-translate/core';

import { CompanyModel } from 'src/app/models/company.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { CompanyCreateComponent } from './company-create/company-create.component';
import { CompanyUpdateComponent } from './company-update/company-update.component';

/**
 * Daftar perusahaan — mengikuti susunan daftar merek barang.
 *
 * PENGAMBILAN DATANYA PINDAH KE SINI. Sebelumnya dipegang app-feature-search,
 * satu komponen yang menyatukan tata letak, pencarian, pengambilan data, dan
 * pemilihan dialog tambah untuk sebelas halaman sekaligus — sehingga halaman
 * yang butuh satu hal berbeda menyandera sepuluh lainnya. app-list-page hanya
 * memberi tahu "kata kuncinya berubah"; halamanlah yang memutuskan apa yang
 * dilakukan.
 */
@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    NgxMaskPipe,
    TranslatePipe,
  ],
})
export class CompanyComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) {}

  isLoading = true;
  dataSource: CompanyModel[] = [];
  dataCount = 0;
  page = 1;
  /*
    Ditentukan server lewat process.env.LIMIT dan tidak pernah dikirim ke sini.
    Diturunkan dari banyaknya baris pada halaman pertama — satu-satunya angka
    yang benar-benar diketahui peramban, dan dipakai hanya untuk keterangan
    "1 – 10 dari 79" serta mematikan tombol maju di halaman terakhir.
  */
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakPerusahaan = (_: number, item: CompanyModel): number => item.id!;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('company', {
        keyword: this.keyword,
        page: this.page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataCount = data.count;
          this.dataSource = data.data;
          if (this.page === 1 && data.data.length > 0) {
            this.pageSize = data.data.length;
          }
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

  /**
   * Membatalkan pencarian dari blok kosong.
   *
   * Lewat jalur yang sama dengan mengetik di kotak pencarian, supaya kotak dan
   * daftarnya tidak bisa menyatakan dua hal berbeda.
   */
  resetPencarian(): void {
    this.cari('');
  }

  tambah(): void {
    this.dialog
      .open(CompanyCreateComponent, {
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

  ubah(item: CompanyModel): void {
    this.dialog
      .open(CompanyUpdateComponent, {
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

        /*
          Dihapus dari basis data berarti dihapus dari daftar. Membiarkannya
          berdiri sampai halaman diambil ulang membuat baris yang sudah tidak
          ada masih bisa ditekan.
        */
        if (data === 'deleted') {
          this.dataSource.splice(index, 1);
          this.dataCount = this.dataCount - 1;
          return;
        }

        this.dataSource[index].name = data.name;
        this.dataSource[index].address = data.address;
        this.dataSource[index].npwp = data.npwp;
      });
  }
}
