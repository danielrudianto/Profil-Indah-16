import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { AvatarComponent } from 'src/app/components/avatar/avatar.component';
import { AdjustmentCaseViewComponent } from 'src/app/components/document-view/adjustment-case-view/adjustment-case-view.component';
import { AdjustmentCaseConfirmViewComponent } from './adjustment-case-confirm-view/adjustment-case-confirm-view.component';

/**
 * Antrian konfirmasi penyesuaian stok — bagian `12c` berkas desain.
 *
 * Hanya kasus yang menunggu: begitu disetujui atau ditolak, barisnya keluar
 * dari daftar ini dan tinggal di arsip. Pencarian dan pilihan ukuran halaman
 * dimatikan — endpoint-nya hanya menerima nomor halaman, dan menawarkan
 * kendali yang tidak berpengaruh membuat daftarnya terlihat rusak.
 */
@Component({
  selector: 'app-adjustment-case-confirm',
  templateUrl: './adjustment-case-confirm.component.html',
  styleUrls: ['./adjustment-case-confirm.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    AvatarComponent,
    NgIf,
    NgFor,
    DatePipe,
    TranslatePipe,
  ],
})
export class AdjustmentCaseConfirmComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.ambilData();
  }

  lacakKasus = (_: number, item: any): number => item.id;

  ambilData(page: number = this.page): void {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .get('adjustment-case/unconfirmed', {
        page: page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  bukaHalaman(halaman: number): void {
    this.ambilData(halaman);
  }

  buatPenyesuaian(): void {
    this.router.navigate(['/Adjustment-case']);
  }

  /** Lihat isi kasusnya tanpa memutuskan apa-apa. */
  lihat(item: any): void {
    this.dialog.open(AdjustmentCaseViewComponent, {
      data: {
        id: item.id,
        print: true,
      },
    });
  }

  /** Dialog setujui (12d). Baris keluar dari antrian begitu diputuskan. */
  setujui(item: any): void {
    this.dialog
      .open(AdjustmentCaseConfirmViewComponent, {
        data: { id: item.id },
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((hasil) => {
        if (!hasil) {
          return;
        }

        const index = this.dataSource.findIndex((x) => x.id === item.id);
        if (index !== -1) {
          this.dataSource.splice(index, 1);
          this.dataCount = this.dataCount - 1;
        }
      });
  }
}
