import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Item } from 'src/app/models/item.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { UpdateProductComponent } from './update-product/update-product.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Daftar barang — sistem desain Nocturne.
 *
 * Kerangka halamannya — judul, baris alat, kartu, kaki — datang dari
 * app-list-page. Yang tinggal di sini hanya yang memang berbeda antar halaman:
 * kolom tabelnya, menu tindakannya, dan cara mengambil datanya.
 *
 * TIDAK LAGI MEMAKAI app-feature-search. Komponen itu bukan sekadar kolom
 * pencarian: ia juga yang mengambil datanya dan yang memutuskan dialog mana
 * yang dibuka tombol tambah, lewat satu switch berisi sebelas halaman.
 * Parameter yang dikirim di sini sama persis dengan miliknya — keyword, page,
 * pageSize, content, mode — sehingga tidak ada perubahan di sisi server.
 *
 * CATATAN: keping saringan status yang ada di berkas desain belum dipasang.
 * Endpoint daftar barang hanya menerima page, keyword, dan pageSize; menyaring
 * di sisi peramban hanya akan menyaring SATU HALAMAN hasil, sehingga "Nonaktif"
 * menampilkan sebagian saja dan terbaca seperti data yang hilang.
 */
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  imports: [TabelKosongComponent, 
    NgIf,
    NgFor,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslatePipe,
    ListPageComponent,
  ],
})
export class ProductComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  isLoading = true;
  dataSource: Item[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakBarang = (_: number, item: Item): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('product', {
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
    /* Kata kunci baru berarti kumpulan hasil yang baru pula. */
    this.page = 1;
    this.ambilData();
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

  tambah(): void {
    this.router.navigate(['Create'], { relativeTo: this.activatedRoute });
  }

  ubah(item: Item): void {
    this.dialog
      .open(UpdateProductComponent, { data: { id: item.id } })
      .afterClosed()
      .subscribe((data) => {
        if (!data) {
          return;
        }

        const index = this.dataSource.findIndex((x) => x.id === item.id);
        if (index !== -1) {
          this.dataSource[index] = { ...this.dataSource[index], ...data };
        }
      });
  }

  gantiStatus(item: Item): void {
    const index = this.dataSource.findIndex((x) => x.id === item.id);
    if (index === -1) {
      return;
    }

    this.apiService.put('product/active', { id: item.id }).subscribe({
      next: (data: any) => {
        this.dataSource[index].is_active = !this.dataSource[index].is_active;
        this.alertService.showSuccess(
          `${data.reference} ${this.translate.instant(
            'general__updated-successfully',
          )}`,
        );
      },
      error: (error: any) => {
        this.alertService.showError(error);
      },
    });
  }

  /**
   * Membatalkan pencarian dari blok kosong.
   *
   * Ruasnya dikosongkan DAN diteruskan ke pengambilan data lewat jalur yang
   * sama dengan mengetik di kotak pencarian, supaya kotak, daftar, dan
   * alamat tidak bisa menyatakan tiga hal berbeda.
   */
  resetPencarian(): void {
    this.cari('');
  }
}
