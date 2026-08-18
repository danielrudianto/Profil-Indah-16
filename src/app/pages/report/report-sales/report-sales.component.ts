import { Component, LOCALE_ID, OnInit, inject } from '@angular/core';
import {
  NgIf,
  NgFor,
  DecimalPipe,
  LowerCasePipe,
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
import moment, { Moment } from 'moment';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import { ReportRankComponent } from 'src/app/components/report-rank/report-rank.component';
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


  /**
   * Sorotan bulan ini — kalimat yang DIHITUNG, bukan dikarang: dominasi
   * merek (plus berapa bulan berturut memimpin), merek yang menguat,
   * banding/proyeksi total terhadap bulan lalu, dan hari terbaik.
   * Bahannya dua panggilan kecil ekstra: peringkat merek satu dan dua
   * bulan sebelumnya.
   */
  sorotan: { ikon: string; teks: string; warna?: 'merah' }[] = [];
  private localeId = inject(LOCALE_ID);
  private merekLalu: { name: string; value: number }[] | null = null;
  private merekDuaLalu: { name: string; value: number }[] | null = null;
  private tipeLalu: { name: string; value: number }[] | null = null;

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
          /* Grafiknya bahan kalimat "hari terbaik" — susun ulang. */
          this.susunSorotan();
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
        this.susunSorotan();
      },
    });

    /* Dua bulan ke belakang untuk sorotan — kueri kecil terindeks. */
    const mundur = (n: number) => {
      const m = this.date.value!.clone().subtract(n, 'month');
      return { month: m.month() + 1, year: m.year() };
    };

    this.merekLalu = null;
    this.merekDuaLalu = null;
    this.tipeLalu = null;
    this.sorotan = [];

    this.apiService.get('report/sales/brand', mundur(1)).subscribe({
      next: (data: any) => {
        this.merekLalu = data.data ?? [];
        this.susunSorotan();
      },
    });

    this.apiService.get('report/sales/brand', mundur(2)).subscribe({
      next: (data: any) => {
        this.merekDuaLalu = data.data ?? [];
        this.susunSorotan();
      },
    });

    this.apiService.get('report/sales/type', mundur(1)).subscribe({
      next: (data: any) => {
        this.tipeLalu = data.data ?? [];
        this.susunSorotan();
      },
    });

    this.apiService.get('report/sales/type', periode).subscribe({
      next: (data: any) => {
        this.tipe = data.data ?? [];
        this.susunSorotan();
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

  /**
   * "6 Agustus" dalam bahasa Indonesia, "6th of August" dalam Inggris —
   * nama bulannya dari locale aplikasi, bukan bawaan moment yang Inggris.
   */
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

  private pangsa(daftar: { name: string; value: number }[], nama: string): number | null {
    const total = daftar.reduce((a, b) => a + Number(b.value), 0);
    if (total === 0) return null;
    const baris = daftar.find((x) => x.name === nama);
    return baris ? (Number(baris.value) / total) * 100 : 0;
  }

  /*
    Dipanggil setiap salah satu bahannya tiba; baru menyusun ketika
    ketiganya lengkap. Setiap kalimat dihitung dari angka — tidak ada
    yang dikarang, jadi tidak pernah keliru gaya "AI".
  */
  private susunSorotan(): void {
    if (this.merek.length === 0 || this.merekLalu === null || this.merekDuaLalu === null) {
      return;
    }

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);
    const hasil: { ikon: string; teks: string; warna?: 'merah' }[] = [];
    const angka = (n: number, d = 1) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: d });

    /* 1. Dominasi + berapa bulan berturut memimpin. */
    const juara = this.merek[0];
    const pangsaKini = this.pangsa(this.merek, juara.name)!;
    const pangsaLalu = this.pangsa(this.merekLalu, juara.name);
    let dominasi: string;
    if (pangsaLalu === null) {
      dominasi = t('sorotan__dominasi', {
        merek: juara.name,
        persen: angka(pangsaKini),
      });
    } else {
      dominasi =
        t('sorotan__dominasi', { merek: juara.name, persen: angka(pangsaKini) }) +
        ' ' +
        this.kalimatSelisih(pangsaKini - pangsaLalu);
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

    /* 2. Merek non-juara dengan kenaikan pangsa terbesar (>= 1 poin). */
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

    /* 3. Tipe terlaris + tipe yang menguat — cermin logika mereknya. */
    if (this.tipe.length > 0 && this.tipeLalu !== null) {
      const juaraTipe = this.tipe[0];
      const pangsaTipe = this.pangsa(this.tipe, juaraTipe.name)!;
      const pangsaTipeLalu = this.pangsa(this.tipeLalu, juaraTipe.name);
      let kalimatTipe = t('sorotan__tipe-dominasi', {
        tipe: juaraTipe.name,
        persen: angka(pangsaTipe),
      });
      if (pangsaTipeLalu !== null) {
        kalimatTipe += ' ' + this.kalimatSelisih(pangsaTipe - pangsaTipeLalu);
      }
      hasil.push({ ikon: 'ph-squares-four', teks: kalimatTipe });

      let tipeMenguat: { nama: string; kini: number; lalu: number } | null =
        null;
      for (const b of this.tipe.slice(0, 8)) {
        if (b.name === juaraTipe.name) continue;
        const kini = this.pangsa(this.tipe, b.name)!;
        const lalu = this.pangsa(this.tipeLalu, b.name);
        if (lalu === null) continue;
        const naik = kini - lalu;
        if (naik >= 1 && (!tipeMenguat || naik > tipeMenguat.kini - tipeMenguat.lalu)) {
          tipeMenguat = { nama: b.name, kini, lalu };
        }
      }
      if (tipeMenguat) {
        hasil.push({
          ikon: 'ph-trend-up',
          teks: t('sorotan__tipe-menguat', {
            tipe: tipeMenguat.nama,
            persen: angka(tipeMenguat.kini),
            persenLalu: angka(tipeMenguat.lalu),
          }),
        });
      }
    }

    /* 4. Banding total: proyeksi bila bulan masih berjalan. */
    const totalLalu = this.merekLalu.reduce((a, b) => a + Number(b.value), 0);
    const totalKini = this.merek.reduce((a, b) => a + Number(b.value), 0);
    const kini = new Date();
    const bulanBerjalan =
      this.date.value!.month() === kini.getMonth() &&
      this.date.value!.year() === kini.getFullYear();
    if (totalLalu > 0) {
      /* Merah bila arahnya menurun, aksen bila meningkat — sekali lirik. */
      if (bulanBerjalan && kini.getDate() < this.hariDalamBulan.length) {
        const proyeksi = (totalKini / kini.getDate()) * this.hariDalamBulan.length;
        const naik = proyeksi >= totalLalu;
        hasil.push({
          ikon: naik ? 'ph-trend-up' : 'ph-trend-down',
          warna: naik ? undefined : 'merah',
          teks: t('sorotan__proyeksi', {
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
          teks: t(persen >= 0 ? 'sorotan__banding__naik' : 'sorotan__banding__turun', {
            total: this.rupiahRingkas(totalKini),
            persen: angka(Math.abs(persen)),
            totalLalu: this.rupiahRingkas(totalLalu),
          }),
        });
      }
    }

    /*
      5. Pelanggan terbesar — retail DIKELUARKAN dari hitungan atas
      permintaan pemilik: retail itu gabungan ribuan pembeli anonim,
      menang terus, dan tidak bisa ditindaklanjuti sebagai pelanggan.
      Pangsanya dihitung terhadap penjualan non-retail.
    */
    const nonRetail = (this.pelanggan as any[]).filter((x) => x.id !== null);
    if (nonRetail.length > 0) {
      const juaraPelanggan = nonRetail[0];
      const totalNonRetail = nonRetail.reduce(
        (a, b) => a + Number(b.value),
        0,
      );
      hasil.push({
        ikon: 'ph-user-circle-check',
        teks: t('sorotan__pelanggan', {
          nama: juaraPelanggan.name,
          nilai: this.rupiahRingkas(Number(juaraPelanggan.value)),
          persen: angka((Number(juaraPelanggan.value) / totalNonRetail) * 100),
        }),
      });
    }

    /* 6. Hari terbaik bulan ini. */
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
