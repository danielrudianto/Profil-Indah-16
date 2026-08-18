import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { SubmitConfirmationComponent } from 'src/app/components/submit-confirmation/submit-confirmation.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserCreateStatusComponent } from './user-create/user-create-status/user-create-status.component';
import { UserEditComponent } from './user-edit/user-edit.component';

/**
 * Daftar pengguna — mengikuti susunan daftar pelanggan. Ukuran halaman
 * ditentukan server lewat process.env.LIMIT, jadi pilihan 10/25/50
 * dimatikan; kata kuncinya hidup.
 */
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    TranslatePipe,
  ],
})
export class UserComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private translateService: TranslateService,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;
  keyword = '';

  ngOnInit(): void {
    this.ambilData();
  }

  lacakPengguna = (_: number, item: any): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('user', {
        keyword: this.keyword,
        page: this.page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataCount = data.count;
          this.dataSource = data.data;
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  cari(kataKunci: string): void {
    this.keyword = kataKunci;
    this.page = 1;
    this.ambilData();
  }

  resetPencarian(): void {
    this.cari('');
  }

  bukaHalaman(halaman: number): void {
    this.page = halaman;
    this.ambilData();
  }

  tambah(): void {
    this.dialog
      .open(UserCreateComponent, {
        width: '560px',
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.page = 1;
          this.ambilData();
        }
      });
  }

  /*
   * Reset sandi untuk pengguna yang LUPA sandinya. Server membuatkan sandi
   * acak; hasilnya ditunjukkan lewat dialog kredensial sekali-tampil yang
   * sama dengan pembuatan akun. Dikonfirmasi dulu — salah pencet berarti
   * sandi orang langsung hangus.
   */
  resetSandi(item: any): void {
    this.dialog
      .open(SubmitConfirmationComponent, {
        data: {
          header: this.translateService.instant('user__reset__action'),
          title: this.translateService.instant('user__reset__confirm'),
          document: `${item.name} — ${item.username}`,
        },
      })
      .afterClosed()
      .subscribe((setuju) => {
        if (!setuju) {
          return;
        }

        this.apiService.put(`user/${item.id}/reset-password`, {}).subscribe({
          next: (data: any) => {
            this.dialog.open(UserCreateStatusComponent, {
              data: { ...data, mode: 'reset' },
              width: '480px',
              disableClose: true,
              panelClass: 'nocturne-dialog',
              backdropClass: 'nocturne-dialog-backdrop',
            });
          },
          error: (error: any) => {
            this.alertService.showError(error);
          },
        });
      });
  }

  ubah(item: any): void {
    this.dialog
      .open(UserEditComponent, {
        data: { id: item.id },
        width: '560px',
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (!data) {
          return;
        }

        const index = this.dataSource.findIndex((x) => x.id === item.id);
        if (index === -1) {
          return;
        }

        if (data === 'deleted') {
          this.dataSource.splice(index, 1);
          this.dataCount = this.dataCount - 1;
          return;
        }

        /*
          Diubah: barisnya diambil ulang dari server — roleText dihitung di
          sana, dan menebaknya di sini berarti dua sumber untuk satu label.
        */
        this.ambilData();
      });
  }
}
