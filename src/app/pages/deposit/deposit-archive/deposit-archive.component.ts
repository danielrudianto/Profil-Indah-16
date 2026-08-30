import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
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
import { DepositArchiveFilterComponent } from './deposit-archive-filter/deposit-archive-filter.component';
import { DepositViewComponent } from '../deposit-view/deposit-view.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Arsip deposit — kembaran arsip faktur penjualan (4a).
 *
 * Kepala kolomnya BISA diurutkan: berbeda dari arsip retur, endpoint arsip
 * deposit benar-benar meneruskan sortBy (date/name/customer/sales) ke
 * query-nya.
 *
 * Status dokumen dinyatakan tiga keadaan, bukan dua: menunggu (belum
 * dieksekusi), dikonfirmasi (sudah jadi faktur), dan ditolak. Bentuk
 * lamanya menyebut dua yang terakhir "dihapus" saja, padahal keduanya
 * kabar yang sangat berbeda bagi yang membacanya.
 */
@Component({
  selector: 'app-deposit-archive',
  templateUrl: './deposit-archive.component.html',
  animations: [slideInOutAnimation],
  imports: [
    TabelKosongComponent,
    ArchivesComponent,
    ListPageComponent,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    TranslatePipe,
  ],
})
export class DepositArchiveComponent {
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
    isPending: new FormControl(''),
    isDelete: new FormControl(''),
  });

  sortBy = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';

    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isPending: true,
      isDelete: true,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('sales-deposit/archives', {
        month: this.month,
        year: this.year,
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.keyword,
        startDate: moment(
          new Date(this.filterFormGroup.get('startDate')?.value),
        ).format('YYYY-MM-DD'),
        endDate: moment(
          new Date(this.filterFormGroup.get('endDate')?.value),
        ).format('YYYY-MM-DD'),
        isPending: this.filterFormGroup.get('isPending')?.value,
        isDelete: this.filterFormGroup.get('isDelete')?.value,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
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

    if (!(v.isPending && v.isDelete)) {
      if (v.isPending) hasil.push({ kunci: 'menunggu', teks: 'Menunggu' });
      if (v.isDelete) hasil.push({ kunci: 'selesai', teks: 'Selesai' });
    }

    return hasil;
  }

  lepasKapsul(kunci: string): void {
    if (kunci === 'tanggal') {
      this.filterFormGroup.patchValue({
        startDate: new Date(this.year!, this.month! - 1, 1),
        endDate: new Date(this.year!, this.month!, 0),
      });
    } else if (kunci === 'menunggu') {
      this.filterFormGroup.patchValue({ isPending: false });
    } else if (kunci === 'selesai') {
      this.filterFormGroup.patchValue({ isDelete: false });
    }

    /* Melepas kapsul terakhir tidak boleh mengosongkan daftar. */
    const v = this.filterFormGroup.value;
    if (!v.isPending && !v.isDelete) {
      this.filterFormGroup.patchValue({ isPending: true, isDelete: true });
    }

    this.fetchSelectedMonth(1);
  }

  hapusSemuaSaringan(): void {
    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isPending: true,
      isDelete: true,
    });
    this.fetchSelectedMonth(1);
  }

  bukaHalaman(halaman: number) {
    this.page = halaman;
    this.fetchSelectedMonth();
  }

  lacakDeposit = (_: number, item: any): number => item.id;

  keDaftar() {
    this.router.navigate(['/Deposit']);
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

  /** Ikon arah urutan; kolom yang tidak aktif tetap diberi ikon redup. */
  ikonUrut(kolom: string): string {
    if (this.sortBy !== kolom) {
      return 'ph-caret-up-down tabel__urut-redup';
    }

    return this.sortDirection === 'asc' ? 'ph-caret-up' : 'ph-caret-down';
  }

  changeSortBy(field: string) {
    if (this.isLoading) {
      return;
    }

    if (this.sortBy == field) {
      this.sortDirection = this.sortDirection == 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }

    this.fetchSelectedMonth(1);
  }

  /**
   * Tiga keadaan dokumen dari dua penanda: belum dieksekusi berarti
   * menunggu; sudah, tergantung isConfirm-nya, dikonfirmasi atau ditolak.
   */
  keadaan(item: any): 'menunggu' | 'dikonfirmasi' | 'ditolak' {
    if (!item.isDelete) {
      return 'menunggu';
    }

    return item.isConfirm ? 'dikonfirmasi' : 'ditolak';
  }

  openFilter() {
    this.dialog
      .open(DepositArchiveFilterComponent, {
        data: {
          month: this.month,
          year: this.year,
          ...this.filterFormGroup.value,
        },
        /*
          Dialognya menggambar kartunya sendiri lewat app-dialog-shell, jadi
          permukaan Material di belakangnya harus ditransparankan. Tanpa
          panelClass ini kartunya duduk di atas kotak putih kedua yang
          bersudut dan berbayang sendiri.
        */
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
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

    if (data.isPending != lama.isPending) return true;
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
    this.dialog.open(DepositViewComponent, {
      data: {
        id: id,
        noAction: true,
        print: true,
      },
    });
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }
}
