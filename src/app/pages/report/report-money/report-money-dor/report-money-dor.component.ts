import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Rekap DOR per sales — alat potong komisi.
 *
 * DOR adalah sebutan toko untuk SALAH KASIH HARGA: selisihnya dicatat
 * atas nama sales yang memberikan harganya, dan direkap di sini per
 * rentang tanggal untuk dipotong dari komisinya.
 */
@Component({
  selector: 'app-report-money-dor',
  templateUrl: './report-money-dor.component.html',
  styleUrls: ['./report-money-dor.component.scss'],
  providers: [DatePipe],
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
export class ReportMoneyDorComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private pageTitleService: PageTitleService,
  ) {}

  isLoading = true;

  /* Bawaan: bulan berjalan penuh — periode komisi yang biasa direkap. */
  dari = new FormControl(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  sampai = new FormControl(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  );

  baris: { sales: string | null; salesInvoice: number; salesDeposit: number }[] =
    [];

  ngOnInit(): void {
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'report-money__title',
      kembaliJalur: '/Report/Money',
    });

    this.ambilData();

    this.dari.valueChanges.subscribe(() => this.ambilData());
    this.sampai.valueChanges.subscribe(() => this.ambilData());
  }

  teksTanggal(nilai: Date | null): string {
    return this.datePipe.transform(nilai, 'dd MMM yyyy') ?? '—';
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .post('report/money-receipt/dor', {
        startDate: moment(this.dari.value).format('YYYY-MM-DD'),
        endDate: moment(this.sampai.value).format('YYYY-MM-DD'),
      })
      .subscribe({
        next: (data: any) => {
          this.baris = data ?? [];
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  totalBaris(b: any): number {
    return Number(b.salesInvoice) + Number(b.salesDeposit);
  }

  get total(): number {
    return this.baris.reduce((a, b) => a + this.totalBaris(b), 0);
  }
}
