import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import {
  formatDate,
  NgIf,
  NgFor,
  DecimalPipe,
  DatePipe,
} from '@angular/common';
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
  localeId = inject(LOCALE_ID);

  date = new FormControl(new Date());

  metode: any[] = [];
  dor: { sales: string | null; salesInvoice: number; salesDeposit: number }[] =
    [];

  /** 30 hari berakhir di tanggal terpilih — bahan grafik dan sorotan. */
  tren: { date: string; masuk: number; keluar: number }[] = [];
  sorotan: { ikon: string; teks: string }[] = [];
  /** Sorotan butuh angka per metode DAN tren; keduanya tiba terpisah. */
  private utamaSiap = false;

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
    this.utamaSiap = false;
    this.sorotan = [];
    this.apiService
      .post('report/money-receipt', {
        date: this.datePipe.transform(this.date.value, 'yyyy-MM-dd'),
      })
      .subscribe({
        next: (data: any) => {
          this.metode = data.filter((x: any) => x.id !== 0);
          this.dor = data.find((x: any) => x.id === 0)?.data ?? [];
          this.utamaSiap = true;
          this.susunSorotan();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });

    this.ambilTren();
  }

  private ambilTren(): void {
    this.tren = [];
    this.apiService
      .get('report/money-receipt/trend', {
        date: this.datePipe.transform(this.date.value, 'yyyy-MM-dd'),
      })
      .subscribe({
        next: (data: any) => {
          this.tren = (data.data ?? []).map((x: any) => ({
            date: x.date,
            masuk: Number(x.masuk ?? 0),
            keluar: Number(x.keluar ?? 0),
          }));
          this.susunSorotan();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
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
  /* Grafik tren 30 hari                                               */
  /* ---------------------------------------------------------------- */

  bersihBaris(b: { masuk: number; keluar: number }): number {
    return b.masuk - b.keluar;
  }

  private get maksTren(): number {
    return Math.max(...this.tren.map((x) => this.bersihBaris(x)), 1);
  }

  /** Hari yang keluarnya lebih besar digambar 0; minusnya jujur di tooltip. */
  tinggiTren(b: (typeof this.tren)[number]): number {
    return Math.max(0, (this.bersihBaris(b) / this.maksTren) * 100);
  }

  labelHari(b: (typeof this.tren)[number]): string {
    return String(Number(b.date.slice(8, 10)));
  }

  tanggalPenuh(b: (typeof this.tren)[number]): string {
    return formatDate(new Date(b.date), 'd MMMM y', this.localeId);
  }

  get rentangTren(): string {
    if (this.tren.length === 0) {
      return '';
    }
    const ujung = (b: (typeof this.tren)[number]) =>
      formatDate(new Date(b.date), 'd MMM y', this.localeId);
    return `${ujung(this.tren[0])} – ${ujung(this.tren[this.tren.length - 1])}`;
  }

  /* ---------------------------------------------------------------- */
  /* Sorotan — kalimat yang dihitung dari angka, bukan dikarang        */
  /* ---------------------------------------------------------------- */

  /** "Rp 10,3 M" / "Rp 702 jt" — angka sorotan tak butuh presisi rupiah. */
  private rupiahRingkas(nilai: number): string {
    if (nilai >= 1_000_000_000) {
      return `Rp ${(nilai / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    }
    if (nilai >= 1_000_000) {
      return `Rp ${(nilai / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} jt`;
    }
    return `Rp ${nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }

  private susunSorotan(): void {
    if (!this.utamaSiap || this.tren.length < 2) {
      return;
    }

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);
    const hasil: { ikon: string; teks: string }[] = [];
    const angka = (n: number, d = 1) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: d });

    /* 1. Metode yang menampung uang masuk terbesar hari itu. */
    const masukMetode = this.metode
      .map((m: any) => ({
        nama: m.name,
        nilai:
          Number(m.salesInvoice) +
          Number(m.salesDeposit) +
          Number(m.overpayment),
      }))
      .sort((a, b) => b.nilai - a.nilai);
    const totalMasukMetode = masukMetode.reduce((a, b) => a + b.nilai, 0);
    if (masukMetode.length > 1 && totalMasukMetode > 0) {
      const juara = masukMetode[0];
      hasil.push({
        ikon: 'ph-wallet',
        teks: t('sorotan-uang__metode', {
          nama: juara.nama,
          persen: angka((juara.nilai / totalMasukMetode) * 100),
          nilai: this.rupiahRingkas(juara.nilai),
        }),
      });
    }

    /*
      2. Banding kemarin dan rata-rata 30 hari — tanpa merah/biru: uang
      masuk harian naik-turun mengikuti hari pasar, arahnya bukan
      baik/buruk dengan sendirinya. Hari tanpa pergerakan sama sekali
      (belum ada transaksi) tidak dibandingkan — "100% di bawah rata-rata"
      pada hari kosong itu benar secara angka tapi bukan sorotan.
    */
    const kini = this.tren[this.tren.length - 1];
    const kemarin = this.tren[this.tren.length - 2];
    const bersihKini = this.bersihBaris(kini);
    const bersihKemarin = this.bersihBaris(kemarin);
    const adaPergerakan = kini.masuk > 0 || kini.keluar > 0;
    if (adaPergerakan && bersihKemarin > 0) {
      const persen = ((bersihKini - bersihKemarin) / bersihKemarin) * 100;
      const stabil = Math.abs(persen) < 0.1;
      hasil.push({
        ikon: stabil
          ? 'ph-equals'
          : persen >= 0
            ? 'ph-trend-up'
            : 'ph-trend-down',
        teks: t(
          stabil
            ? 'sorotan-uang__banding__stabil'
            : persen >= 0
              ? 'sorotan-uang__banding__naik'
              : 'sorotan-uang__banding__turun',
          {
            total: this.rupiahRingkas(bersihKini),
            persen: angka(Math.abs(persen)),
            totalLalu: this.rupiahRingkas(bersihKemarin),
          },
        ),
      });
    }

    const rata =
      this.tren.reduce((a, b) => a + this.bersihBaris(b), 0) /
      this.tren.length;
    if (adaPergerakan && rata > 0) {
      const persen = ((bersihKini - rata) / rata) * 100;
      hasil.push({
        ikon: 'ph-chart-line',
        teks: t(
          persen >= 0 ? 'sorotan-uang__rata__atas' : 'sorotan-uang__rata__bawah',
          {
            persen: angka(Math.abs(persen)),
            rata: this.rupiahRingkas(rata),
          },
        ),
      });
    }

    /* 3. DOR hari itu — uang yang sudah diterima tapi masih di tangan sales. */
    if (this.totalDor > 0) {
      hasil.push({
        ikon: 'ph-hand-coins',
        teks: t('sorotan-uang__dor', {
          nilai: this.rupiahRingkas(this.totalDor),
          n: this.dor.length,
        }),
      });
    }

    this.sorotan = hasil;
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
