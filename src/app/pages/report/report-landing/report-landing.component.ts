import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from 'src/app/services/auth.service';
import { Role } from 'src/app/constants/role.constant';

/**
 * Muka laporan — bagian `9b` berkas desain.
 *
 * Grid kartu jenis laporan, DISARING PER PERAN dengan daftar peran yang
 * SAMA dengan penjaga rutenya masing-masing — kartu yang tampil tetapi
 * ditolak penjaganya lebih buruk daripada kartu yang tidak tampil.
 */
@Component({
  selector: 'app-report-landing',
  templateUrl: './report-landing.component.html',
  styleUrls: ['./report-landing.component.scss'],
  imports: [NgFor, RouterLink, TranslatePipe],
})
export class ReportLandingComponent implements OnInit {
  constructor(private authService: AuthService) {}

  /*
    Daftar perannya menjiplak penjaga di app-routing.module.ts:
    Sales/Output → SalesGuard; Purchase/Inadequate → PurchasingGuard;
    Problematic/Money → GeneralGuard.
  */
  private readonly semuaKartu = [
    {
      ikon: 'ph-chart-line-up',
      judul: 'report__landing__sales',
      desk: 'report__landing__sales__desc',
      jalur: '/Report/Sales',
      peran: [Role.Sales, Role.General, Role.Administrator, Role.Owner],
    },
    {
      ikon: 'ph-shopping-cart',
      judul: 'report__landing__purchase',
      desk: 'report__landing__purchase__desc',
      jalur: '/Report/Purchase',
      peran: [Role.Purchasing, Role.General, Role.Administrator, Role.Owner],
    },
    {
      ikon: 'ph-scales',
      judul: 'report__landing__finance',
      desk: 'report__landing__finance__desc',
      jalur: '/Report/Finance',
      peran: [Role.Owner],
    },
    {
      ikon: 'ph-coins',
      judul: 'report__landing__money',
      desk: 'report__landing__money__desc',
      jalur: '/Report/Money',
      peran: [Role.General, Role.Administrator, Role.Owner],
    },
    {
      ikon: 'ph-truck',
      judul: 'report__landing__output',
      desk: 'report__landing__output__desc',
      jalur: '/Report/Output',
      peran: [Role.Sales, Role.General, Role.Administrator, Role.Owner],
    },
    {
      ikon: 'ph-warning-diamond',
      judul: 'report__landing__inadequate',
      desk: 'report__landing__inadequate__desc',
      jalur: '/Report/Inadequate',
      peran: [Role.Purchasing, Role.General, Role.Administrator, Role.Owner],
    },
    {
      ikon: 'ph-seal-question',
      judul: 'report__landing__problematic',
      desk: 'report__landing__problematic__desc',
      jalur: '/Report/Problematic',
      peran: [Role.General, Role.Administrator, Role.Owner],
    },
  ];

  kartu: typeof this.semuaKartu = [];

  ngOnInit(): void {
    const peran = this.authService.getUserInfo()?.role;
    this.kartu =
      peran == null
        ? []
        : this.semuaKartu.filter((k) => k.peran.includes(peran));
  }
}
