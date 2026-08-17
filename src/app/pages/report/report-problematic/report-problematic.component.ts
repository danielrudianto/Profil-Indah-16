import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import {
  ComboItem,
  ComboSearchComponent,
} from 'src/app/components/combo-search/combo-search.component';

/**
 * Laporan barang bermasalah — stok yang tercatat MINUS. Barang minus
 * bukan sekadar kurang: ada transaksi yang lolos tanpa stoknya, jadi
 * tiap barisnya menunjuk pencatatan yang perlu dibereskan.
 *
 * Kembaran laporan barang kurang: anatomi list-page yang sama, saringan
 * combo+chip yang sama, dan unduhan Excel lewat endpoint tabel yang
 * sama — tombol unduh lamanya menembak /problematic/download yang tidak
 * pernah ada di routes.
 */
@Component({
  selector: 'app-report-problematic',
  templateUrl: './report-problematic.component.html',
  styleUrls: ['./report-problematic.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
    ListPageComponent,
    TabelKosongComponent,
    ComboSearchComponent,
  ],
})
export class ReportProblematicComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
  ) {}

  isLoading = true;
  isDownloading = false;

  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  /** Saringan. Kosong berarti semua — backend memahaminya begitu. */
  merek: ComboItem[] = [];
  tipe: ComboItem[] = [];

  ngOnInit(): void {
    this.ambilData();
  }

  ambilData(page: number = this.page): void {
    this.page = page;
    this.isLoading = true;
    this.apiService
      .post('product-stock/problematic', {
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

  /* ---------------------------------------------------------------- */
  /* Unduhan Excel — endpoint yang sama, satu halaman raksasa          */
  /* ---------------------------------------------------------------- */

  download(): void {
    this.isDownloading = true;
    this.apiService
      .post('product-stock/problematic', {
        page: 1,
        pageSize: 10000,
        keyword: this.keyword,
        brands: this.merek.map((x) => x.id),
        types: this.tipe.map((x) => x.id),
      })
      .subscribe({
        next: (data: any) => {
          const worksheet = xlsx.utils.aoa_to_sheet([
            ['No', 'Reference', 'Description', 'Stock', 'Minimum stock', 'Unit'],
            ...(data.data as any[]).map((x, i) => [
              i + 1,
              x.reference,
              x.description,
              Number(x.product_stock?.stock ?? 0),
              Number(x.minimum_stock),
              x.unit,
            ]),
          ]);

          const workbook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
          const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });
          saveAs(
            new Blob([excelBuffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            `Problematic_report_${new Date().getTime()}.xlsx`,
          );
          this.alertService.showSuccess(
            this.translateService.instant(
              'problematic-report__export__successful',
            ),
          );
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
