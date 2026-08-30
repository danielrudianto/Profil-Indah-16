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
import { PurchaseInvoiceArchiveFilterComponent } from './purchase-invoice-archive-filter/purchase-invoice-archive-filter.component';
import { PurchaseInvoiceViewComponent } from './purchase-invoice-view/purchase-invoice-view.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Arsip faktur pembelian — kembaran arsip faktur penjualan (4a), dibaca
 * dari arsip penerimaan barang: faktur pembelian memang penerimaan yang
 * kolom fakturnya sudah dilengkapi.
 *
 * Status dinyatakan tiga keadaan: menunggu faktur (amber), lengkap, dan
 * dihapus. Baris yang menunggu diberi jalan langsung ke formulir
 * pelengkapannya.
 */
@Component({
  selector: 'app-purchase-invoice-archive',
  templateUrl: './purchase-invoice-archive.component.html',
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
export class PurchaseInvoiceArchiveComponent {
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
    isActive: new FormControl(''),
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
      isActive: true,
      isDelete: true,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('good-receipt/archives', {
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
        isActive: this.filterFormGroup.get('isActive')?.value,
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

    if (!(v.isPending && v.isActive && v.isDelete)) {
      if (v.isPending)
        hasil.push({ kunci: 'menunggu', teks: 'Menunggu faktur' });
      if (v.isActive) hasil.push({ kunci: 'lengkap', teks: 'Lengkap' });
      if (v.isDelete) hasil.push({ kunci: 'dihapus', teks: 'Dihapus' });
    }

    return hasil;
  }

  /** Benar bila daftar sedang tersaring hanya pada yang menunggu faktur. */
  get hanyaMenunggu(): boolean {
    const v = this.filterFormGroup.value;
    return !!v.isPending && !v.isActive && !v.isDelete;
  }

  /** Chip pintas: saring ke yang menunggu faktur saja, atau kembalikan semua. */
  toggleMenunggu(): void {
    const nyala = this.hanyaMenunggu;
    this.filterFormGroup.patchValue({
      isPending: true,
      isActive: nyala,
      isDelete: nyala,
    });
    this.fetchSelectedMonth(1);
  }

  lepasKapsul(kunci: string): void {
    if (kunci === 'tanggal') {
      this.filterFormGroup.patchValue({
        startDate: new Date(this.year!, this.month! - 1, 1),
        endDate: new Date(this.year!, this.month!, 0),
      });
    } else if (kunci === 'menunggu') {
      this.filterFormGroup.patchValue({ isPending: false });
    } else if (kunci === 'lengkap') {
      this.filterFormGroup.patchValue({ isActive: false });
    } else if (kunci === 'dihapus') {
      this.filterFormGroup.patchValue({ isDelete: false });
    }

    /* Melepas kapsul terakhir tidak boleh mengosongkan daftar. */
    const v = this.filterFormGroup.value;
    if (!v.isPending && !v.isActive && !v.isDelete) {
      this.filterFormGroup.patchValue({
        isPending: true,
        isActive: true,
        isDelete: true,
      });
    }

    this.fetchSelectedMonth(1);
  }

  hapusSemuaSaringan(): void {
    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isPending: true,
      isActive: true,
      isDelete: true,
    });
    this.fetchSelectedMonth(1);
  }

  bukaHalaman(halaman: number) {
    this.page = halaman;
    this.fetchSelectedMonth();
  }

  lacakDokumen = (_: number, item: any): number => item.id;

  keAntrean() {
    this.router.navigate(['/Purchase-invoice']);
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
   * Tiga keadaan dokumen: dihapus, menunggu faktur, atau lengkap.
   */
  keadaan(item: any): 'dihapus' | 'menunggu' | 'lengkap' {
    if (item.is_delete) {
      return 'dihapus';
    }

    return item.is_confirm ? 'lengkap' : 'menunggu';
  }

  lengkapi(item: any): void {
    this.router.navigate(['/Purchase-invoice/Confirm', item.id]);
  }

  openFilter() {
    this.dialog
      .open(PurchaseInvoiceArchiveFilterComponent, {
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
          apa-apa. Tanpa penjagaan ini, saringannya ikut hangus.
        */
        if (data == null) {
          return;
        }

        this.filterFormGroup.patchValue(data);
        this.fetchSelectedMonth(1);
      });
  }

  viewArchive(id: number) {
    this.dialog.open(PurchaseInvoiceViewComponent, {
      data: { id: id },
    });
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }
}
