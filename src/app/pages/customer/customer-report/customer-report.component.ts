import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * Laporan penjualan per pelanggan — hanya super administrator; cermin
 * laporan belanja per supplier.
 *
 * Seluruhnya agregat: berapa nilai penjualan ke pelanggan ini, merek apa
 * saja yang ia beli, dan barang apa yang paling sering ia ambil. Tahun 0
 * berarti sepanjang waktu; daftar tahunnya dikirim server dari faktur yang
 * benar-benar ada.
 */
@Component({
  selector: 'app-customer-report',
  templateUrl: './customer-report.component.html',
  styleUrls: ['./customer-report.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    FormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    TranslatePipe,
  ],
})
export class CustomerReportComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  isLoading = true;
  tahun = 0;
  laporan: any = null;

  ngOnInit(): void {
    this.ambilData();
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .get(
        `customer/${this.activatedRoute.snapshot.params['id']}/report`,
        { year: this.tahun },
      )
      .subscribe({
        next: (data: any) => {
          this.laporan = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Customer']);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  gantiTahun(tahun: number): void {
    this.tahun = tahun;
    this.ambilData();
  }

  kembali(): void {
    this.router.navigate(['/Customer']);
  }
}
