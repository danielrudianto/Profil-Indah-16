import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import moment, { Moment } from 'moment';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';

/**
 * Laporan per perusahaan, bulanan — "toko X jual (dan terima) apa saja
 * bulan ini".
 *
 * Konsep tokonya: Toko Profil Indah pemilik stok; toko lain menjual
 * dari kartu stok yang sama dan barangnya diambil dari lapisan
 * pemiliknya. Keluar diatribusikan lewat pemilik lapisan
 * (stock_in.company_id) karena faktur penjualan memang tidak membawa
 * company. Layar menampilkan agregat per barang; rinciannya (dokumen
 * dan lawan per baris) lewat unduhan Excel dua sheet.
 */
@Component({
  selector: 'app-company-report',
  templateUrl: './company-report.component.html',
  styleUrls: ['./company-report.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
    DatePipe,
  ],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    MatDatepicker,
    MatDatepickerInput,
    TranslatePipe,
  ],
})
export class CompanyReportComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private excelService: ExcelService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
  ) {}

  isLoading = true;
  isDownloading = false;
  date = new FormControl(moment());
  laporan: any = null;

  ngOnInit(): void {
    this.ambilData();
  }

  get namaBulan(): string {
    return this.date.value!.format('MMMM YYYY');
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .get('report/company', {
        company_id: this.activatedRoute.snapshot.params['id'],
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          this.laporan = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Company']);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  setMonthAndYear(pilihan: Moment, datepicker: MatDatepicker<Moment>): void {
    const nilai = this.date.value ?? moment();
    nilai.month(pilihan.month());
    nilai.year(pilihan.year());
    this.date.setValue(nilai);
    datepicker.close();
    this.ambilData();
  }

  kembali(): void {
    this.router.navigate(['/Company']);
  }

  /* Unduhan Excel: baris rinci dua arah, satu sheet per arah. */
  download(): void {
    this.isDownloading = true;
    this.apiService
      .get('report/company/download', {
        company_id: this.activatedRoute.snapshot.params['id'],
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          this.eksporExcel(data.output ?? [], data.input ?? []);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  private eksporExcel(output: any[], input: any[]): void {
    const kolom = [
      { judul: 'No', format: 'angka' as const, lebar: 6 },
      { judul: 'Tanggal', format: 'tanggal' as const },
      { judul: 'Reference', lebar: 18 },
      { judul: 'Description', lebar: 42 },
      { judul: 'Quantity', format: 'angka' as const },
      { judul: 'Unit', lebar: 10 },
      { judul: 'Document', lebar: 24 },
      { judul: 'Opponent', lebar: 24 },
    ];
    const baris = (daftar: any[]) =>
      daftar.map((x, indeks) => [
        indeks + 1,
        new Date(x.date),
        x.reference,
        x.description,
        x.quantity,
        x.unit,
        x.document,
        x.opponent,
      ]);

    this.excelService
      .unduh(
        `Laporan_perusahaan_${this.laporan.company.name.replace(/ /g, '_')}_${this.date.value!.format('YYYY-MM')}`,
        [
          {
            nama: 'Output',
            judul: `Barang keluar — ${this.laporan.company.name}`,
            keterangan: `Periode ${this.namaBulan}`,
            kolom: kolom,
            baris: baris(output),
          },
          {
            nama: 'Input',
            judul: `Barang masuk — ${this.laporan.company.name}`,
            keterangan: `Periode ${this.namaBulan}`,
            kolom: kolom,
            baris: baris(input),
          },
        ],
      )
      .then(() => {
        this.alertService.showSuccess(
          this.translateService.instant('report-money__export__successful'),
        );
      });
  }
}
