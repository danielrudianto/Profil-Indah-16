import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';

import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { OverpaymentArchiveViewComponent } from 'src/app/components/document-view/overpayment-archive-view/overpayment-archive-view.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Pengembalian kelebihan bayar pada satu tanggal — daftar rekonsiliasi
 * harian: uang yang keluar hari itu dicocokkan dengan kas/bank sore harinya.
 * Tanggal adalah satu-satunya saringan dan selalu terisi, seperti bulan pada
 * daftar pengeluaran.
 */
@Component({
  selector: 'app-overpayment-return-list',
  templateUrl: './overpayment-return-list.component.html',
  styleUrls: ['./overpayment-return-list.component.scss'],
  providers: [provideNativeDateAdapter()],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    TabelKosongComponent,
    TranslatePipe,
  ],
})
export class OverpaymentReturnListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) {}

  date = new FormControl(new Date());
  dataSource: any[] = [];
  isLoading: boolean = true;

  ngOnInit(): void {
    this.fetchByDate();
    this.date.valueChanges.subscribe(() => this.fetchByDate());
  }

  /** "18 Agustus 2026" — dibaca tombol pemilih tanggal di kepala halaman. */
  get namaTanggal(): string {
    return moment(this.date.value ?? new Date()).format('DD MMMM YYYY');
  }

  /** Jumlah uang yang keluar pada tanggal itu — untuk dicocokkan ke kas. */
  get total(): number {
    return this.dataSource.reduce((a, b) => a + Number(b.value ?? 0), 0);
  }

  lacakItem = (_: number, item: any): number => item.id;

  fetchByDate(): void {
    this.isLoading = true;
    this.apiService
      .post('overpayment/return', {
        date: moment(new Date(this.date.value ?? new Date())).format(
          'YYYY-MM-DD',
        ),
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  openOverpaymentView(id: number): void {
    this.dialog.open(OverpaymentArchiveViewComponent, {
      data: {
        id: id,
      },
    });
  }
}
