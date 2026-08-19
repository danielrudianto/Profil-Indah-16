import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * Barang dalam satu tipe ATAU satu merek — tampilan baca.
 *
 * Dibuka dari kolom jumlah barang di halaman master tipe dan merek:
 * angkanya berhak dirinci menjadi barang APA SAJA. Satu komponen untuk
 * kedua halaman; yang berbeda hanya endpoint yang ditembak dan nama
 * kolom pendampingnya (tipe menampilkan merek, merek menampilkan tipe).
 */
@Component({
  selector: 'app-category-products-dialog',
  templateUrl: './category-products-dialog.component.html',
  styleUrls: ['./category-products-dialog.component.scss'],
  imports: [NgIf, NgFor, DecimalPipe, ReactiveFormsModule, TranslatePipe],
})
export class CategoryProductsDialogComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { mode: 'type' | 'brand'; id: number; name: string },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<CategoryProductsDialogComponent>,
  ) {}

  isLoading = true;
  baris: {
    id: number;
    reference: string;
    description: string;
    unit: string;
    category: string;
    stock: number;
  }[] = [];

  count = 0;
  page = 1;
  pageSize = 10;
  ukuranHalaman = [10, 25, 50];

  cari = new FormControl('', { nonNullable: true });
  private langganan?: Subscription;

  get halamanTerakhir(): boolean {
    return this.page * this.pageSize >= this.count;
  }

  get dari(): number {
    return this.count === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get sampai(): number {
    return Math.min(this.page * this.pageSize, this.count);
  }

  ngOnInit(): void {
    this.ambil(1);

    this.langganan = this.cari.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.ambil(1));
  }

  ngOnDestroy(): void {
    this.langganan?.unsubscribe();
  }

  ambil(halaman: number): void {
    this.page = halaman;
    this.isLoading = true;

    this.apiService
      .get(`product-${this.data.mode}/${this.data.id}/products`, {
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.cari.value,
      })
      .subscribe({
        next: (data: any) => {
          this.baris = data.data;
          this.count = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialogRef.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.ambil(1);
  }

  tutup(): void {
    this.dialogRef.close();
  }
}
