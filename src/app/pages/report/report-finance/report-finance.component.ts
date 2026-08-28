import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import {
  formatDate,
  NgIf,
  NgFor,
  DecimalPipe,
  DatePipe,
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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment, { Moment } from 'moment';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { PdfService } from 'src/app/services/pdf.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

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
    private pdfService: PdfService,
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

  /**
   * Beban dikelompokkan per jenis, terbesar dulu.
   *
   * Inilah yang menjawab "keluar buat apa aja" — pertanyaan yang tidak
   * terjawab oleh satu angka total. Dihitung di frontend karena datanya sudah
   * utuh di sini; menambah endpoint hanya untuk pengelompokan berarti satu
   * perjalanan jaringan lagi demi hal yang sama.
   *
   * companyID null berarti seluruh perusahaan. Persentasenya dihitung
   * terhadap total perusahaan ITU, bukan terhadap total keseluruhan —
   * "Karyawan 40%" harus berarti 40% dari beban perusahaan yang sedang
   * dibaca, kalau tidak angkanya membandingkan dua hal yang berbeda.
   *
   * Beban tanpa jenis tetap muncul sebagai "Lainnya", bukan dibuang: rincian
   * yang tidak menjumlah ke totalnya membuat pembaca mencari selisihnya
   * alih-alih membaca isinya.
   */
  bebanPerJenis(
    companyID: number | null = null,
    seluruhnya = true,
  ): { nama: string; nilai: number; persen: number }[] {
    const sumber = seluruhnya
      ? this.beban
      : this.beban.filter((x) => x.company_id == companyID);

    const peta = new Map<string, number>();
    for (const b of sumber) {
      const nama =
        b.expense_type?.name ??
        this.translateService.instant('report-finance__expense-other');
      peta.set(nama, (peta.get(nama) ?? 0) + Number(b.value ?? 0));
    }

    const total = [...peta.values()].reduce((a, b) => a + b, 0);
    return [...peta.entries()]
      .map(([nama, nilai]) => ({
        nama,
        nilai,
        persen: total > 0 ? (nilai / total) * 100 : 0,
      }))
      .sort((a, b) => b.nilai - a.nilai);
  }

  /**
   * Grafik batang mendatar beban, sebagai SVG.
   *
   * SVG, bukan gambar raster: pdfmake menyisipkannya sebagai vektor sehingga
   * tetap tajam dicetak pada ukuran berapa pun, dan tidak perlu canvas
   * tersembunyi hanya untuk melahirkan satu PNG.
   *
   * Satu warna saja, urutan yang membawa maknanya. Warna berbeda per jenis
   * akan menyiratkan pengelompokan yang tidak ada, dan menuntut legenda untuk
   * sesuatu yang sudah tertulis di sebelah batangnya.
   */
  private grafikBeban(
    data: { nama: string; nilai: number; persen: number }[],
  ): string {
    const LEBAR = 720;
    const TINGGI_BARIS = 20;
    const KOLOM_NAMA = 170;
    const KOLOM_NILAI = 170;
    const LEBAR_BATANG = LEBAR - KOLOM_NAMA - KOLOM_NILAI;
    const maks = Math.max(...data.map((x) => x.nilai), 1);
    const tinggi = data.length * TINGGI_BARIS + 6;

    const potongNama = (nama: string) =>
      nama.length > 26 ? nama.slice(0, 25) + '…' : nama;
    const aman = (teks: string) =>
      teks.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const baris = data
      .map((x, i) => {
        const y = i * TINGGI_BARIS + 4;
        const panjang = Math.max((x.nilai / maks) * LEBAR_BATANG, 1);
        const nilai = `${this.decimalPipe.transform(x.nilai, '1.0-0')} · ${x.persen.toFixed(1)}%`;
        return [
          `<text x="0" y="${y + 10}" font-size="9" fill="#333333">${aman(potongNama(x.nama))}</text>`,
          `<rect x="${KOLOM_NAMA}" y="${y + 2}" width="${panjang.toFixed(1)}" height="10" rx="2" fill="#4338ca"/>`,
          `<text x="${LEBAR}" y="${y + 10}" font-size="9" fill="#333333" text-anchor="end">${aman(nilai)}</text>`,
        ].join('');
      })
      .join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${LEBAR}" height="${tinggi}" viewBox="0 0 ${LEBAR} ${tinggi}">${baris}</svg>`;
  }

  /** Nama bulan untuk baris tren; tren menyimpan angka, bukan tanggal. */
  private namaBulanTren(b: { year: number; month: number }): string {
    return moment()
      .year(b.year)
      .month(b.month - 1)
      .format('MMM YYYY');
  }

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
    return formatDate(
      new Date(b.year, b.month - 1, 1),
      'MMMM y',
      this.localeId,
    );
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

  async downloadPdf(): Promise<void> {
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

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);

    /* Empat angka yang dicari lebih dulu oleh siapa pun yang membuka laporan
       ini. Ditaruh di atas tabel supaya tidak perlu dijumlah sendiri dari
       baris-baris di bawahnya. */
    const kotak = (label: string, nilai: number, tebal = false) => ({
      width: '*',
      stack: [
        { text: label, style: 'kotakLabel' },
        {
          text: angka(nilai),
          style: tebal ? 'kotakNilaiTebal' : 'kotakNilai',
        },
      ],
    });

    /*
      Satu bagian beban untuk tiap perusahaan, ditambah satu bagian gabungan
      ketika perusahaannya lebih dari satu. Perusahaan tanpa beban bulan itu
      dilewati — judul dengan grafik kosong di bawahnya tidak memberi tahu
      apa pun selain bahwa ada yang tidak diisi.
    */
    const bagianBeban = (
      judul: string,
      companyID: number | null,
      semua: boolean,
    ) => {
      const data = this.bebanPerJenis(companyID, semua);
      if (data.length === 0) {
        return [];
      }

      const total = data.reduce((a, b) => a + b.nilai, 0);
      return [
        { text: judul, style: 'seksiKecil' } as any,
        {
          svg: this.grafikBeban(data),
          width: 720,
          margin: [0, 2, 0, 6],
        } as any,
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto'],
            body: [
              [
                { text: 'Jenis / Type', style: 'kepala' },
                { text: 'Nilai / Value', style: 'kepala' },
                { text: 'Porsi / Share', style: 'kepala' },
              ],
              ...data.map((b) => [
                { text: b.nama, style: 'isi' },
                { text: angka(b.nilai), style: 'isiAngka' },
                { text: `${b.persen.toFixed(1)}%`, style: 'isiAngka' },
              ]),
              [
                { text: 'TOTAL', style: 'kepala' },
                { text: angka(total), style: 'totalAngka' },
                { text: '100,0%', style: 'totalAngka' },
              ],
            ],
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 14] as any,
        } as any,
      ];
    };

    const seksiBeban = [
      ...(this.perusahaan.length > 1
        ? bagianBeban(t('report-finance__expense-all'), null, true)
        : []),
      ...this.perusahaan.flatMap((p: any) => bagianBeban(p.name, p.id, false)),
    ];

    const barisTren = this.tren.map((b) => [
      { text: this.namaBulanTren(b), style: 'isi' },
      { text: angka(b.sales), style: 'isiAngka' },
      { text: angka(b.hpp), style: 'isiAngka' },
      { text: angka(b.sales - b.hpp), style: 'isiAngka' },
      { text: angka(b.expense), style: 'isiAngka' },
      { text: angka(this.labaBaris(b)), style: 'isiAngka' },
    ]);

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
          columns: [
            kotak(t('report-finance__income'), this.totalPendapatan),
            kotak(t('report-finance__gross-profit'), this.totalLabaKotor),
            kotak(t('report-finance__expenses'), this.totalBeban),
            kotak(t('report-finance__net-profit'), this.totalLabaBersih, true),
          ],
          columnGap: 12,
          margin: [0, 0, 0, 6] as any,
        } as any,

        /* Disebut di badan laporan, bukan di catatan kaki: pembaca yang
           membandingkan pendapatan di sini dengan uang yang masuk akan
           menemukan selisih, dan penjelasannya harus ada di tempat selisih
           itu terlihat. */
        {
          text: t('report-finance__admin-fee-note'),
          style: 'catatan',
        } as any,

        /* Sorotan hanya tersusun untuk tampilan bulanan — perbandingan dengan
           bulan sebelumnya tidak punya arti pada tampilan tahunan. Bagiannya
           dihilangkan seluruhnya ketika kosong, bukan dicetak sebagai judul
           tanpa isi. */
        ...(this.sorotan.length > 0
          ? [
              { text: t('report-finance__highlights'), style: 'seksi' } as any,
              {
                ul: this.sorotan.map((x) => ({
                  text: x.teks,
                  style: 'sorotan',
                })),
                margin: [0, 0, 0, 12] as any,
              } as any,
            ]
          : []),

        { text: t('report-finance__per-company'), style: 'seksi' } as any,
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
          margin: [0, 0, 0, 14] as any,
        } as any,

        ...(seksiBeban.length > 0
          ? [
              {
                text: t('report-finance__expense-breakdown'),
                style: 'seksi',
              } as any,
              ...seksiBeban,
            ]
          : []),

        ...(barisTren.length > 0
          ? [
              { text: t('report-finance__trend'), style: 'seksi' } as any,
              {
                table: {
                  headerRows: 1,
                  widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                  body: [
                    [
                      { text: 'Bulan / Month', style: 'kepala' },
                      { text: 'Pendapatan / Income', style: 'kepala' },
                      { text: 'HPP / COGS', style: 'kepala' },
                      { text: 'Laba Kotor / Gross Profit', style: 'kepala' },
                      { text: 'Beban / Expenses', style: 'kepala' },
                      { text: 'Laba Bersih / Net Profit', style: 'kepala' },
                    ],
                    ...barisTren,
                  ],
                },
                layout: 'lightHorizontalLines',
              } as any,
            ]
          : []),
      ],
      styles: {
        judul: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
        sub: { fontSize: 10, color: '#666666', margin: [0, 0, 0, 10] },
        peringatan: { fontSize: 9, color: '#a45f00', margin: [0, 0, 0, 8] },
        seksi: { fontSize: 11, bold: true, margin: [0, 0, 0, 5] },
        seksiKecil: { fontSize: 9, bold: true, margin: [0, 4, 0, 0] },
        catatan: { fontSize: 8, color: '#666666', margin: [0, 0, 0, 12] },
        sorotan: { fontSize: 9, margin: [0, 0, 0, 2] },
        kotakLabel: { fontSize: 8, color: '#666666' },
        kotakNilai: { fontSize: 13, bold: true },
        kotakNilaiTebal: { fontSize: 15, bold: true },
        kepala: { fontSize: 9, bold: true },
        isi: { fontSize: 9 },
        isiAngka: { fontSize: 9, alignment: 'right' },
        totalAngka: { fontSize: 9, bold: true, alignment: 'right' },
      },
    };

    await this.pdfService.unduh(
      dokumen,
      `Laba_Rugi_${this.namaBulan.replace(/ /g, '_')}.pdf`,
    );
    this.isDownloading = false;
  }
}
