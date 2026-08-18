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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment, { Moment } from 'moment';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
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
 * Laporan pembelian — saudara kandung laporan penjualan, dengan yang
 * benar-benar dikirim endpoint-nya: total belanja, jumlah penerimaan,
 * diskon barang, grafik harian, dan nama terbaik per supplier, merek,
 * dan tipe.
 *
 * Bentuk lamanya membaca data.total yang TIDAK PERNAH ADA — kolom
 * totalnya selalu kosong; bidang yang benar bernama `value`. Peringkat
 * lengkap per dimensi tidak digambar: endpoint-nya memang tidak ada
 * untuk pembelian, dan tombol rincian yang lama membuka panel berisi
 * data yang tidak pernah diisi.
 */
@Component({
  selector: 'app-report-purchase',
  templateUrl: './report-purchase.component.html',
  styleUrls: ['./report-purchase.component.scss'],
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
export class ReportPurchaseComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private excelService: ExcelService,
    private alertService: AlertService,
    private translateService: TranslateService,
  ) {}

  isLoading = true;
  isSubmitting = false;

  date = new FormControl(moment());

  total = 0;
  penerimaan = 0;
  diskon = 0;

  terbaikSupplier: string | null = null;
  terbaikMerek: string | null = null;
  terbaikTipe: string | null = null;

  chart: any[] = [];

  /** Kartu rincian harian di dasar halaman — terlipat sampai diminta. */
  rincianTerbuka = false;

  ngOnInit(): void {
    this.ambilData();
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .post('report/purchase', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
        mode: 'V2',
      })
      .subscribe({
        next: (data: any) => {
          /* Bidangnya `value`; bentuk lama membaca `total` yang tak ada. */
          this.total = Number(data.value);
          this.penerimaan = Number(data.goodReceiptCount);
          this.diskon = Number(data.discount);
          this.chart = data.chart ?? [];
          this.terbaikSupplier = data.supplier;
          this.terbaikMerek = data.brand;
          this.terbaikTipe = data.type;
        },
        error: (error) => {
          this.alertService.showError(error);
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

  /** Rata-rata nilai per penerimaan — pengisi kartu hero keempat. */
  get rataRataPenerimaan(): number {
    return this.penerimaan === 0 ? 0 : this.total / this.penerimaan;
  }

  /** Nama bulan terpilih untuk label tombol pemilih bulan. */
  get namaBulan(): string {
    return this.date.value!.format('MMMM YYYY');
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

  private get maksPenerimaan(): number {
    return Math.max(...this.chart.map((x) => Number(x.goodReceiptCount)), 1);
  }

  tinggiNilai(hari: number): number {
    const d = this.dataHari(hari);
    return d ? Math.max((Number(d.value) / this.maksNilai) * 100, 1.5) : 0;
  }

  tinggiPenerimaan(hari: number): number {
    const d = this.dataHari(hari);
    return d
      ? Math.max((Number(d.goodReceiptCount) / this.maksPenerimaan) * 100, 1.5)
      : 0;
  }

  keteranganHari(hari: number): string {
    const d = this.dataHari(hari);
    if (!d) {
      return `${hari}: —`;
    }
    return `${hari}: Rp ${Number(d.value).toLocaleString('id-ID')} · ${
      d.goodReceiptCount
    } penerimaan`;
  }

  /* ---------------------------------------------------------------- */
  /* Unduh — bentuk berkasnya dipertahankan apa adanya                 */
  /* ---------------------------------------------------------------- */

  download(): void {
    this.isSubmitting = true;
    this.apiService
      .post('report/purchase/download', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          const jumlah = (ambil: (y: any) => number) =>
            (data as any[]).reduce((a, y) => a + ambil(y), 0);

          this.excelService
            .unduh(`Laporan_pembelian_${this.date.value!.format('YYYY-MM')}`, [
              {
                nama: 'Pembelian',
                judul: 'Laporan pembelian',
                keterangan: `Periode ${this.namaBulan}`,
                kolom: [
                  { judul: 'No', format: 'angka', lebar: 6 },
                  { judul: 'Date', format: 'tanggal' },
                  { judul: 'Name', lebar: 24 },
                  { judul: 'Invoice name', lebar: 24 },
                  { judul: 'Faktur', lebar: 20 },
                  { judul: 'Supplier name', lebar: 30 },
                  { judul: 'Value', format: 'uang' },
                  { judul: 'Discount', format: 'uang' },
                  { judul: 'Total', format: 'uang' },
                ],
                baris: (data as any[]).map((y, index) => [
                  index + 1,
                  new Date(y.date),
                  y.name,
                  y.invoice_name,
                  y.faktur,
                  y.supplier_name,
                  y.value,
                  y.discount,
                  y.value - y.discount,
                ]),
                totalBaris: [
                  'TOTAL',
                  null,
                  null,
                  null,
                  null,
                  null,
                  jumlah((y) => Number(y.value)),
                  jumlah((y) => Number(y.discount)),
                  jumlah((y) => y.value - y.discount),
                ],
              },
            ])
            .then(() => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'purchase-report__export__successful',
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
