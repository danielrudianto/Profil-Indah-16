import { Component, OnInit } from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ExpenseViewComponent } from '../expense-view/expense-view.component';
import { TranslateService } from '@ngx-translate/core';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import { ExpenseUpdateComponent } from '../expense-update/expense-update.component';
import { ExpenseCreateComponent } from '../expense-create/expense-create.component';

const moment = _rollupMoment || _moment;

/**
 * Daftar pengeluaran — bagian `18a` berkas desain.
 *
 * Bulannya adalah satu-satunya saringan, dan SELALU terisi: daftar pengeluaran
 * tanpa bulan tidak berarti apa-apa. Karena itu kapsulnya tidak punya tombol
 * lepas seperti kapsul saringan di daftar lain — yang bisa dilakukan hanya
 * berpindah ke bulan lain.
 *
 * Adapter tanggalnya dipasang di komponen ini, bukan global: mode bulan-tahun
 * hanya dipakai di sini, dan memasangnya global akan mengubah bentuk setiap
 * datepicker lain di aplikasi.
 */
@Component({
  selector: 'app-expense-mutation',
  templateUrl: './expense-mutation.component.html',
  styleUrl: './expense-mutation.component.scss',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
  ],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
  ],
})
export class ExpenseMutationComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private excelService: ExcelService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private authService: AuthService,
    private translateService: TranslateService,
  ) {}

  isDownloading = false;

  /*
    Ubah dan hapus pengeluaran khusus administrator dan pemilik —
    server menolaknya untuk peran lain, jadi tombolnya pun tidak
    dijanjikan di sini.
  */
  isAdministrator = false;

  date = new FormControl(moment());
  isLoading: boolean = true;
  page: number = 1;
  /*
    Dikirim ke server, bukan diturunkan darinya.

    Dulu nilainya diambil dari banyaknya baris halaman pertama — cukup untuk
    keterangan "1 – 10 dari 79", tetapi menutup pilihan 10/25/50 karena
    server tidak pernah diberi tahu angka lain. Endpoint expense/mutation
    sendiri SUDAH menerima pageSize (dipagari 10000 di controller); hanya
    layar ini yang tidak pernah mengirimnya.
  */
  pageSize: number = 10;
  dataSource: any[] = [];
  dataCount: number = 0;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchReport();
  }

  /** "Agustus 2026" — dibaca kapsul saringan di baris alat. */
  get labelBulan(): string {
    return (this.date.value ?? moment()).format('MMMM YYYY');
  }

  lacakPengeluaran = (_: number, item: any): number => item.id;

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>,
  ) {
    const ctrlValue = this.date.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();

    /*
      Kembali ke halaman satu. Halaman 7 pada bulan lalu belum tentu ada isinya
      di bulan ini, dan daftar kosong yang sebenarnya cuma salah halaman
      terbaca seperti bulan tanpa pengeluaran.
    */
    this.fetchReport(1);
  }

  fetchReport(page: number = this.page) {
    this.isLoading = true;
    this.page = page;

    const bulan = Number((this.date.value ?? moment()).format('MM'));
    const tahun = (this.date.value ?? moment()).format('YYYY');

    this.apiService
      .get('expense/mutation', {
        page: this.page,
        pageSize: this.pageSize,
        month: bulan,
        year: tahun,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
          /*
            pageSize TIDAK lagi diturunkan dari panjang hasil. Menimpanya
            dengan banyaknya baris yang kebetulan kembali akan MEMBATALKAN
            pilihan pengguna pada bulan yang isinya lebih sedikit daripada
            ukuran halamannya: memilih 50 pada bulan berisi tujuh baris
            menjadikan pageSize 7, keterangannya berubah menjadi "1 – 7 dari
            7", dan pemilihnya menyorot angka yang tidak pernah dipilih
            siapa pun.
          */
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  bukaHalaman(halaman: number) {
    this.fetchReport(halaman);
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    /* Kembali ke halaman satu: nomor halaman lama menunjuk potongan lain. */
    this.fetchReport(1);
  }

  /*
    Formulir catat = DIALOG 560px (18b), bukan halaman. Formulirnya lima
    isian pendek; membuka halaman penuh untuk itu membuang konteks daftarnya.
  */
  tambah() {
    this.dialog
      .open(ExpenseCreateComponent, {
        width: '560px',
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.fetchReport();
        }
      });
  }

  /** Klik baris = LIHAT, untuk peran mana pun. Ubahnya milik admin. */
  lihat(i: number) {
    this.dialog
      .open(ExpenseViewComponent, {
        data: { id: this.dataSource[i].id },
      })
      .afterClosed()
      .subscribe((hasil) => {
        if (hasil === 'edit') {
          this.ubah(i);
        }
      });
  }

  /** Rekap Excel seluruh baris bulan aktif — bukan cuma halaman tampil. */
  downloadRekap() {
    this.isDownloading = true;
    const bulan = Number((this.date.value ?? moment()).format('MM'));
    const tahun = (this.date.value ?? moment()).format('YYYY');

    this.apiService
      .get('expense/mutation', {
        page: 1,
        month: bulan,
        year: tahun,
        pageSize: 10000,
      })
      .subscribe({
        next: (data: any) => {
          const baris = (data.data as any[]) ?? [];
          this.excelService
            .unduh(
              `Rekap_pengeluaran_${tahun}-${String(bulan).padStart(2, '0')}`,
              [
                {
                  nama: 'Pengeluaran',
                  judul: 'Rekap pengeluaran',
                  keterangan: this.labelBulan,
                  kolom: [
                    { judul: 'Tanggal', format: 'tanggal' },
                    { judul: 'Deskripsi', lebar: 44 },
                    { judul: 'Tipe', lebar: 22 },
                    { judul: 'Perusahaan', lebar: 26 },
                    { judul: 'Nilai', format: 'uang' },
                  ],
                  baris: baris.map((x) => [
                    x.date == null ? '' : new Date(x.date),
                    x.description,
                    x.expense_type?.name ?? '',
                    x.company?.name ?? '',
                    Number(x.value),
                  ]),
                  totalBaris: [
                    null,
                    null,
                    null,
                    'TOTAL',
                    baris.reduce((a, b) => a + Number(b.value), 0),
                  ],
                },
              ],
            )
            .then(() => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'expense__mutation__export__successful',
                ),
              );
            });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  ubah(i: number) {
    this.dialog
      .open(ExpenseUpdateComponent, {
        data: {
          id: this.dataSource[i].id,
        },
        width: '560px',
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === 'deleted') {
          this.dataSource.splice(i, 1);
          this.dataCount = this.dataCount - 1;
          return;
        }

        /*
          Diubah, bukan dihapus: barisnya diambil ulang dari server. Menambal
          satu per satu di sini berarti menebak ruas mana saja yang berubah,
          dan pengeluaran punya tipe serta perusahaan yang ikut bisa berpindah.
        */
        if (data) {
          this.fetchReport();
        }
      });
  }
}
