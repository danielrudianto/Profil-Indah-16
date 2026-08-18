import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';

import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { Role } from 'src/app/constants/role.constant';

/** Satu ubin angka; nilai uang atau hitungan biasa. */
interface UbinPeran {
  ikon: string;
  label: string;
  nilai: number;
  jenis: 'uang' | 'jumlah';
  subLabel: string;
  /** null berarti sub-nya kalimat saja, tanpa angka pembanding. */
  subNilai: number | null;
  /** Kosong berarti ubinnya bukan tautan. */
  rute: string;
}

interface AksiPeran {
  ikon: string;
  label: string;
  rute: string;
}

/**
 * Dashboard peran sales, purchasing, dan umum — ringkasan angka miliknya
 * sendiri, seturut anatomi dashboard administrator tetapi tanpa angka
 * seluruh toko: endpoint dashboard/sales dan dashboard/purchasing memang
 * hanya mengembalikan penjualan/pembelian hari ini, bulan ini, beserta
 * pembandingnya. Peran umum melihat keduanya.
 *
 * Menggantikan tiga komponen dashboard peran lama yang yatim sejak launcher
 * empat kartu ditiadakan — tidak pernah dirutekan lagi, kulitnya pun lama.
 */
@Component({
  selector: 'app-role-dashboard',
  templateUrl: './role-dashboard.component.html',
  styleUrls: ['./role-dashboard.component.scss'],
  imports: [NgIf, NgFor, DecimalPipe, DatePipe, TranslatePipe],
})
export class RoleDashboardComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private router: Router,
  ) {}

  isLoading = true;
  nama = '';
  peran = '';

  hariIni = new Date();

  ubin: UbinPeran[] = [];
  aksi: AksiPeran[] = [];

  /** Sapaan mengikuti jam peramban, bukan jam server. */
  get kunciSapaan(): string {
    const jam = this.hariIni.getHours();
    if (jam < 11) return 'dashboard__pagi';
    if (jam < 15) return 'dashboard__siang';
    if (jam < 19) return 'dashboard__sore';
    return 'dashboard__malam';
  }

  ngOnInit(): void {
    const info = this.authService.getUserInfo();
    this.nama = info?.name ?? '';
    this.peran = info?.roleText ?? '';

    const peran = info?.role ?? null;
    const lihatJual = peran === Role.Sales || peran === Role.General;
    const lihatBeli = peran === Role.Purchasing || peran === Role.General;

    this.aksi = this.susunAksi(lihatJual, lihatBeli);

    forkJoin({
      jual: lihatJual
        ? this.apiService.post('dashboard/sales', {})
        : of(null),
      beli: lihatBeli
        ? this.apiService.post('dashboard/purchasing', {})
        : of(null),
    })
      .subscribe({
        next: ({ jual, beli }: any) => {
          this.ubin = this.susunUbin(jual, beli);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  private susunUbin(jual: any, beli: any): UbinPeran[] {
    const ubin: UbinPeran[] = [];

    if (jual) {
      ubin.push(
        {
          ikon: 'ph-receipt',
          label: 'dashboard__kartu__penjualan',
          nilai: Number(jual.sales?.current ?? 0),
          jenis: 'uang',
          subLabel: 'dashboard__peran__kemarin',
          subNilai: Number(jual.sales?.previous ?? 0),
          rute: '/Sales-invoice/Archive',
        },
        {
          ikon: 'ph-chart-line-up',
          label: 'dashboard__peran__penjualan-bulan',
          nilai: Number(jual.sales_month?.current ?? 0),
          jenis: 'uang',
          subLabel: 'dashboard__peran__bulan-lalu',
          subNilai: Number(jual.sales_month?.previous ?? 0),
          rute: '/Report/Sales',
        },
      );
    }

    if (beli) {
      ubin.push(
        {
          ikon: 'ph-package',
          label: 'dashboard__kartu__pembelian',
          nilai: Number(beli.purchase?.current ?? 0),
          jenis: 'uang',
          subLabel: 'dashboard__peran__kemarin',
          subNilai: Number(beli.purchase?.previous ?? 0),
          rute: '/Good-receipt/Archive',
        },
        {
          ikon: 'ph-chart-line-up',
          label: 'dashboard__peran__pembelian-bulan',
          nilai: Number(beli.purchase_month?.current ?? 0),
          jenis: 'uang',
          subLabel: 'dashboard__peran__bulan-lalu',
          subNilai: Number(beli.purchase_month?.previous ?? 0),
          rute: '/Report/Purchase',
        },
      );
    }

    /*
      Promosi tampil untuk yang berjualan saja — dan TANPA tautan: menu
      Promosi milik administrator, menautkan ke sana hanya berujung
      terpental oleh penjaganya.
    */
    if (jual && !beli) {
      ubin.push({
        ikon: 'ph-megaphone',
        label: 'dashboard__kartu__promosi',
        nilai: Number(jual.promotion ?? 0),
        jenis: 'jumlah',
        subLabel: 'dashboard__peran__promosi-sub',
        subNilai: null,
        rute: '',
      });
    }

    return ubin;
  }

  private susunAksi(lihatJual: boolean, lihatBeli: boolean): AksiPeran[] {
    const aksi: AksiPeran[] = [];

    if (lihatJual) {
      aksi.push(
        { ikon: 'ph-plus', label: 'dashboard__aksi__faktur', rute: '/Sales-invoice' },
        { ikon: 'ph-arrow-u-up-left', label: 'nav__sales_return', rute: '/Sales-return' },
      );
    }

    if (lihatBeli) {
      aksi.push(
        { ikon: 'ph-package', label: 'nav__good_receipt', rute: '/Good-receipt' },
        { ikon: 'ph-archive', label: 'nav__product', rute: '/Product' },
      );
    }

    aksi.push({
      ikon: 'ph-chart-bar',
      label: 'dashboard__aksi__laporan',
      rute: '/Report',
    });

    return aksi;
  }

  buka(rute: string): void {
    if (rute) {
      this.router.navigate([rute]);
    }
  }

  lacakUbin = (_: number, u: UbinPeran): string => u.label;
}
