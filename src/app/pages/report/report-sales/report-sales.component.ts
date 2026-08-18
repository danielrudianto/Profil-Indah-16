import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, LowerCasePipe, SlicePipe } from '@angular/common';
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

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import { ReportRankComponent } from 'src/app/components/report-rank/report-rank.component';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Laporan penjualan — bagian `9a` berkas desain.
 *
 * Empat kartu hero mengikuti mockup — total (dengan rata-rata per
 * faktur), retur, biaya pengiriman, biaya layanan — grafik batang harian
 * bertumpuk yang digambar CSS tanpa pustaka grafik, kartu terbaik bulan
 * ini berikon di samping grafik, dan penjualan per merek ber-jalur.
 * Unduhan Excel-nya dipertahankan apa adanya — pembukuannya sudah
 * bergantung pada bentuk berkas itu.
 *
 * Angka retur dan jumlah pelanggan dulu tidak pernah dikirim endpoint;
 * keduanya kini ditambahkan di server, bukan diterka di peramban.
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
    LowerCasePipe,
    SlicePipe,
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
    private excelService: ExcelService,
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

  nilaiRetur = 0;
  jumlahRetur = 0;
  jumlahPelanggan = 0;

  chart: any[] = [];
  merek: { name: string; value: number }[] = [];
  tipe: { name: string; value: number }[] = [];
  pelanggan: { name: string; value: number }[] = [];


  /** Kartu rincian harian di dasar halaman — terlipat sampai diminta. */
  rincianTerbuka = false;

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
          this.nilaiRetur = Number(data.returned_value ?? 0);
          this.jumlahRetur = Number(data.returns ?? 0);
          this.jumlahPelanggan = Number(data.customerCount ?? 0);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });

    /* Peringkat merek/tipe/pelanggan — tiga endpoint kecil terpisah. */
    const periode = {
      month: this.date.value!.month() + 1,
      year: this.date.value!.year(),
    };

    this.apiService.get('report/sales/brand', periode).subscribe({
      next: (data: any) => {
        this.merek = data.data ?? [];
      },
    });

    this.apiService.get('report/sales/type', periode).subscribe({
      next: (data: any) => {
        this.tipe = data.data ?? [];
      },
    });

    this.apiService.get('report/sales/customer', periode).subscribe({
      next: (data: any) => {
        /* Faktur retail tidak menunjuk pelanggan; namanya diisi di sini. */
        this.pelanggan = (data.data ?? []).map((x: any) => ({
          ...x,
          name:
            x.name ?? this.translateService.instant('sales-invoice__retail'),
        }));
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

  /** Rata-rata nilai per faktur — sub kartu total, seperti mockup. */
  get rataRataFaktur(): number {
    return this.transaksi === 0 ? 0 : this.total / this.transaksi;
  }

  /** Porsi retur terhadap penjualan, untuk sub kartu retur. */
  get persenRetur(): number {
    return this.total === 0 ? 0 : (this.nilaiRetur / this.total) * 100;
  }

  /** Nama bulan terpilih untuk subjudul dan rentang grafik. */
  get namaBulan(): string {
    return this.date.value!.format('MMMM YYYY');
  }

  get rentangGrafik(): string {
    return `1 – ${this.hariDalamBulan.length} ${this.date.value!.format('MMMM')}`;
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

  inisial(nama: string): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  /* Versi generik untuk ketiga kartu peringkat. */
  lebarDi(daftar: { value: number }[], nilai: number): number {
    const terbesar = Math.max(...daftar.map((b) => Number(b.value)), 1);
    return Math.max((Number(nilai) / terbesar) * 100, 2);
  }

  persenDi(daftar: { value: number }[], nilai: number): number {
    const total = daftar.reduce((a, b) => a + Number(b.value), 0);
    return total === 0 ? 0 : (Number(nilai) / total) * 100;
  }

  persenMerek(nilai: number): number {
    return this.totalMerek === 0 ? 0 : (Number(nilai) / this.totalMerek) * 100;
  }

  /** Peringkat lengkap sebuah dimensi, di dialog. */
  rincian(dimensi: 'brand' | 'type' | 'sales' | 'customer'): void {
    const judul = {
      brand: 'report-sales__rank__brand',
      type: 'report-sales__rank__type',
      sales: 'report-sales__rank__sales',
      customer: 'report-sales__by-customer',
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
                /*
                  Dimensi sales memakai kolom `sales`; pelanggan null
                  berarti faktur retail.
                */
                name:
                  x.name ??
                  (dimensi === 'customer'
                    ? this.translateService.instant('sales-invoice__retail')
                    : (x.sales ?? 'INTERNAL')),
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
          const jumlah = (ambil: (y: any) => number) =>
            (data as any[]).reduce((a, y) => a + ambil(y), 0);

          this.excelService
            .unduh(`Laporan_penjualan_${this.date.value!.format('YYYY-MM')}`, [
              {
                nama: 'Penjualan',
                judul: 'Laporan penjualan',
                keterangan: `Periode ${this.date.value!.format('MMMM YYYY')}`,
                kolom: [
                  { judul: 'No', format: 'angka', lebar: 6 },
                  { judul: 'Date', format: 'tanggal' },
                  { judul: 'Name', lebar: 22 },
                  { judul: 'Customer name', lebar: 30 },
                  { judul: 'Value', format: 'uang' },
                  { judul: 'Discount', format: 'uang' },
                  { judul: 'Service', format: 'uang' },
                  { judul: 'Delivery', format: 'uang' },
                  { judul: 'Total', format: 'uang' },
                  { judul: 'Sales', lebar: 18 },
                ],
                baris: (data as any[]).map((y, index) => [
                  index + 1,
                  new Date(y.date),
                  y.name,
                  y.customer_name,
                  y.value,
                  y.discount,
                  y.service,
                  y.delivery,
                  y.value - y.discount + y.service + y.delivery,
                  y.sales,
                ]),
                totalBaris: [
                  'TOTAL',
                  null,
                  null,
                  null,
                  jumlah((y) => Number(y.value)),
                  jumlah((y) => Number(y.discount)),
                  jumlah((y) => Number(y.service)),
                  jumlah((y) => Number(y.delivery)),
                  jumlah((y) => y.value - y.discount + y.service + y.delivery),
                  null,
                ],
              },
            ])
            .then(() => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'sales-report__export__successful',
                ),
              );
            });
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
