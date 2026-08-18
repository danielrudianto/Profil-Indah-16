import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import {
  NgIf,
  NgFor,
  DecimalPipe,
  SlicePipe,
  formatDate,
} from '@angular/common';
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
import { ReportRankComponent } from 'src/app/components/report-rank/report-rank.component';
import moment, { Moment } from 'moment';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
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
    SlicePipe,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
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
    private dialog: MatDialog,
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

  /* Tiga kartu peringkat — cermin laporan penjualan di sisi beli. */
  supplier: { name: string; value: number }[] = [];
  merek: { name: string; value: number }[] = [];
  tipe: { name: string; value: number }[] = [];

  sorotan: { ikon: string; teks: string; warna?: 'merah' }[] = [];
  private merekLalu: { name: string; value: number }[] | null = null;
  private merekDuaLalu: { name: string; value: number }[] | null = null;
  private tipeLalu: { name: string; value: number }[] | null = null;
  private localeId = inject(LOCALE_ID);

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
          this.susunSorotan();
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

    /* Peringkat supplier/merek/tipe + bahan sorotan — kueri kecil. */
    const periode = {
      month: this.date.value!.month() + 1,
      year: this.date.value!.year(),
    };
    const mundur = (n: number) => {
      const m = this.date.value!.clone().subtract(n, 'month');
      return { month: m.month() + 1, year: m.year() };
    };

    this.merekLalu = null;
    this.merekDuaLalu = null;
    this.tipeLalu = null;
    this.sorotan = [];

    this.apiService.get('report/purchase/supplier', periode).subscribe({
      next: (data: any) => {
        this.supplier = data.data ?? [];
        this.susunSorotan();
      },
    });
    this.apiService.get('report/purchase/brand', periode).subscribe({
      next: (data: any) => {
        this.merek = data.data ?? [];
        this.susunSorotan();
      },
    });
    this.apiService.get('report/purchase/type', periode).subscribe({
      next: (data: any) => {
        this.tipe = data.data ?? [];
        this.susunSorotan();
      },
    });
    this.apiService.get('report/purchase/brand', mundur(1)).subscribe({
      next: (data: any) => {
        this.merekLalu = data.data ?? [];
        this.susunSorotan();
      },
    });
    this.apiService.get('report/purchase/brand', mundur(2)).subscribe({
      next: (data: any) => {
        this.merekDuaLalu = data.data ?? [];
        this.susunSorotan();
      },
    });
    this.apiService.get('report/purchase/type', mundur(1)).subscribe({
      next: (data: any) => {
        this.tipeLalu = data.data ?? [];
        this.susunSorotan();
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

  inisial(nama: string): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  lebarDi(daftar: { value: number }[], nilai: number): number {
    const terbesar = Math.max(...daftar.map((b) => Number(b.value)), 1);
    return Math.max((Number(nilai) / terbesar) * 100, 2);
  }

  persenDi(daftar: { value: number }[], nilai: number): number {
    const total = daftar.reduce((a, b) => a + Number(b.value), 0);
    return total === 0 ? 0 : (Number(nilai) / total) * 100;
  }

  private rupiahRingkas(nilai: number): string {
    if (nilai >= 1_000_000_000) {
      return `Rp ${(nilai / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    }
    if (nilai >= 1_000_000) {
      return `Rp ${(nilai / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} jt`;
    }
    return `Rp ${nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }

  private pangsa(
    daftar: { name: string; value: number }[],
    nama: string,
  ): number | null {
    const total = daftar.reduce((a, b) => a + Number(b.value), 0);
    if (total === 0) return null;
    const baris = daftar.find((x) => x.name === nama);
    return baris ? (Number(baris.value) / total) * 100 : 0;
  }

  private kalimatSelisih(selisih: number): string {
    if (Math.abs(selisih) < 0.1) {
      return this.translateService.instant('sorotan__dominasi__stabil');
    }
    return this.translateService.instant(
      selisih >= 0 ? 'sorotan__dominasi__naik' : 'sorotan__dominasi__turun',
      {
        poin: Math.abs(selisih).toLocaleString('id-ID', {
          maximumFractionDigits: 1,
        }),
      },
    );
  }

  private tanggalSorotan(hari: number): string {
    const d = new Date(this.date.value!.year(), this.date.value!.month(), hari);
    const bulan = formatDate(d, 'MMMM', this.localeId);
    if (this.localeId.startsWith('en')) {
      const sisa = hari % 100;
      const akhiran =
        sisa >= 11 && sisa <= 13
          ? 'th'
          : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[
              hari % 10
            ] ?? 'th';
      return `${hari}${akhiran} of ${bulan}`;
    }
    return `${hari} ${bulan}`;
  }

  /*
    Sorotan belanja — cermin laporan penjualan: kalimatnya DIHITUNG dari
    peringkat, bukan dikarang. Supplier terbesar menggantikan pelanggan
    terbesar (tak ada konsep retail di sisi beli).
  */
  private susunSorotan(): void {
    if (
      this.merek.length === 0 ||
      this.merekLalu === null ||
      this.merekDuaLalu === null
    ) {
      return;
    }

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);
    const hasil: { ikon: string; teks: string; warna?: 'merah' }[] = [];
    const angka = (n: number, d = 1) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: d });

    const juara = this.merek[0];
    const pangsaKini = this.pangsa(this.merek, juara.name)!;
    const pangsaLalu = this.pangsa(this.merekLalu, juara.name);
    let dominasi = t('sorotan-beli__dominasi', {
      merek: juara.name,
      persen: angka(pangsaKini),
    });
    if (pangsaLalu !== null) {
      dominasi += ' ' + this.kalimatSelisih(pangsaKini - pangsaLalu);
    }
    /*
      Streak hanya diklaim sejauh yang benar-benar diperiksa: dua bulan ke
      belakang. Memimpin ketiganya = "setidaknya 3 bulan terakhir" — bulan
      keempat tidak kita lihat, jadi tidak ikut diaku-aku. Persis dua bulan
      (bulan ketiga terbukti kalah) barulah "2 bulan berturut-turut".
    */
    if (this.merekLalu[0]?.name === juara.name) {
      dominasi +=
        ' ' +
        (this.merekDuaLalu[0]?.name === juara.name
          ? t('sorotan__streak-min')
          : t('sorotan__streak', { n: 2 }));
    }
    hasil.push({ ikon: 'ph-crown-simple', teks: dominasi });

    let menguat: { nama: string; kini: number; lalu: number } | null = null;
    for (const b of this.merek.slice(0, 8)) {
      if (b.name === juara.name) continue;
      const kini = this.pangsa(this.merek, b.name)!;
      const lalu = this.pangsa(this.merekLalu, b.name);
      if (lalu === null) continue;
      const naik = kini - lalu;
      if (naik >= 1 && (!menguat || naik > menguat.kini - menguat.lalu)) {
        menguat = { nama: b.name, kini, lalu };
      }
    }
    if (menguat) {
      hasil.push({
        ikon: 'ph-trend-up',
        teks: t('sorotan__menguat', {
          merek: menguat.nama,
          persen: angka(menguat.kini),
          persenLalu: angka(menguat.lalu),
        }),
      });
    }

    if (this.tipe.length > 0 && this.tipeLalu !== null) {
      const juaraTipe = this.tipe[0];
      const pangsaTipe = this.pangsa(this.tipe, juaraTipe.name)!;
      const pangsaTipeLalu = this.pangsa(this.tipeLalu, juaraTipe.name);
      let kalimatTipe = t('sorotan-beli__tipe-dominasi', {
        tipe: juaraTipe.name,
        persen: angka(pangsaTipe),
      });
      if (pangsaTipeLalu !== null) {
        kalimatTipe += ' ' + this.kalimatSelisih(pangsaTipe - pangsaTipeLalu);
      }
      hasil.push({ ikon: 'ph-squares-four', teks: kalimatTipe });
    }

    const totalLalu = this.merekLalu.reduce((a, b) => a + Number(b.value), 0);
    const totalKini = this.merek.reduce((a, b) => a + Number(b.value), 0);
    const kini = new Date();
    const bulanBerjalan =
      this.date.value!.month() === kini.getMonth() &&
      this.date.value!.year() === kini.getFullYear();
    if (totalLalu > 0) {
      if (bulanBerjalan && kini.getDate() < this.hariDalamBulan.length) {
        const proyeksi =
          (totalKini / kini.getDate()) * this.hariDalamBulan.length;
        const naik = proyeksi >= totalLalu;
        hasil.push({
          ikon: naik ? 'ph-trend-up' : 'ph-trend-down',
          warna: naik ? undefined : 'merah',
          teks: t('sorotan-beli__proyeksi', {
            total: this.rupiahRingkas(totalKini),
            proyeksi: this.rupiahRingkas(proyeksi),
            totalLalu: this.rupiahRingkas(totalLalu),
          }),
        });
      } else {
        const persen = ((totalKini - totalLalu) / totalLalu) * 100;
        hasil.push({
          ikon: persen >= 0 ? 'ph-trend-up' : 'ph-trend-down',
          warna: persen >= 0 ? undefined : 'merah',
          teks: t(
            persen >= 0
              ? 'sorotan-beli__banding__naik'
              : 'sorotan-beli__banding__turun',
            {
              total: this.rupiahRingkas(totalKini),
              persen: angka(Math.abs(persen)),
              totalLalu: this.rupiahRingkas(totalLalu),
            },
          ),
        });
      }
    }

    if (this.supplier.length > 0) {
      const juaraSupplier = this.supplier[0];
      hasil.push({
        ikon: 'ph-truck',
        teks: t('sorotan-beli__supplier', {
          nama: juaraSupplier.name,
          nilai: this.rupiahRingkas(Number(juaraSupplier.value)),
          persen: angka(this.persenDi(this.supplier, juaraSupplier.value)),
        }),
      });
    }

    if (this.chart.length > 0) {
      const terbaik = [...this.chart].sort(
        (a, b) => Number(b.value) - Number(a.value),
      )[0];
      if (terbaik && Number(terbaik.value) > 0) {
        hasil.push({
          ikon: 'ph-calendar-check',
          teks: t('sorotan__hari-terbaik', {
            tanggal: this.tanggalSorotan(Number(terbaik.date)),
            nilai: this.rupiahRingkas(Number(terbaik.value)),
          }),
        });
      }
    }

    this.sorotan = hasil;
  }

  /** Peringkat lengkap sebuah dimensi belanja, di dialog. */
  rincian(dimensi: 'supplier' | 'brand' | 'type'): void {
    const judul = {
      supplier: 'report-purchase__best__supplier',
      brand: 'report-sales__rank__brand',
      type: 'report-sales__rank__type',
    }[dimensi];

    this.apiService
      .get(`report/purchase/${dimensi}`, {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          this.dialog.open(ReportRankComponent, {
            data: {
              judul: judul,
              baris: (data.data ?? []).map((x: any) => ({
                name: x.name,
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
