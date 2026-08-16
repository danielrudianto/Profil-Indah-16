import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Tipe pengeluaran — daftar BAKU, baca-saja.
 *
 * Hirarki induk-anak dan formulir tambah/ubahnya dibuang atas keputusan
 * pemilik: tipenya datar dan terkendali supaya laporan tidak beranak-pinak.
 * Isi daftarnya dijaga seeder di backend; halaman ini tinggal jendela untuk
 * melihat tipe apa saja yang tersedia. Endpoint-nya mengembalikan seluruh
 * daftar sekaligus — tanpa halaman, tanpa kata kunci.
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
  ) {}

  isLoading = true;
  dataSource: any[] = [];

  ngOnInit(): void {
    this.ambilData();
  }

  lacakTipe = (_: number, item: any): number => item.id;

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
}
