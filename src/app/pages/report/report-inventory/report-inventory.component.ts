import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * Laporan persediaan — nilai gudang PADA suatu tanggal.
 *
 * Server menghitung sisa tiap lapisan stok pada tanggal itu (kuantitas
 * dikurangi keluaran tertetapkan sampai tanggal tersebut) dan menjumlah
 * harga pokoknya per perusahaan. Keluaran tanpa induk tidak ternilai —
 * ditampilkan sebagai peringatan, bukan diam-diam dianggap nol.
 */
@Component({
  selector: 'app-report-inventory',
  templateUrl: './report-inventory.component.html',
  styleUrls: ['./report-inventory.component.scss'],
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
export class ReportInventoryComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
  ) {}

  isLoading = true;

  date = new FormControl(new Date());

  perusahaan: { id: number; company: string; value: number }[] = [];
  takBernilai = { count: 0, value: 0 };

  ngOnInit(): void {
    this.ambilData();
    this.date.valueChanges.subscribe(() => this.ambilData());
  }

  get teksTanggal(): string {
    return this.datePipe.transform(this.date.value, 'dd MMM yyyy') ?? '—';
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .get('report/inventory', {
        date: moment(this.date.value).format('YYYY-MM-DD'),
      })
      .subscribe({
        next: (data: any) => {
          this.perusahaan = data.companies ?? [];
          this.takBernilai = data.unassigned ?? { count: 0, value: 0 };
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get total(): number {
    return this.perusahaan.reduce((a, b) => a + Number(b.value), 0);
  }

  persen(nilai: number): number {
    return this.total === 0 ? 0 : (Number(nilai) / this.total) * 100;
  }
}
