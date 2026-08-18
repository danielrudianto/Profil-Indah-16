import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';

import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';

const moment = _rollupMoment || _moment;

/**
 * Laporan pengeluaran sebulan — dua cara pandang atas angka yang sama:
 * per perusahaan pembayar, atau per pohon tipe pengeluaran (induk baku
 * digulung dari seluruh anaknya; pengeluaran memang dicatat ke anak).
 *
 * Adapter tanggalnya dipasang di komponen ini, bukan global: mode
 * bulan-tahun hanya dipakai halaman-halaman laporan.
 */
@Component({
  selector: 'app-expense-report',
  templateUrl: './expense-report.component.html',
  styleUrls: ['./expense-report.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
  ],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    TranslatePipe,
  ],
})
export class ExpenseReportComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  date = new FormControl(moment());
  isLoading: boolean = true;
  companies: any[] = [];
  types: any[] = [];
  total: number = 0;

  kelompok: 'company' | 'type' = 'company';

  ngOnInit(): void {
    this.fetchReport();
  }

  /** "Agustus 2026" — dibaca tombol pemilih bulan di kepala halaman. */
  get namaBulan(): string {
    return (this.date.value ?? moment()).format('MMMM YYYY');
  }

  setKelompok(nilai: 'company' | 'type'): void {
    this.kelompok = nilai;
  }

  get kelompokKosong(): boolean {
    return this.kelompok === 'company'
      ? this.companies.length === 0
      : this.types.length === 0;
  }

  setMonthAndYear(pilihan: Moment, datepicker: MatDatepicker<Moment>): void {
    const nilai = this.date.value ?? moment();
    nilai.month(pilihan.month());
    nilai.year(pilihan.year());
    this.date.setValue(nilai);
    datepicker.close();

    this.fetchReport();
  }

  fetchReport(): void {
    this.isLoading = true;
    this.apiService
      .get(`expense`, {
        month: Number(this.date.value?.format('MM')),
        year: Number(this.date.value?.format('YYYY')),
      })
      .subscribe({
        next: (data: any) => {
          this.companies = data.company;
          this.types = data.expenseTypes;

          for (let i = 0; i < this.companies.length; i++) {
            this.companies[i].value = data.result
              .filter((x: any) => x.company_id === this.companies[i].id)
              .reduce((a: number, b: any) => a + b.value, 0);
          }

          /*
            Pengeluaran dicatat ke ANAK; nilai induk baku adalah gulungan
            seluruh anaknya.
          */
          for (let i = 0; i < this.types.length; i++) {
            const anak = this.types[i].children ?? [];

            for (let j = 0; j < anak.length; j++) {
              anak[j].value = data.result
                .filter((x: any) => x.expense_type_id === anak[j].id)
                .reduce((a: number, b: any) => a + b.value, 0);
            }

            this.types[i].value = anak.reduce(
              (a: number, b: any) => a + b.value,
              0,
            );
          }

          /* Kedua cara pandang menjumlah ke angka yang sama. */
          this.total = this.companies.reduce(
            (a: number, b: any) => a + b.value,
            0,
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
