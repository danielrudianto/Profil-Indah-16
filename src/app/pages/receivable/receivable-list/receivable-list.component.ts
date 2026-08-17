import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Daftar piutang per pelanggan — pola app-list-page.
 *
 * Endpoint-nya mengembalikan SEMUA pelanggan yang berutang sekaligus,
 * tanpa halaman — jumlahnya memang sekecil itu. Pencarian berjalan di
 * peramban dan paginasi tidak digambar.
 *
 * Sisa piutang tiap pelanggan diberi BAR RELATIF terhadap yang terbesar
 * — pola "penjualan per merek" di laporan — supaya siapa yang paling
 * banyak menunggak terbaca tanpa membandingkan angka satu-satu.
 */
@Component({
  selector: 'app-receivable-list',
  templateUrl: './receivable-list.component.html',
  styleUrls: ['./receivable-list.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class ReceivableListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  tersaring: any[] = [];
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .get('receivable')
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
          this.saring();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  cari(kataKunci: string): void {
    this.keyword = kataKunci;
    this.saring();
  }

  resetPencarian(): void {
    this.cari('');
  }

  private saring(): void {
    const kunci = this.keyword.toLowerCase();
    this.tersaring = this.dataSource.filter((x) =>
      (x.name ?? '').toLowerCase().includes(kunci),
    );
  }

  sisa(item: any): number {
    return Number(item.value) - Number(item.payment);
  }

  /** Lebar bar relatif terhadap penunggak terbesar, dalam persen. */
  lebarBar(item: any): number {
    const terbesar = Math.max(...this.dataSource.map((x) => this.sisa(x)), 1);
    return Math.max((this.sisa(item) / terbesar) * 100, 2);
  }

  lacakPiutang = (_: number, item: any): number => item.id ?? 0;

  lihat(item: any): void {
    /* Pelanggan eceran tidak punya id — server memakai 0 untuk null. */
    this.router.navigate([item.id ?? 0], { relativeTo: this.route });
  }
}
