import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

export enum ArchiveMode {
  year,
  month,
}

/**
 * Tahap pilih bulan milik semua halaman arsip — sistem desain Nocturne.
 *
 * Satu seksi per tahun: label tahun dengan garis, lalu kartu bulan dalam
 * grid yang mengatur kolomnya sendiri lewat auto-fill. Bentuk lamanya
 * memakai mat-grid-list dengan pendengar resize pada window yang
 * menghitung jumlah kolom dan rasio kartunya secara manual — dan tidak
 * pernah dilepas ketika komponennya mati.
 */
@Component({
  selector: 'app-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss'],
  imports: [NgFor, NgIf, DatePipe, TranslatePipe],
})
export class ArchivesComponent implements OnInit {
  @Output('onMonthSelected') onMonthSelected: EventEmitter<any> =
    new EventEmitter<any>();
  @Input('route') route!: string;

  /**
   * Kunci i18n judul dan penjelasan di kepala halaman. Opsional supaya
   * keenam pemakainya bisa berpindah satu-satu; kosong berarti tanpa
   * kepala, seperti sebelumnya.
   */
  @Input() heading = '';
  @Input() lede = '';

  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
  ) {}

  years: number[] = [];
  data: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.fetchAnnualItems();
  }

  fetchAnnualItems() {
    this.apiService
      .get(`${this.route}/archives`)
      .subscribe({
        next: (data: any) => {
          this.data = data;
          this.years = this.data
            .map((x) => x.year)
            .filter((nilai, indeks, semua) => semua.indexOf(nilai) == indeks);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  monthData(year: number) {
    return this.data.filter((x) => x.year == year);
  }

  getDateFromMonthYear(month: number, year: number): Date {
    return new Date(year, month, 1);
  }

  selectMonth(year: number, month: number) {
    this.onMonthSelected.emit({ year, month });
  }
}
