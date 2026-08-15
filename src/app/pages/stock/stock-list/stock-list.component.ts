import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { StockListReportComponent } from '../stock-list-report/stock-list-report.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Daftar stok.
 *
 * KEADAANNYA HIDUP DI QUERY PARAM, bukan di dalam komponen ini. Itu bukan
 * kerumitan yang tersisa dari versi lama, melainkan yang membuat kartu stok
 * bisa ditutup dan pengguna kembali ke halaman, kata kunci, dan nomor halaman
 * yang sama persis. Maka setiap perubahan pencarian atau halaman menavigasi
 * lebih dulu, dan pengambilan datanya dipicu oleh queryParams — bukan
 * dipanggil langsung dari penanganan tombolnya.
 */
@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
  imports: [TabelKosongComponent, ListPageComponent, NgIf, NgFor, DecimalPipe, TranslatePipe],
})
export class StockListComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  isLoading: boolean = true;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  kataKunci: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe(() => {
      this.fetchProducts();
    });
  }

  fetchProducts() {
    this.isLoading = true;

    const q = this.route.snapshot.queryParams;
    this.page = Number(q['page'] ?? 1);
    this.pageSize = Number(q['pageSize'] ?? 10);
    this.kataKunci = q['keyword'] ?? '';

    this.apiService
      .get('product-stock', {
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.kataKunci,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  cari(kata: string) {
    this.navigasi({ keyword: kata, page: 1, pageSize: this.pageSize });
  }

  bukaHalaman(halaman: number) {
    this.navigasi({
      keyword: this.kataKunci,
      page: halaman,
      pageSize: this.pageSize,
    });
  }

  gantiUkuran(ukuran: number) {
    /* Kembali ke halaman satu: halaman 7 dari 10 baris tidak ada isinya lagi
       ketika ukurannya menjadi 50. */
    this.navigasi({ keyword: this.kataKunci, page: 1, pageSize: ukuran });
  }

  private navigasi(queryParams: {
    keyword: string;
    page: number;
    pageSize: number;
  }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  lacakBarang = (_: number, item: any): number => item.id;

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'mutation') {
      this.dialog.open(StockListReportComponent, {
        data: {
          id: id,
        },
      });
    }

    if (dialogType == 'card') {
      const url = this.router.url;

      this.router.navigate(['Card', id], {
        relativeTo: this.route,
        queryParams: {
          backLocation: url,
        },
      });
    }
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
