import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { formatDate, NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
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
  localeId = inject(LOCALE_ID);

  /** Bulanan atau setahun penuh — server memakai month=0 untuk tahunan. */
  periode: 'bulan' | 'tahun' = 'bulan';
  date = new FormControl(moment());

  perusahaan: any[] = [];
  beban: any[] = [];
  stockOut: { hpp: number; sales: number; company_id: number | null }[] = [];
  takTeralokasi = 0;

  /** 12 bulan berakhir di bulan terpilih — bahan grafik dan sorotan. */
  tren: {
    year: number;
    month: number;
    sales: number;
    hpp: number;
    expense: number;
  }[] = [];
  sorotan: { ikon: string; teks: string; warna?: 'merah' }[] = [];
  /** Sorotan butuh angka bulan ini DAN tren; keduanya tiba terpisah. */
  private utamaSiap = false;

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
    this.utamaSiap = false;
    this.sorotan = [];
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

  /** Tren 12 bulan; tampilan tahunan memakai jendela Januari–Desember. */
  private ambilTren(): void {
    this.tren = [];
    this.apiService
      .get('report/profit-loss/trend', {
        month: this.periode === 'bulan' ? this.date.value!.month() + 1 : 12,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          this.tren = (data.data ?? []).map((x: any) => ({
            year: Number(x.year),
            month: Number(x.month),
            sales: Number(x.sales ?? 0),
            hpp: Number(x.hpp ?? 0),
            expense: Number(x.expense ?? 0),
          }));
          this.susunSorotan();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
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
  /* Grafik tren 12 bulan                                              */
  /* ---------------------------------------------------------------- */

  labaBaris(b: { sales: number; hpp: number; expense: number }): number {
    return b.sales - b.hpp - b.expense;
  }

  private get maksPendapatan(): number {
    return Math.max(...this.tren.map((x) => x.sales), 1);
  }

  private get maksLaba(): number {
    return Math.max(...this.tren.map((x) => this.labaBaris(x)), 1);
  }

  tinggiPendapatan(b: (typeof this.tren)[number]): number {
    return (b.sales / this.maksPendapatan) * 100;
  }

  /** Bulan merugi digambar 0; angka minusnya tetap jujur di tooltip. */
  tinggiLaba(b: (typeof this.tren)[number]): number {
    return Math.max(0, (this.labaBaris(b) / this.maksLaba) * 100);
  }

  labelBulan(b: (typeof this.tren)[number]): string {
    return formatDate(new Date(b.year, b.month - 1, 1), 'MMM', this.localeId);
  }

  bulanPenuh(b: (typeof this.tren)[number]): string {
    return formatDate(new Date(b.year, b.month - 1, 1), 'MMMM y', this.localeId);
  }

  get rentangTren(): string {
    if (this.tren.length === 0) {
      return '';
    }
    const ujung = (b: (typeof this.tren)[number]) =>
      formatDate(new Date(b.year, b.month - 1, 1), 'MMM y', this.localeId);
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

  /** "Naik 0 poin" itu janggal; selisih di bawah 0,1 poin disebut stabil. */
  private kalimatSelisih(selisih: number): string {
    if (Math.abs(selisih) < 0.1) {
      return this.translateService.instant('sorotan-keu__stabil');
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

  /*
    Dipanggil setiap salah satu bahannya tiba; baru menyusun ketika angka
    bulan ini dan trennya sama-sama lengkap. Hanya pada tampilan bulanan —
    seluruh kalimatnya membandingkan bulan dengan bulan.
  */
  private susunSorotan(): void {
    if (this.periode !== 'bulan' || !this.utamaSiap || this.tren.length < 2) {
      return;
    }

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);
    const hasil: { ikon: string; teks: string; warna?: 'merah' }[] = [];
    const angka = (n: number, d = 1) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: d });

    const kini = this.tren[this.tren.length - 1];
    const lalu = this.tren[this.tren.length - 2];

    /*
      1. Perusahaan penyumbang laba bersih terbesar. Pangsanya hanya
      diklaim ketika totalnya utuh: tidak ada perusahaan yang merugi dan
      tidak ada penjualan tanpa alokasi HPP — di luar itu persentasenya
      menyesatkan, jadi cukup nama dan nilainya.
    */
    const perusahaanLaba = this.perusahaan
      .map((p: any) => ({ nama: p.name, nilai: this.labaBersih(p.id) }))
      .sort((a, b) => b.nilai - a.nilai);
    if (perusahaanLaba.length > 1 && perusahaanLaba[0].nilai > 0) {
      const juara = perusahaanLaba[0];
      const pangsaUtuh =
        this.totalLabaBersih > 0 &&
        !this.adaBarisTanpaAlokasi &&
        perusahaanLaba.every((x) => x.nilai >= 0);
      hasil.push({
        ikon: 'ph-buildings',
        teks: pangsaUtuh
          ? t('sorotan-keu__perusahaan-pangsa', {
              nama: juara.nama,
              nilai: this.rupiahRingkas(juara.nilai),
              persen: angka((juara.nilai / this.totalLabaBersih) * 100),
            })
          : t('sorotan-keu__perusahaan', {
              nama: juara.nama,
              nilai: this.rupiahRingkas(juara.nilai),
            }),
      });
    }

    /* 2. Margin kotor + arah geraknya dibanding bulan lalu. */
    if (kini.sales > 0) {
      const marginKini = ((kini.sales - kini.hpp) / kini.sales) * 100;
      let teks = t('sorotan-keu__margin', { persen: angka(marginKini) });
      if (lalu.sales > 0) {
        const marginLalu = ((lalu.sales - lalu.hpp) / lalu.sales) * 100;
        teks += ' ' + this.kalimatSelisih(marginKini - marginLalu);
      }
      hasil.push({ ikon: 'ph-percent', teks: teks });
    }

    /* 3. Seberapa besar beban menggerogoti laba kotor. */
    if (this.totalBeban > 0 && this.totalLabaKotor > 0) {
      hasil.push({
        ikon: 'ph-receipt',
        teks: t('sorotan-keu__beban', {
          nilai: this.rupiahRingkas(this.totalBeban),
          persen: angka((this.totalBeban / this.totalLabaKotor) * 100),
        }),
      });
    }

    /* 4. Banding laba bersih: proyeksi bila bulan masih berjalan. */
    const labaKini = this.labaBaris(kini);
    const labaLalu = this.labaBaris(lalu);
    const sekarang = new Date();
    const bulanBerjalan =
      this.date.value!.month() === sekarang.getMonth() &&
      this.date.value!.year() === sekarang.getFullYear();
    const hariDalamBulan = this.date.value!.daysInMonth();
    if (labaLalu > 0) {
      /* Merah bila arahnya menurun, aksen bila meningkat — sekali lirik. */
      if (bulanBerjalan && sekarang.getDate() < hariDalamBulan) {
        const proyeksi = (labaKini / sekarang.getDate()) * hariDalamBulan;
        const naik = proyeksi >= labaLalu;
        hasil.push({
          ikon: naik ? 'ph-trend-up' : 'ph-trend-down',
          warna: naik ? undefined : 'merah',
          teks: t('sorotan-keu__proyeksi', {
            total: this.rupiahRingkas(labaKini),
            proyeksi: this.rupiahRingkas(proyeksi),
            totalLalu: this.rupiahRingkas(labaLalu),
          }),
        });
      } else {
        const persen = ((labaKini - labaLalu) / labaLalu) * 100;
        hasil.push({
          ikon: persen >= 0 ? 'ph-trend-up' : 'ph-trend-down',
          warna: persen >= 0 ? undefined : 'merah',
          teks: t(
            persen >= 0
              ? 'sorotan-keu__banding__naik'
              : 'sorotan-keu__banding__turun',
            {
              total: this.rupiahRingkas(labaKini),
              persen: angka(Math.abs(persen)),
              totalLalu: this.rupiahRingkas(labaLalu),
            },
          ),
        });
      }
    }

    this.sorotan = hasil;
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
