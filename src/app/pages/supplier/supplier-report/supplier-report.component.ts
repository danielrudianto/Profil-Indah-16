import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

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
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslatePipe,
  ],
})
export class SupplierReportComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
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
      .get(`supplier/${this.activatedRoute.snapshot.params['id']}/report`, {
        year: this.tahun,
      })
      .subscribe({
        next: (data: any) => {
          this.laporan = data;
          this.susunSorotan();
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

  sorotan: { ikon: string; teks: string }[] = [];

  /*
    Sorotan hanya mengklaim yang benar-benar terbukti dari data periode ini:
    pangsa dihitung ulang dari nilai, bukan mengandalkan urutan kiriman
    server, dan konsentrasi barang teratas tidak diklaim bila daftarnya
    sudah mencakup semua barang (100% hampa makna).
  */
  private susunSorotan(): void {
    this.sorotan = [];
    const lap = this.laporan;
    if (
      !lap ||
      lap.summary.documentCount === 0 ||
      lap.summary.totalValue <= 0
    ) {
      return;
    }

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);
    const angka = (n: number, d = 1) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: d });
    const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

    if (lap.brands.length > 0) {
      const juara = [...lap.brands].sort((a, b) => b.value - a.value)[0];
      if (juara.value > 0) {
        this.sorotan.push({
          ikon: 'ph-crown-simple',
          teks: t('sorotan-supplier__merek', {
            merek: juara.name,
            persen: angka((juara.value / lap.summary.totalValue) * 100),
          }),
        });
      }
    }

    if (lap.topProducts.length > 0) {
      const rutin = [...lap.topProducts].sort(
        (a, b) => b.documentCount - a.documentCount,
      )[0];
      if (rutin.documentCount > 1) {
        this.sorotan.push({
          ikon: 'ph-repeat',
          teks: t('sorotan-supplier__rutin', {
            barang: rutin.description,
            n: angka(rutin.documentCount, 0),
            m: angka(lap.summary.documentCount, 0),
          }),
        });
      }
    }

    this.sorotan.push({
      ikon: 'ph-receipt',
      teks: t('sorotan-supplier__rata', {
        nilai: rupiah(lap.summary.totalValue / lap.summary.documentCount),
      }),
    });

    if (
      lap.topProducts.length > 0 &&
      lap.summary.uniqueProducts > lap.topProducts.length
    ) {
      const nilaiTop = lap.topProducts.reduce(
        (jumlah: number, barang: any) => jumlah + barang.value,
        0,
      );
      this.sorotan.push({
        ikon: 'ph-chart-pie-slice',
        teks: t('sorotan-supplier__konsentrasi', {
          n: lap.topProducts.length,
          persen: angka((nilaiTop / lap.summary.totalValue) * 100),
        }),
      });
    }
  }

  gantiTahun(tahun: number): void {
    this.tahun = tahun;
    this.ambilData();
  }

  kembali(): void {
    this.router.navigate(['/Supplier']);
  }
}
