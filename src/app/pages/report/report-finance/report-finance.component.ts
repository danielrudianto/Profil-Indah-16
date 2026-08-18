import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment, { Moment } from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/*
  pdfmake 0.2.23 mengekspor objek vfs-nya langsung (module.exports = vfs);
  jalur lama pdfFonts.pdfMake.vfs kini undefined dan PDF gagal dibuat
  tanpa galat kompilasi.
*/
pdfMake.vfs = pdfFonts;

/**
 * Laporan keuangan (laba rugi per perusahaan) — kini HALAMAN, bukan lagi
 * dialog PDF yang bersembunyi di dashboard administrator.
 *
 * Pendapatan dan HPP-nya dibaca dari stock_out yang sudah ditetapkan ke
 * lapisan stock_in per perusahaan. Penjualan yang HPP-nya BELUM
 * teralokasi tidak lagi disembunyikan: nilainya tampil sebagai banner
 * peringatan dan barisnya sendiri — bentuk lama membuang grup itu
 * diam-diam, sehingga laba yang tampil lebih kecil dari kenyataan tanpa
 * satu pun tanda.
 *
 * Endpoint-nya khusus super administrator; rutenya dijaga guard yang
 * sama.
 */
@Component({
  selector: 'app-report-finance',
  templateUrl: './report-finance.component.html',
  styleUrls: ['./report-finance.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
    DatePipe,
    DecimalPipe,
  ],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatDatepicker,
    MatDatepickerInput,
  ],
})
export class ReportFinanceComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private decimalPipe: DecimalPipe,
  ) {}

  isLoading = true;
  isDownloading = false;

  /** Bulanan atau setahun penuh — server memakai month=0 untuk tahunan. */
  periode: 'bulan' | 'tahun' = 'bulan';
  date = new FormControl(moment());

  perusahaan: any[] = [];
  beban: any[] = [];
  stockOut: { hpp: number; sales: number; company_id: number | null }[] = [];
  takTeralokasi = 0;

  ngOnInit(): void {
    this.ambilData();
  }

  get namaBulan(): string {
    return this.periode === 'bulan'
      ? this.date.value!.format('MMMM YYYY')
      : this.date.value!.format('YYYY');
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .post('report/profit-loss', {
        month: this.periode === 'bulan' ? this.date.value!.month() + 1 : 0,
        year: this.date.value!.year(),
        report: 0,
      })
      .subscribe({
        next: (data: any) => {
          this.perusahaan = data.company ?? [];
          this.beban = data.expense ?? [];
          this.stockOut = (data.stockOut?.data ?? []).map((x: any) => ({
            hpp: Number(x.hpp ?? 0),
            sales: Number(x.sales ?? 0),
            company_id: x.company_id,
          }));
          this.takTeralokasi = Number(data.stockOut?.unallocated ?? 0);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  gantiPeriode(periode: 'bulan' | 'tahun'): void {
    this.periode = periode;
    this.ambilData();
  }

  setMonthAndYear(pilihan: Moment, datepicker: MatDatepicker<Moment>): void {
    const nilai = this.date.value ?? moment();
    nilai.month(pilihan.month());
    nilai.year(pilihan.year());
    this.date.setValue(nilai);
    datepicker.close();
    this.ambilData();
  }

  /* ---------------------------------------------------------------- */
  /* Baris per perusahaan                                              */
  /* ---------------------------------------------------------------- */

  private stockOutMilik(companyID: number | null) {
    return this.stockOut.find((x) => x.company_id == companyID);
  }

  pendapatan(companyID: number | null): number {
    return this.stockOutMilik(companyID)?.sales ?? 0;
  }

  hpp(companyID: number | null): number {
    return this.stockOutMilik(companyID)?.hpp ?? 0;
  }

  labaKotor(companyID: number | null): number {
    return this.pendapatan(companyID) - this.hpp(companyID);
  }

  margin(companyID: number | null): number {
    const dapat = this.pendapatan(companyID);
    return dapat === 0 ? 0 : (this.labaKotor(companyID) / dapat) * 100;
  }

  bebanPerusahaan(companyID: number | null): number {
    return this.beban
      .filter((x) => x.company_id == companyID)
      .reduce((a, b) => a + Number(b.value), 0);
  }

  labaBersih(companyID: number | null): number {
    return this.labaKotor(companyID) - this.bebanPerusahaan(companyID);
  }

  /** Ada penjualan yang stock_in-nya null tetapi sudah tergabung di grup. */
  get adaBarisTanpaAlokasi(): boolean {
    return this.stockOut.some((x) => x.company_id == null);
  }

  /* ---------------------------------------------------------------- */
  /* Total                                                             */
  /* ---------------------------------------------------------------- */

  get totalPendapatan(): number {
    return this.stockOut.reduce((a, b) => a + b.sales, 0);
  }

  get totalHpp(): number {
    return this.stockOut.reduce((a, b) => a + b.hpp, 0);
  }

  get totalLabaKotor(): number {
    return this.totalPendapatan - this.totalHpp;
  }

  get totalBeban(): number {
    return this.beban.reduce((a, b) => a + Number(b.value), 0);
  }

  get totalLabaBersih(): number {
    return this.totalLabaKotor - this.totalBeban;
  }

  /* ---------------------------------------------------------------- */
  /* Unduh PDF                                                         */
  /* ---------------------------------------------------------------- */

  downloadPdf(): void {
    this.isDownloading = true;

    const angka = (nilai: number) =>
      this.decimalPipe.transform(nilai, '1.2-2') ?? '0,00';

    const barisPerusahaan = this.perusahaan.map((p: any) => [
      { text: p.name, style: 'isi' },
      { text: angka(this.pendapatan(p.id)), style: 'isiAngka' },
      { text: angka(this.hpp(p.id)), style: 'isiAngka' },
      { text: angka(this.labaKotor(p.id)), style: 'isiAngka' },
      { text: angka(this.bebanPerusahaan(p.id)), style: 'isiAngka' },
      { text: angka(this.labaBersih(p.id)), style: 'isiAngka' },
    ]);

    if (this.adaBarisTanpaAlokasi) {
      barisPerusahaan.push([
        {
          text: this.translateService.instant(
            'report-finance__unallocated-row',
          ),
          style: 'isi',
        },
        { text: angka(this.pendapatan(null)), style: 'isiAngka' },
        { text: angka(this.hpp(null)), style: 'isiAngka' },
        { text: angka(this.labaKotor(null)), style: 'isiAngka' },
        { text: angka(this.bebanPerusahaan(null)), style: 'isiAngka' },
        { text: angka(this.labaBersih(null)), style: 'isiAngka' },
      ]);
    }

    const dokumen: TDocumentDefinitions = {
      pageOrientation: 'landscape',
      content: [
        { text: 'Laporan Laba Rugi — Profil Indah', style: 'judul' },
        { text: `Periode ${this.namaBulan}`, style: 'sub' },
        ...(this.takTeralokasi > 0
          ? [
              {
                text: this.translateService.instant(
                  'report-finance__unallocated-warning',
                  { nilai: angka(this.takTeralokasi) },
                ),
                style: 'peringatan',
              } as any,
            ]
          : []),
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Perusahaan / Company', style: 'kepala' },
                { text: 'Pendapatan / Income', style: 'kepala' },
                { text: 'HPP / COGS', style: 'kepala' },
                { text: 'Laba Kotor / Gross Profit', style: 'kepala' },
                { text: 'Beban / Expenses', style: 'kepala' },
                { text: 'Laba Bersih / Net Profit', style: 'kepala' },
              ],
              ...barisPerusahaan,
              [
                { text: 'TOTAL', style: 'kepala' },
                { text: angka(this.totalPendapatan), style: 'totalAngka' },
                { text: angka(this.totalHpp), style: 'totalAngka' },
                { text: angka(this.totalLabaKotor), style: 'totalAngka' },
                { text: angka(this.totalBeban), style: 'totalAngka' },
                { text: angka(this.totalLabaBersih), style: 'totalAngka' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        judul: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
        sub: { fontSize: 10, color: '#666666', margin: [0, 0, 0, 10] },
        peringatan: { fontSize: 9, color: '#a45f00', margin: [0, 0, 0, 8] },
        kepala: { fontSize: 9, bold: true },
        isi: { fontSize: 9 },
        isiAngka: { fontSize: 9, alignment: 'right' },
        totalAngka: { fontSize: 9, bold: true, alignment: 'right' },
      },
    };

    pdfMake
      .createPdf(dokumen)
      .download(`Laba_Rugi_${this.namaBulan.replace(/ /g, '_')}.pdf`);
    this.isDownloading = false;
  }
}
