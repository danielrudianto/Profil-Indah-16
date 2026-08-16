import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { ExpenseTypeCreateComponent } from './expense-type-create/expense-type-create.component';
import { ExpenseTypeUpdateComponent } from './expense-type-update/expense-type-update.component';

/**
 * Tipe pengeluaran dua tingkat: INDUK BAKU, anak bebas.
 *
 * Induk adalah kategori besar dari seeder — tidak bisa diubah atau dihapus,
 * supaya laporan tetap seragam. Anak bebas ditambah pengguna dan wajib
 * menempel ke salah satu induk; pengeluaran dicatat ke anak. Endpoint-nya
 * mengembalikan seluruh pohon sekaligus, tanpa halaman dan tanpa kata kunci.
 */
@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    TranslatePipe,
  ],
})
export class ExpenseTypeComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
  ) {}

  isLoading = true;
  dataSource: any[] = [];

  ngOnInit(): void {
    this.ambilData();
  }

  lacakTipe = (_: number, item: any): number => item.id;

  get jumlahAnak(): number {
    return this.dataSource.reduce(
      (total, induk) => total + (induk.children?.length ?? 0),
      0,
    );
  }

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('expense-type')
      .subscribe({
        next: (data: any) => {
          this.dataSource = Array.isArray(data) ? data : [];
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  tambah(induk: any = null): void {
    this.dialog
      .open(ExpenseTypeCreateComponent, {
        data: {
          parents: this.dataSource,
          preset: induk,
        },
        width: '560px',
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.ambilData();
        }
      });
  }

  ubah(anak: any, induk: any): void {
    this.dialog
      .open(ExpenseTypeUpdateComponent, {
        data: {
          id: anak.id,
          parentName: induk.name,
        },
        width: '560px',
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.ambilData();
        }
      });
  }
}
