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
 * Laporan belanja per supplier — hanya super administrator.
 *
 * Seluruhnya agregat: berapa nilai belanja ke supplier ini, merek apa saja
 * yang ia pasok, dan barang apa yang paling sering dibeli darinya. Tahun 0
 * berarti sepanjang waktu; daftar tahunnya dikirim server dari dokumen yang
 * benar-benar ada.
 */
@Component({
  selector: 'app-supplier-report',
  templateUrl: './supplier-report.component.html',
  styleUrls: ['./supplier-report.component.scss'],
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
export class SupplierReportComponent implements OnInit {
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
        `supplier/${this.activatedRoute.snapshot.params['id']}/report`,
        { year: this.tahun },
      )
      .subscribe({
        next: (data: any) => {
          this.laporan = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Supplier']);
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
    this.router.navigate(['/Supplier']);
  }
}
