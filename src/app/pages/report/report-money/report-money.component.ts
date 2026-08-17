import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import * as XLSX from 'xlsx';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
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
    MatDatepicker,
    MatDatepickerInput,
  ],
})
export class ReportMoneyComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
  ) {}

  isLoading = true;
  isDownloading = false;

  date = new FormControl(new Date());

  metode: any[] = [];
  dor: { sales: string | null; salesInvoice: number; salesDeposit: number }[] =
    [];

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
    this.apiService
      .post('report/money-receipt', {
        date: this.datePipe.transform(this.date.value, 'yyyy-MM-dd'),
      })
      .subscribe({
        next: (data: any) => {
          this.metode = data.filter((x: any) => x.id !== 0);
          this.dor = data.find((x: any) => x.id === 0)?.data ?? [];
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
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
    const excelData = data.map((item, index) => ({
      no: index + 1,
      date: this.formatDateForExcel(new Date(item.date)),
      invoice_name: item.invoiceName,
      Customer: item.customer,
      Value: item.value,
      Payment: item.payment,
      paymentMethod: item.paymentMethod,
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    if (worksheet['!ref']) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const valueCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 4 })];
        if (valueCell) {
          valueCell.z = '#,##0.00';
        }

        const paymentCell = worksheet[XLSX.utils.encode_cell({ r: row, c: 5 })];
        if (paymentCell) {
          paymentCell.z = '#,##0.00';
        }
      }
    }

    const columnWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet['!cols'] = columnWidths;

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

    XLSX.writeFile(workbook, 'Penerimaan uang.xlsx');
  }

  private formatDateForExcel(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
