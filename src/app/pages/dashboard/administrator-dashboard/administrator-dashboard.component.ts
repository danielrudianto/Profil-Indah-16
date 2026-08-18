import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { RekapHarianService } from 'src/app/services/rekap-harian.service';

/**
 * Dashboard administrator — layar 9c.
 *
 * SATU panggilan GET /dashboard membawa seluruh angkanya: empat ubin
 * hari ini, grafik penjualan tujuh hari, lima faktur terakhir, dan
 * promosi yang sedang berjalan. "Hari ini" dikirim dari peramban karena
 * zona waktu server bukan zona waktu toko.
 */
@Component({
  selector: 'app-administrator-dashboard',
  templateUrl: './administrator-dashboard.component.html',
  styleUrls: ['./administrator-dashboard.component.scss'],
  imports: [NgIf, NgFor, DatePipe, DecimalPipe, TranslatePipe],
})
export class AdministratorDashboardComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
    public rekapHarian: RekapHarianService,
  ) {}

  isLoading = true;
  hariIni = new Date();
  nama = '';
  peran = '';

  sales = { value: 0, count: 0, unpaid: 0 };
  purchase = { value: 0, count: 0 };
  deposit = { value: 0, count: 0 };
  promotion: { count: number; endingSoon: number; rows: any[] } = {
    count: 0,
    endingSoon: 0,
    rows: [],
  };

  /** Tujuh hari penuh — hari tanpa penjualan tetap digambar setinggi nol. */
  minggu: { tanggal: Date; nilai: number }[] = [];
  faktur: any[] = [];

  ngOnInit(): void {
    const info = this.authService.getUserInfo();
    this.nama = info?.name ?? '';
    this.peran = info?.roleText ?? '';
    this.ambilData();
  }

  /** Sapaan mengikuti jam peramban, bukan jam server. */
  get kunciSapaan(): string {
    const jam = this.hariIni.getHours();
    if (jam < 11) return 'dashboard__pagi';
    if (jam < 15) return 'dashboard__siang';
    if (jam < 19) return 'dashboard__sore';
    return 'dashboard__malam';
  }

  get totalMinggu(): number {
    return this.minggu.reduce((a, b) => a + b.nilai, 0);
  }

  private ambilData(): void {
    const t = this.hariIni;
    const tanggal = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;

    this.isLoading = true;
    this.apiService
      .get(`dashboard?date=${tanggal}`)
      .subscribe({
        next: (data: any) => {
          this.sales = data.sales;
          this.purchase = data.purchase;
          this.deposit = data.deposit;
          this.promotion = data.promotion;
          this.faktur = data.invoices ?? [];
          this.susunMinggu(data.week ?? []);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  /**
   * Server hanya mengirim hari yang punya penjualan; sumbu grafik butuh
   * ketujuh harinya supaya jarak antarbatang tetap satu hari.
   */
  private susunMinggu(baris: { date: string; value: number }[]): void {
    const nilaiPerHari = new Map<string, number>();
    for (const b of baris) {
      nilaiPerHari.set(String(b.date).slice(0, 10), Number(b.value));
    }

    this.minggu = [];
    for (let i = 6; i >= 0; i--) {
      const tanggal = new Date(this.hariIni);
      tanggal.setDate(tanggal.getDate() - i);
      const kunci = `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, '0')}-${String(tanggal.getDate()).padStart(2, '0')}`;
      this.minggu.push({ tanggal, nilai: nilaiPerHari.get(kunci) ?? 0 });
    }
  }

  /** Tinggi batang relatif terhadap hari terbesar, minimum tetap terlihat. */
  tinggiBatang(nilai: number): number {
    const terbesar = Math.max(...this.minggu.map((m) => m.nilai), 1);
    return Math.max((nilai / terbesar) * 100, 2);
  }

  hariTerakhir(indeks: number): boolean {
    return indeks === this.minggu.length - 1;
  }

  lacakHari = (_: number, m: { tanggal: Date }): number =>
    m.tanggal.getTime();
  lacakFaktur = (_: number, f: any): number => f.id ?? 0;
  lacakPromosi = (_: number, p: any): number => p.id ?? 0;

  /*
    Pintasan laporan yang paling sering dibuka administrator — permintaan
    pemilik: barang keluar, uang masuk, barang bermasalah, barang kurang.
    Kuncinya memakai judul halaman laporannya sendiri supaya nama di sini
    dan di halamannya tidak pernah berbeda.
  */
  laporanPintas = [
    { kunci: 'report-output__title', ikon: 'ph-truck', rute: '/Report/Output' },
    { kunci: 'report-money__title', ikon: 'ph-coins', rute: '/Report/Money' },
    {
      kunci: 'report-problematic__title',
      ikon: 'ph-warning-octagon',
      rute: '/Report/Problematic',
    },
    {
      kunci: 'report-inadequate__title',
      ikon: 'ph-trend-down',
      rute: '/Report/Inadequate',
    },
  ];

  bukaRute(rute: string): void {
    this.router.navigate([rute]);
  }

  bukaLaporan(): void {
    this.router.navigate(['/Report/Sales']);
  }

  bukaArsipFaktur(): void {
    this.router.navigate(['/Sales-invoice/Archive']);
  }

  bukaDeposit(): void {
    this.router.navigate(['/Deposit']);
  }

  bukaPromosi(id?: number): void {
    this.router.navigate(id ? ['/Promotion', id] : ['/Promotion']);
  }

  /* Aksi cepat — masing-masing rute yang sama dengan menunya. */
  buatFaktur(): void {
    this.router.navigate(['/Sales-invoice']);
  }

  tambahBarang(): void {
    this.router.navigate(['/Product/Create']);
  }

  pelangganBaru(): void {
    this.router.navigate(['/Customer']);
  }

  bukaDaftarLaporan(): void {
    this.router.navigate(['/Report']);
  }
}
