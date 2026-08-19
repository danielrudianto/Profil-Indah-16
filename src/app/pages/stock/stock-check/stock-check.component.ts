import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { Role } from 'src/app/constants/role.constant';

/**
 * Cek stok gudang — satu-satunya halaman peran Gudang (role 6).
 *
 * Membaca POST /warehouse/product-stock: untuk Gudang, server menyaring ke
 * tipe barang yang DITUGASKAN kepadanya (tabel user_sales) dan stoknya sudah
 * dikurangi deposit terbuka; administrator melihat seluruh katalog lewat
 * endpoint yang sama, jadi halaman ini juga bisa dipakai memeriksa apa yang
 * akan dilihat staf gudang.
 *
 * Hanya membaca: tidak ada tombol tambah, tidak ada aksi baris, tidak ada
 * jalan ke kartu stok — mutasi dan nilai bukan urusan halaman ini.
 */
@Component({
  selector: 'app-stock-check',
  templateUrl: './stock-check.component.html',
  styleUrls: ['./stock-check.component.scss'],
  imports: [
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    TranslatePipe,
    ListPageComponent,
    TabelKosongComponent,
  ],
})
export class StockCheckComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  /* Banner penugasan hanya untuk Gudang; admin melihat seluruh katalog. */
  get adalahGudang(): boolean {
    return this.authService.getUserInfo()?.role === Role.Warehouse;
  }

  ngOnInit(): void {
    this.ambilData();
  }

  lacakBarang = (_: number, item: any): number => item.id;

  inisial(teks: string): string {
    return (teks ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  ambilData(page: number = this.page): void {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('warehouse/product-stock', {
        keyword: this.keyword,
        page: this.page,
        pageSize: this.pageSize,
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

  cari(kata: string): void {
    this.keyword = kata;
    this.ambilData(1);
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.ambilData(1);
  }

  resetPencarian(): void {
    this.cari('');
  }

  /* ---------------------------------------------------------------- */
  /* Keterangan baris — seanatomi kondisi di daftar stok               */
  /* ---------------------------------------------------------------- */

  /*
    Ambangnya EFEKTIF: yang tertinggi antara minimum manual dan
    rekomendasi sistem — sama dengan laporan barang kurang.
  */
  kondisiBaris(item: any): string {
    const jumlah = Number(item.product_stock?.stock ?? 0);
    if (jumlah < 0) {
      return 'negative';
    }

    const ambang = Math.max(
      Number(item.minimum_stock ?? 0),
      Number(item.minimum_stock_recommendation ?? 0),
    );
    return ambang > 0 && jumlah < ambang ? 'low' : '';
  }

  kunciKondisi(item: any): string {
    return this.kondisiBaris(item) === 'negative'
      ? 'stock-list__status__negative'
      : 'stock-list__status__low';
  }

  kelasPill(item: any): string {
    return this.kondisiBaris(item) === 'negative'
      ? 'pill--merah'
      : 'pill--amber';
  }

  ikonPill(item: any): string {
    return this.kondisiBaris(item) === 'negative'
      ? 'ph-arrow-down'
      : 'ph-warning';
  }
}
