import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Laporan uang masuk harian — per metode pembayaran.
 *
 * Tiap baris metode memuat uang masuk (faktur, deposit, kelebihan bayar)
 * DAN uang keluarnya: retur penjualan serta PENGEMBALIAN DISKON faktur —
 * bayar tunai 5.000 dengan diskon 1.000 yang dikembalikan via transfer
 * berarti +5.000 di kas dan -1.000 di transfernya. Kolom pengembalian
 * diskon dulu tidak pernah dihitung sama sekali.
 */
@Component({
  selector: 'app-report-money',
  templateUrl: './report-money.component.html',
  styleUrls: ['./report-money.component.scss'],
  providers: [DatePipe],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    RouterLink,
    MatDatepicker,
    MatDatepickerInput,
  ],
})
export class ReportMoneyComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private excelService: ExcelService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
  ) {}

  isLoading = true;
  isDownloading = false;

  date = new FormControl(new Date());

  metode: any[] = [];
  dor: { sales: string | null; salesInvoice: number; salesDeposit: number }[] =
    [];

  ngOnInit(): void {
    this.ambilData();

    this.date.valueChanges.subscribe(() => {
      this.ambilData();
    });
  }

  get namaTanggal(): string {
    return this.datePipe.transform(this.date.value, 'dd MMMM yyyy') ?? '';
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .post('report/money-receipt', {
        date: this.datePipe.transform(this.date.value, 'yyyy-MM-dd'),
      })
      .subscribe({
        next: (data: any) => {
          this.metode = data.filter((x: any) => x.id !== 0);
          this.dor = data.find((x: any) => x.id === 0)?.data ?? [];
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  /* ---------------------------------------------------------------- */
  /* Nilai per baris                                                   */
  /* ---------------------------------------------------------------- */

  /** Masuk − keluar untuk satu metode. */
  totalBaris(m: any): number {
    return (
      Number(m.salesInvoice) +
      Number(m.salesDeposit) -
      Number(m.salesReturn) +
      Number(m.overpayment) -
      Number(m.rebate ?? 0)
    );
  }

  get totalMasuk(): number {
    return this.metode.reduce(
      (a, b) => a + Number(b.salesInvoice) + Number(b.salesDeposit),
      0,
    );
  }

  get totalKeluar(): number {
    return this.metode.reduce(
      (a, b) => a + Number(b.salesReturn) + Number(b.rebate ?? 0),
      0,
    );
  }

  get totalDor(): number {
    return this.dor.reduce(
      (a, b) => a + Number(b.salesInvoice) + Number(b.salesDeposit),
      0,
    );
  }

  get totalBersih(): number {
    return (
      this.metode.reduce((a, b) => a + this.totalBaris(b), 0) + this.totalDor
    );
  }

  /* ---------------------------------------------------------------- */
  /* Unduh — bentuk berkasnya dipertahankan apa adanya                 */
  /* ---------------------------------------------------------------- */

  download(): void {
    this.isDownloading = true;
    this.apiService
      .post('report/money-receipt/download', {
        date: this.datePipe.transform(this.date.value, 'yyyy-MM-dd'),
      })
      .subscribe({
        next: (data: any) => {
          this.exportToExcel(data.data);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  private exportToExcel(
    data: {
      date: Date;
      invoiceName: string;
      customer: string;
      value: number;
      payment: number;
      paymentMethod: string;
    }[],
  ) {
    this.excelService
      .unduh(
        `Penerimaan_uang_${this.datePipe.transform(this.date.value, 'yyyy-MM-dd')}`,
        [
          {
            nama: 'Penerimaan uang',
            judul: 'Laporan penerimaan uang',
            keterangan: this.namaTanggal,
            kolom: [
              { judul: 'No', format: 'angka', lebar: 6 },
              { judul: 'Tanggal', format: 'tanggal' },
              { judul: 'Faktur', lebar: 24 },
              { judul: 'Pelanggan', lebar: 28 },
              { judul: 'Nilai faktur', format: 'uang' },
              { judul: 'Pembayaran', format: 'uang' },
              { judul: 'Metode', lebar: 18 },
            ],
            baris: data.map((item, index) => [
              index + 1,
              new Date(item.date),
              item.invoiceName,
              item.customer,
              item.value,
              item.payment,
              item.paymentMethod,
            ]),
            totalBaris: [
              'TOTAL',
              null,
              null,
              null,
              data.reduce((a, b) => a + Number(b.value), 0),
              data.reduce((a, b) => a + Number(b.payment), 0),
              null,
            ],
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
