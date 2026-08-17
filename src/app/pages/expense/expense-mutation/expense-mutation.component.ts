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
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
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
    private alertService: AlertService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

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
    Ditentukan server dan tidak pernah dikirim ke sini; diturunkan dari
    banyaknya baris pada halaman pertama, dipakai hanya untuk keterangan
    "1 – 10 dari 79".
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
        month: bulan,
        year: tahun,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
          if (this.page === 1 && data.data.length > 0) {
            this.pageSize = data.data.length;
          }
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
