import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment, { Moment } from 'moment';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import { ReportRankComponent } from 'src/app/components/report-rank/report-rank.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Laporan penjualan — bagian `9a` berkas desain.
 *
 * Empat kartu hero (total disorot), grafik batang harian nilai +
 * transaksi yang digambar CSS tanpa pustaka grafik, baris terbaik bulan
 * ini dengan peringkat lengkapnya di dialog, dan penjualan per merek
 * ber-bar. Unduhan Excel-nya dipertahankan apa adanya — pembukuannya
 * sudah bergantung pada bentuk berkas itu.
 *
 * Angka retur TIDAK digambar: endpoint-nya tidak pernah mengirim
 * returned_value/returns, dan bentuk lamanya menampilkan undefined.
 */
@Component({
  selector: 'app-report-sales',
  templateUrl: './report-sales.component.html',
  styleUrls: ['./report-sales.component.scss'],
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
    TranslatePipe,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
  ],
})
export class ReportSalesComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialog,
  ) {}

  isLoading = true;
  isSubmitting = false;

  date = new FormControl(moment());

  total = 0;
  transaksi = 0;
  diskon = 0;
  pengiriman = 0;
  jasa = 0;

  terbaikSales: string | null = null;
  terbaikMerek: string | null = null;
  terbaikTipe: string | null = null;

  chart: any[] = [];
  merek: { name: string; value: number }[] = [];

  /** 'grafik' menggambar batang; 'tabel' merinci angkanya per hari. */
  mode: 'grafik' | 'tabel' = 'grafik';

  ngOnInit(): void {
    this.ambilData();
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .post('report/sales', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
        mode: 'V2',
      })
      .subscribe({
        next: (data: any) => {
          this.total = Number(data.total);
          this.transaksi = Number(data.salesInvoiceCount);
          this.diskon = Number(data.discount);
          this.pengiriman = Number(data.delivery);
          this.jasa = Number(data.service);
          this.chart = data.chart ?? [];
          this.terbaikMerek = data.brand;
          this.terbaikTipe = data.type;
          this.terbaikSales = data.sales;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });

    /* Peringkat merek untuk kartu bar di bawah — endpoint terpisah. */
    this.apiService
      .get('report/sales/brand', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          this.merek = data.data ?? [];
        },
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

  /* ---------------------------------------------------------------- */
  /* Grafik harian                                                     */
  /* ---------------------------------------------------------------- */

  get hariDalamBulan(): number[] {
    const jumlah = new Date(
      this.date.value!.year(),
      this.date.value!.month() + 1,
      0,
    ).getDate();
    return Array.from({ length: jumlah }, (_, i) => i + 1);
  }

  dataHari(hari: number): any {
    return this.chart.find((x) => x.date === hari);
  }

  private get maksNilai(): number {
    return Math.max(...this.chart.map((x) => Number(x.value)), 1);
  }

  private get maksTransaksi(): number {
    return Math.max(...this.chart.map((x) => Number(x.salesInvoiceCount)), 1);
  }

  tinggiNilai(hari: number): number {
    const d = this.dataHari(hari);
    return d ? Math.max((Number(d.value) / this.maksNilai) * 100, 1.5) : 0;
  }

  tinggiTransaksi(hari: number): number {
    const d = this.dataHari(hari);
    return d
      ? Math.max((Number(d.salesInvoiceCount) / this.maksTransaksi) * 100, 1.5)
      : 0;
  }

  keteranganHari(hari: number): string {
    const d = this.dataHari(hari);
    if (!d) {
      return `${hari}: —`;
    }
    return `${hari}: Rp ${Number(d.value).toLocaleString('id-ID')} · ${
      d.salesInvoiceCount
    } transaksi`;
  }

  /* ---------------------------------------------------------------- */
  /* Peringkat                                                         */
  /* ---------------------------------------------------------------- */

  get totalMerek(): number {
    return this.merek.reduce((a, b) => a + Number(b.value), 0);
  }

  get merekTerbesar(): number {
    return Math.max(...this.merek.map((b) => Number(b.value)), 1);
  }

  lebarMerek(nilai: number): number {
    return Math.max((Number(nilai) / this.merekTerbesar) * 100, 2);
  }

  persenMerek(nilai: number): number {
    return this.totalMerek === 0 ? 0 : (Number(nilai) / this.totalMerek) * 100;
  }

  /** Peringkat lengkap sebuah dimensi, di dialog. */
  rincian(dimensi: 'brand' | 'type' | 'sales'): void {
    const judul = {
      brand: 'report-sales__rank__brand',
      type: 'report-sales__rank__type',
      sales: 'report-sales__rank__sales',
    }[dimensi];

    this.apiService
      .get(`report/sales/${dimensi}`, {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          this.dialog.open(ReportRankComponent, {
            data: {
              judul: judul,
              baris: (data.data ?? []).map((x: any) => ({
                /* Dimensi sales memakai kolom `sales`, bukan `name`. */
                name: x.name ?? x.sales ?? 'INTERNAL',
                value: Number(x.value),
              })),
            },
            panelClass: 'nocturne-dialog',
            backdropClass: 'nocturne-dialog-backdrop',
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      });
  }

  /* ---------------------------------------------------------------- */
  /* Unduh — bentuk berkasnya dipertahankan apa adanya                 */
  /* ---------------------------------------------------------------- */

  download(): void {
    this.isSubmitting = true;
    this.apiService
      .post('report/sales/download', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          const worksheetData = [
            [
              'No',
              'Date',
              'Name',
              'Customer name',
              'Value',
              'Discount',
              'Service',
              'Delivery',
              'Total',
              'Sales',
            ],
          ];

          data.forEach((y: any, index: number) => {
            const excelDateSerialNumber = xlsx.SSF.parse_date_code(
              new Date(y.date).getTime() / (24 * 60 * 60 * 1000) + 25569,
            );

            worksheetData.push([
              index + 1,
              excelDateSerialNumber,
              y.name,
              y.customer_name,
              y.value,
              y.discount,
              y.service,
              y.delivery,
              y.value - y.discount + y.service + y.delivery,
              y.sales,
            ]);
          });

          const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
          const range = xlsx.utils.decode_range(worksheet['!ref']!);
          worksheet['!ref'] = xlsx.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: range.e.r, c: range.e.c },
          });

          worksheet['!autofilter'] = {
            ref: xlsx.utils.encode_range({
              s: { r: 0, c: 0 },
              e: { r: 0, c: range.e.c },
            }),
          };

          for (let C = 0; C <= range.e.c; ++C) {
            const address = xlsx.utils.encode_cell({ r: 0, c: C });
            worksheet[address].s = {
              font: {
                bold: true,
                color: { rgb: 'FFFFFF' },
                name: 'Calibri',
                sz: 11,
              },
              fill: {
                fgColor: { rgb: '000000' },
                patternType: 'solid',
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
              },
            };
          }

          worksheet['!cols'] = [
            { wpx: 40 },
            { wpx: 120 },
            { wpx: 120 },
            { wpx: 200 },
            { wpx: 120 },
            { wpx: 120 },
            { wpx: 120 },
            { wpx: 120 },
            { wpx: 120 },
            { wpx: 120 },
          ];

          for (let R = 1; R <= range.e.r; ++R) {
            const dateAddr = xlsx.utils.encode_cell({ r: R, c: 1 });
            const jsDate = new Date(data[R - 1].date);
            worksheet[dateAddr] = {
              t: 'd',
              v: jsDate,
              z: 'dd-mmm-yyyy',
            };
            [4, 5, 6, 7, 8].forEach((col) => {
              const addr = xlsx.utils.encode_cell({ r: R, c: col });
              if (worksheet[addr]) {
                worksheet[addr].z = '#,##0.00;[Red]-#,##0.00';
              }
            });
          }

          const workbook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

          const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, `Sales_report_${new Date().getTime()}.xlsx`);
          this.alertService.showSuccess(
            this.translateService.instant('sales-report__export__successful'),
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}
