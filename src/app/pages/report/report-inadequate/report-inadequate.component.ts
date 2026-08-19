import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import {
  ComboItem,
  ComboSearchComponent,
} from 'src/app/components/combo-search/combo-search.component';
import { MinimumStockInfoDialogComponent } from './minimum-stock-info-dialog/minimum-stock-info-dialog.component';

/**
 * Laporan barang kurang — stok di bawah ambang minimumnya sendiri
 * (yang minus punya laporannya sendiri: barang bermasalah).
 *
 * Bentuk lamanya membuka dialog saringan yang TIDAK PERNAH menyaring —
 * SQL-nya tidak membaca merek/tipe yang dikirim — dan tombol unduhnya
 * menembak POST /product-stock yang sudah lama dihapus, menggantung
 * tanpa jawaban. Keduanya kini hidup lewat endpoint yang sama dengan
 * tabelnya.
 */
@Component({
  selector: 'app-report-inadequate',
  templateUrl: './report-inadequate.component.html',
  styleUrls: ['./report-inadequate.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    ListPageComponent,
    TabelKosongComponent,
    ComboSearchComponent,
  ],
})
export class ReportInadequateComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private excelService: ExcelService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialog,
  ) {}

  isLoading = true;
  isDownloading = false;

  dataSource: any[] = [];

  /* Meta perhitungan rekomendasi — bahan banner: kapan & bagaimana. */
  meta: {
    lastCalculated: string | null;
    windowDays: number;
    leadDays: number;
    serviceLevel: number;
  } | null = null;
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  /** Saringan. Kosong berarti semua — backend memahaminya begitu. */
  merek: ComboItem[] = [];
  tipe: ComboItem[] = [];

  /* Id yang sudah jadi kapsul — saran yang sama dimatikan di daftarnya. */
  get idMerek(): number[] {
    return this.merek.map((x) => x.id);
  }

  get idTipe(): number[] {
    return this.tipe.map((x) => x.id);
  }

  ngOnInit(): void {
    this.ambilData();
  }

  ambilData(page: number = this.page): void {
    this.page = page;
    this.isLoading = true;
    this.apiService
      .post('product-stock/inadequate', {
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.keyword,
        brands: this.merek.map((x) => x.id),
        types: this.tipe.map((x) => x.id),
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
          this.meta = data.recommendationMeta ?? null;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  /* Banner hanya beriklan satu kalimat; rincian rumusnya di sini. */
  bukaCara(): void {
    if (this.meta == null) {
      return;
    }
    this.dialog.open(MinimumStockInfoDialogComponent, { data: this.meta });
  }

  cari(kata: string): void {
    this.keyword = kata;
    this.ambilData(1);
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.ambilData(1);
  }

  lacakBarang = (_: number, item: any): number => item.id;

  /* ---------------------------------------------------------------- */
  /* Saringan merek/tipe                                               */
  /* ---------------------------------------------------------------- */

  pilihMerek(item: ComboItem): void {
    if (this.merek.some((x) => x.id === item.id)) {
      return;
    }
    this.merek = [...this.merek, item];
    this.ambilData(1);
  }

  hapusMerek(indeks: number): void {
    this.merek = this.merek.filter((_, i) => i !== indeks);
    this.ambilData(1);
  }

  pilihTipe(item: ComboItem): void {
    if (this.tipe.some((x) => x.id === item.id)) {
      return;
    }
    this.tipe = [...this.tipe, item];
    this.ambilData(1);
  }

  hapusTipe(indeks: number): void {
    this.tipe = this.tipe.filter((_, i) => i !== indeks);
    this.ambilData(1);
  }

  /** Selisih terhadap ambang — seberapa banyak yang perlu dipesan. */
  /*
    Ambang EFEKTIF: yang tertinggi antara minimum manual dan rekomendasi
    hasil hitungan reorder point — sama persis dengan saringan servernya.
  */
  ambang(item: any): number {
    return Math.max(
      Number(item.minimum_stock),
      Number(item.minimum_stock_recommendation ?? 0),
    );
  }

  kekurangan(item: any): number {
    return this.ambang(item) - Number(item.product_stock?.stock ?? 0);
  }

  /* ---------------------------------------------------------------- */
  /* Unduhan Excel — endpoint yang sama, satu halaman raksasa          */
  /* ---------------------------------------------------------------- */

  download(): void {
    this.isDownloading = true;
    this.apiService
      .post('product-stock/inadequate', {
        page: 1,
        pageSize: 10000,
        keyword: this.keyword,
        brands: this.merek.map((x) => x.id),
        types: this.tipe.map((x) => x.id),
      })
      .subscribe({
        next: (data: any) => {
          this.excelService
            .unduh('Laporan_barang_kurang', [
              {
                nama: 'Laporan barang kurang',
                judul: 'Laporan barang kurang',
                kolom: [
                  { judul: 'Reference', lebar: 18 },
                  { judul: 'Description', lebar: 42 },
                  { judul: 'Stock', format: 'angka' },
                  { judul: 'Minimum stock', format: 'angka' },
                  { judul: 'Recommended minimum', format: 'angka' },
                  { judul: 'Shortage', format: 'angka' },
                  { judul: 'Unit', lebar: 10 },
                ],
                baris: (data.data as any[]).map((x) => [
                  x.reference,
                  x.description,
                  Number(x.product_stock?.stock ?? 0),
                  Number(x.minimum_stock),
                  x.minimum_stock_recommendation == null
                    ? null
                    : Number(x.minimum_stock_recommendation),
                  this.kekurangan(x),
                  x.unit,
                ]),
              },
            ])
            .then(() => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'report-inadequate__export__successful',
                ),
              );
            });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }
}
