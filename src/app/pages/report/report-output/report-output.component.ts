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
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import moment, { Moment } from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PageBreak, TDocumentDefinitions } from 'pdfmake/interfaces';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import {
  ComboItem,
  ComboSearchComponent,
} from 'src/app/components/combo-search/combo-search.component';

// pdfmake 0.2.23 mengekspor objek vfs-nya langsung (module.exports = vfs).
pdfMake.vfs = pdfFonts;

/**
 * Laporan keluar-masuk barang sebulan: stok awal, mutasi per sumber
 * (pembelian, penyesuaian, penjualan, retur), dan stok akhirnya.
 *
 * Bentuk lamanya adalah formulir unduh buta — tidak menampilkan satu
 * angka pun sebelum berkasnya dibuka, mewajibkan setiap merek dan tipe
 * dicentang satu per satu, dan PDF-nya menggandakan SELURUH baris di
 * setiap seksi merek karena lupa menyaring. Sekarang datanya tampil di
 * layar, saringan kosong berarti semua, dan unduhan mengikuti persis
 * apa yang terlihat.
 */
@Component({
  selector: 'app-report-output',
  templateUrl: './report-output.component.html',
  styleUrls: ['./report-output.component.scss'],
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
    MatDatepicker,
    MatDatepickerInput,
    ComboSearchComponent,
  ],
})
export class ReportOutputComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private excelService: ExcelService,
    private alertService: AlertService,
    private translateService: TranslateService,
  ) {}

  isLoading = false;
  isDownloading = false;

  date = new FormControl(moment());

  /** Pengelompokan seksi di layar dan lembar di berkas unduhan. */
  kelompok: 'brand' | 'type' = 'brand';

  /** Saringan. Kosong berarti semua — backend memahaminya begitu. */
  merek: ComboItem[] = [];
  tipe: ComboItem[] = [];

  /* Id yang sudah jadi kapsul — saran yang sama dimatikan di daftarnya. */
  get idMerek(): number[] {
    return this.merek.map((x) => x.id);
  }

  get idTipe(): number[] {
    return this.tipe.map((x) => x.id);
  }

  /**
   * Bawaan: hanya barang yang bergerak bulan itu. Data asli berisi
   * ±6.700 barang dan dua pertiganya diam — menggambar semuanya cuma
   * menenggelamkan mutasi yang justru ingin dibaca.
   */
  hanyaBergerak = true;

  baris: any[] = [];

  /*
    Akordeon: semua kelompok tertutup di awal dan hanya satu yang boleh
    terbuka — daftar penuhnya ±1.600 baris, menggambar semuanya membuat
    halaman panjang setengah mati.
  */
  kelompokTerbuka: string | null = null;

  /*
    Tanpa saringan TIDAK ada yang diambil: laporan penuh berisi ±6.700
    barang — berat diambil dan berat digambar, padahal yang dicari
    hampir selalu satu-dua merek atau tipe. Halaman dibuka dengan ajakan
    memilih saringan dulu.
  */
  get adaSaringan(): boolean {
    return this.merek.length > 0 || this.tipe.length > 0;
  }

  ngOnInit(): void {}

  bukaKelompok(nama: string): void {
    this.kelompokTerbuka = this.kelompokTerbuka === nama ? null : nama;
  }

  ambilData(): void {
    if (!this.adaSaringan) {
      this.baris = [];
      this.kelompokTerbuka = null;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.kelompokTerbuka = null;
    this.apiService
      .post('report/output', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
        group: this.kelompok,
        brand: this.merek.map((x) => x.id),
        type: this.tipe.map((x) => x.id),
      })
      .subscribe({
        next: (data: any) => {
          this.baris = data.data ?? [];
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

  get namaBulan(): string {
    return this.date.value!.format('MMMM YYYY');
  }

  /* ---------------------------------------------------------------- */
  /* Saringan dan pengelompokan                                        */
  /* ---------------------------------------------------------------- */

  /** Ganti kelompok hanya menyusun ulang tampilan — datanya sama. */
  setKelompok(k: 'brand' | 'type'): void {
    this.kelompok = k;
    this.kelompokTerbuka = null;
  }

  pilihMerek(item: ComboItem): void {
    if (this.merek.some((x) => x.id === item.id)) {
      return;
    }
    this.merek = [...this.merek, item];
    this.ambilData();
  }

  hapusMerek(indeks: number): void {
    this.merek = this.merek.filter((_, i) => i !== indeks);
    this.ambilData();
  }

  pilihTipe(item: ComboItem): void {
    if (this.tipe.some((x) => x.id === item.id)) {
      return;
    }
    this.tipe = [...this.tipe, item];
    this.ambilData();
  }

  hapusTipe(indeks: number): void {
    this.tipe = this.tipe.filter((_, i) => i !== indeks);
    this.ambilData();
  }

  /** Seksi per merek/tipe, hanya kelompok yang memang punya baris. */
  get kelompokTampil(): { nama: string; baris: any[] }[] {
    const tampil = this.hanyaBergerak
      ? this.baris.filter((b) => this.mutasi(b) !== 0)
      : this.baris;

    const peta = new Map<string, any[]>();
    for (const b of tampil) {
      const nama =
        this.kelompok === 'brand' ? b.product_brand.name : b.product_type.name;
      if (!peta.has(nama)) {
        peta.set(nama, []);
      }
      peta.get(nama)!.push(b);
    }
    return [...peta.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([nama, isi]) => ({
        nama,
        baris: [...isi].sort((a, b) =>
          String(a.reference).localeCompare(String(b.reference)),
        ),
      }));
  }

  /* ---------------------------------------------------------------- */
  /* Angka turunan                                                     */
  /*                                                                   */
  /* Penjualan dan penyesuaian keluar sudah bertanda minus dari        */
  /* backend, jadi mutasi bersih cukup dijumlahkan apa adanya.         */
  /* ---------------------------------------------------------------- */

  mutasi(b: any): number {
    return (
      Number(b.report.good_receipt) +
      Number(b.report.adjustment_case_found) +
      Number(b.report.adjustment_case_lost) +
      Number(b.report.sales_invoice) +
      Number(b.report.sales_return)
    );
  }

  /**
   * Stok awal + mutasi. Berkas lama menjumlahkan mutasinya saja lalu
   * menamai kolomnya "Final Stock" — stok awalnya tertinggal.
   */
  stokAkhir(b: any): number {
    return Number(b.stock) + this.mutasi(b);
  }

  /* ---------------------------------------------------------------- */
  /* Unduhan — mengikuti kelompok dan saringan yang tampil             */
  /* ---------------------------------------------------------------- */

  private barisEkspor(k: { nama: string; baris: any[] }): any[][] {
    return k.baris.map((x, index) => [
      index + 1,
      x.reference,
      x.description,
      x.product_brand.name,
      x.product_type.name,
      Number(x.stock),
      Number(x.report.adjustment_case_found),
      Number(x.report.adjustment_case_lost),
      Number(x.report.good_receipt),
      Number(x.report.sales_invoice),
      Number(x.report.sales_return),
      this.stokAkhir(x),
      x.unit,
    ]);
  }

  downloadExcel(): void {
    const sheets = this.kelompokTampil.map((k) => ({
      nama: k.nama,
      judul: `Laporan keluar-masuk barang — ${k.nama}`,
      keterangan: `Periode ${this.namaBulan}`,
      kolom: [
        { judul: 'No', format: 'angka' as const, lebar: 6 },
        { judul: 'Reference', lebar: 18 },
        { judul: 'Description', lebar: 42 },
        { judul: 'Brand', lebar: 16 },
        { judul: 'Type', lebar: 16 },
        { judul: 'Initial Stock', format: 'angka' as const },
        { judul: 'Adjustment Input', format: 'angka' as const },
        { judul: 'Adjustment Output', format: 'angka' as const },
        { judul: 'Good Receipt Input', format: 'angka' as const },
        { judul: 'Bill Output', format: 'angka' as const },
        { judul: 'Sales Return', format: 'angka' as const },
        { judul: 'Final Stock', format: 'angka' as const },
        { judul: 'Unit', lebar: 10 },
      ],
      baris: this.barisEkspor(k),
    }));

    this.excelService
      .unduh(
        `Laporan_keluar_masuk_${this.date.value!.format('YYYY-MM')}`,
        sheets,
      )
      .then(() => {
        this.alertService.showSuccess(
          this.translateService.instant('report-output__export__successful'),
        );
      });
  }

  downloadPdf(): void {
    const kelompok = this.kelompokTampil;
    const angka = (nilai: number) => Number(nilai).toLocaleString('id-ID');

    const kepala = (id: string, en: string) => [
      { text: id, style: 'kepala' },
      { text: en, style: 'kepalaSub' },
    ];

    const dokumen: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: kelompok.map((k, i) => ({
        stack: [
          { text: k.nama, style: 'judul' },
          { text: `Periode ${this.namaBulan}`, style: 'sub' },
          {
            table: {
              headerRows: 1,
              widths: [
                'auto',
                70,
                '*',
                'auto',
                'auto',
                38,
                38,
                38,
                38,
                38,
                38,
                40,
                'auto',
              ],
              body: [
                [
                  kepala('No', 'No.'),
                  kepala('Referensi', 'Reference'),
                  kepala('Deskripsi', 'Description'),
                  kepala('Merek', 'Brand'),
                  kepala('Tipe', 'Type'),
                  kepala('Stok awal', 'Initial stock'),
                  kepala('Penyesuaian +', 'Adjustment in'),
                  kepala('Penyesuaian −', 'Adjustment out'),
                  kepala('Pembelian', 'Purchase in'),
                  kepala('Penjualan', 'Sales out'),
                  kepala('Retur', 'Sales return'),
                  kepala('Stok akhir', 'Final stock'),
                  kepala('Satuan', 'Unit'),
                ],
                ...this.barisEkspor(k).map((b) =>
                  b.map((nilai, kolom) => ({
                    text:
                      typeof nilai === 'number' && kolom > 0
                        ? angka(nilai)
                        : String(nilai ?? ''),
                    style: kolom >= 5 && kolom <= 11 ? 'isiAngka' : 'isi',
                  })),
                ),
              ],
            },
            layout: 'lightHorizontalLines',
          },
        ],
        pageBreak:
          i === kelompok.length - 1 ? undefined : ('after' as PageBreak),
      })),
      styles: {
        judul: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
        sub: { fontSize: 10, color: '#666666', margin: [0, 0, 0, 10] },
        kepala: { fontSize: 8, bold: true },
        kepalaSub: { fontSize: 7, italics: true, color: '#616161' },
        isi: { fontSize: 8 },
        isiAngka: { fontSize: 8, alignment: 'right' },
      },
    };

    pdfMake
      .createPdf(dokumen)
      .download(`Output_report_${new Date().getTime()}.pdf`);
  }
}
