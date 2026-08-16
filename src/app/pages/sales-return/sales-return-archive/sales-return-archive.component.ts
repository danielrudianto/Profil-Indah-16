import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';

import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { ArchiveMode } from 'src/app/components/archives/archives.component';
import { ArchivesComponent } from 'src/app/components/archives/archives.component';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { SalesReturnArchiveFilterComponent } from './sales-return-archive-filter/sales-return-archive-filter.component';
import { SalesReturnArchiveViewComponent } from 'src/app/components/document-view/sales-return-archive-view/sales-return-archive-view.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Arsip retur penjualan — kembaran arsip faktur penjualan (4a) tanpa
 * urusannya dengan pembayaran.
 *
 * Kepala kolomnya TIDAK bisa diurutkan: endpoint arsipnya menuntut sortBy
 * dan sortDirection lolos skema, tetapi controller tidak meneruskan
 * keduanya ke repository — tombol urut hanya akan berbohong. Keduanya
 * tetap dikirim bernilai tetap supaya lolos validasi.
 */
@Component({
  selector: 'app-sales-return-archive',
  templateUrl: './sales-return-archive.component.html',
  animations: [slideInOutAnimation],
  imports: [
    TabelKosongComponent,
    ArchivesComponent,
    ListPageComponent,
    NgIf,
    NgFor,
    DatePipe,
    TranslatePipe,
  ],
})
export class SalesReturnArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  mode: ArchiveMode = ArchiveMode.year;
  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  /* Ukuran halaman dipatok server lewat LIMIT; tidak ada pilihan di layar. */
  pageSize = 10;
  isLoading = false;
  month: number | null = null;
  year: number | null = null;
  keyword = '';

  filterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    isActive: new FormControl(''),
    isDelete: new FormControl(''),
  });

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';

    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isActive: true,
      isDelete: true,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('sales-return/archives', {
        month: this.month,
        year: this.year,
        page: this.page,
        keyword: this.keyword,
        startDate: moment(
          new Date(this.filterFormGroup.get('startDate')?.value),
        ).format('YYYY-MM-DD'),
        endDate: moment(
          new Date(this.filterFormGroup.get('endDate')?.value),
        ).format('YYYY-MM-DD'),
        isActive: this.filterFormGroup.get('isActive')?.value,
        isDelete: this.filterFormGroup.get('isDelete')?.value,
        /* Dituntut skema, diabaikan controller — lihat catatan kelas. */
        sortBy: 'date',
        sortDirection: 'desc' as const,
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

  /** Saringan aktif sebagai kapsul yang bisa dilepas — satu sumber: formulir. */
  get kapsul(): { kunci: string; teks: string }[] {
    const v = this.filterFormGroup.value;
    const hasil: { kunci: string; teks: string }[] = [];

    if (v.startDate && v.endDate) {
      const dari = moment(new Date(v.startDate)).format('D MMM');
      const sampai = moment(new Date(v.endDate)).format('D MMM YYYY');
      hasil.push({ kunci: 'tanggal', teks: `${dari} – ${sampai}` });
    }

    if (!(v.isActive && v.isDelete)) {
      if (v.isActive) hasil.push({ kunci: 'aktif', teks: 'Aktif' });
      if (v.isDelete) hasil.push({ kunci: 'dihapus', teks: 'Dihapus' });
    }

    return hasil;
  }

  lepasKapsul(kunci: string): void {
    if (kunci === 'tanggal') {
      this.filterFormGroup.patchValue({
        startDate: new Date(this.year!, this.month! - 1, 1),
        endDate: new Date(this.year!, this.month!, 0),
      });
    } else if (kunci === 'aktif') {
      this.filterFormGroup.patchValue({ isActive: false });
    } else if (kunci === 'dihapus') {
      this.filterFormGroup.patchValue({ isDelete: false });
    }

    /* Melepas kapsul terakhir tidak boleh mengosongkan daftar. */
    const v = this.filterFormGroup.value;
    if (!v.isActive && !v.isDelete) {
      this.filterFormGroup.patchValue({ isActive: true, isDelete: true });
    }

    this.fetchSelectedMonth(1);
  }

  hapusSemuaSaringan(): void {
    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isActive: true,
      isDelete: true,
    });
    this.fetchSelectedMonth(1);
  }

  bukaHalaman(halaman: number) {
    this.page = halaman;
    this.fetchSelectedMonth();
  }

  lacakRetur = (_: number, item: any): number => item.id;

  /** Formulir buat retur adalah anak berjalur '' dari /Sales-return. */
  buatRetur() {
    this.router.navigate(['/Sales-return']);
  }

  backToYear() {
    this.mode = ArchiveMode.year;
    this.month = null;
    this.year = null;
  }

  onQueryChanged(event: string) {
    this.keyword = event;
    this.fetchSelectedMonth(1);
  }

  resetPencarian(): void {
    this.onQueryChanged('');
  }

  openFilter() {
    this.dialog
      .open(SalesReturnArchiveFilterComponent, {
        data: {
          month: this.month,
          year: this.year,
          ...this.filterFormGroup.value,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        /*
          Dialog yang ditutup lewat Batal atau tekan latar tidak mengembalikan
          apa-apa. Tanpa penjagaan ini, checkChanges membaca properti dari
          undefined dan saringannya ikut hangus.
        */
        if (data == null) {
          return;
        }

        if (this.checkChanges(data)) {
          this.filterFormGroup.patchValue(data);
          this.fetchSelectedMonth(1);
        }
      });
  }

  private checkChanges(data: any) {
    const lama = this.filterFormGroup.value;

    if (data.isActive != lama.isActive) return true;
    if (data.isDelete != lama.isDelete) return true;

    if (
      new Date(lama.startDate).getTime() != new Date(data.startDate).getTime()
    )
      return true;
    if (new Date(lama.endDate).getTime() != new Date(data.endDate).getTime())
      return true;

    return false;
  }

  viewArchive(id: number) {
    this.dialog
      .open(SalesReturnArchiveViewComponent, {
        data: {
          id: id,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'deleted') {
          const index = this.dataSource.findIndex((x) => x.id == id);
          if (index !== -1) {
            this.dataSource[index].is_delete = true;
          }
        }
      });
  }
}
