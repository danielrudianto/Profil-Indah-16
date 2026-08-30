import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe, DecimalPipe } from '@angular/common';
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
import { SalesInvoiceArchiveFilterComponent } from './sales-invoice-archive-filter/sales-invoice-archive-filter.component';
import { SalesInvoiceViewComponent } from 'src/app/components/document-view/sales-invoice-view/sales-invoice-view.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Daftar faktur penjualan — bagian `4a` berkas desain.
 *
 * Susunannya mengikuti daftar penerimaan barang: app-list-page memegang judul,
 * pencarian, tombol buat, dan paginasi; yang khusus untuk halaman ini hanya
 * disalurkan ke slot aksi dan badan tabelnya.
 */
@Component({
  selector: 'app-sales-invoice-archive',
  templateUrl: './sales-invoice-archive.component.html',
  animations: [slideInOutAnimation],
  imports: [
    TabelKosongComponent,
    ArchivesComponent,
    ListPageComponent,
    NgIf,
    NgFor,
    NgClass,
    DatePipe,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class SalesInvoiceArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  mode: ArchiveMode = ArchiveMode.year;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  isLoading: boolean = false;
  month: number | null = null;
  year: number | null = null;
  keyword: string = '';

  filterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    isPaid: new FormControl(''),
    isUnpaid: new FormControl(''),
    isActive: new FormControl(''),
    isDelete: new FormControl(''),
  });

  sortBy: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';
    this.pageSize = 10;

    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isPaid: true,
      isUnpaid: true,
      isActive: true,
      isDelete: true,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('sales-invoice/archives', {
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
        isPaid: this.filterFormGroup.get('isPaid')?.value,
        isUnpaid: this.filterFormGroup.get('isUnpaid')?.value,
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

  /**
   * Saringan yang sedang aktif, sebagai kapsul yang bisa dilepas satu-satu.
   *
   * SATU TEMPAT MENYATAKAN KEBENARAN. Chip "belum lunas" dan dialog saringan
   * sama-sama menulis ke filterFormGroup, dan daftar ini dibaca dari sana —
   * bukan dari keadaan tombolnya masing-masing. Tanpa itu, cepat atau lambat
   * ada keadaan chip menyala sementara dialog menyatakan tidak ada saringan
   * aktif, dan yang bingung pemakainya.
   */
  get kapsul(): { kunci: string; teks: string }[] {
    const v = this.filterFormGroup.value;
    const hasil: { kunci: string; teks: string }[] = [];

    if (v.startDate && v.endDate) {
      const dari = moment(new Date(v.startDate)).format('D MMM');
      const sampai = moment(new Date(v.endDate)).format('D MMM YYYY');
      hasil.push({ kunci: 'tanggal', teks: `${dari} – ${sampai}` });
    }

    /*
      Keduanya menyala berarti tidak ada yang disaring — itu keadaan bawaannya,
      bukan pilihan, jadi tidak perlu dikapsulkan. Keadaan dokumen dan keadaan
      pembayaran dinilai terpisah karena memang dua saringan yang berbeda.
    */
    if (!(v.isActive && v.isDelete)) {
      if (v.isActive) hasil.push({ kunci: 'aktif', teks: 'Aktif' });
      if (v.isDelete) hasil.push({ kunci: 'dihapus', teks: 'Dihapus' });
    }

    if (!(v.isPaid && v.isUnpaid)) {
      if (v.isPaid) hasil.push({ kunci: 'lunas', teks: 'Lunas' });
      if (v.isUnpaid) hasil.push({ kunci: 'belum-lunas', teks: 'Belum lunas' });
    }

    return hasil;
  }

  /** Benar bila daftar sedang tersaring hanya pada yang belum lunas. */
  get hanyaBelumLunas(): boolean {
    const v = this.filterFormGroup.value;
    return !!v.isUnpaid && !v.isPaid;
  }

  /**
   * Chip pintas. Menyalakannya menyaring ke yang belum lunas saja;
   * mematikannya mengembalikan keduanya — bukan mengosongkan semuanya, karena
   * kosong berarti tidak ada baris yang lolos.
   */
  toggleBelumLunas(): void {
    const nyala = this.hanyaBelumLunas;
    this.filterFormGroup.patchValue({
      isPaid: nyala,
      isUnpaid: true,
    });
    this.fetchSelectedMonth(1);
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
    } else if (kunci === 'lunas') {
      this.filterFormGroup.patchValue({ isPaid: false });
    } else if (kunci === 'belum-lunas') {
      this.filterFormGroup.patchValue({ isUnpaid: false });
    }

    this.pastikanAdaYangLolos();
    this.fetchSelectedMonth(1);
  }

  hapusSemuaSaringan(): void {
    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isPaid: true,
      isUnpaid: true,
      isActive: true,
      isDelete: true,
    });
    this.fetchSelectedMonth(1);
  }

  /*
    Melepas kapsul terakhir bisa mematikan kedua sisi sebuah saringan, dan itu
    berarti tidak ada satu pun baris yang lolos — daftar kosong yang terbaca
    seperti data hilang. Tiap pasang dikembalikan sendiri-sendiri.
  */
  private pastikanAdaYangLolos(): void {
    const v = this.filterFormGroup.value;

    if (!v.isActive && !v.isDelete) {
      this.filterFormGroup.patchValue({ isActive: true, isDelete: true });
    }

    if (!v.isPaid && !v.isUnpaid) {
      this.filterFormGroup.patchValue({ isPaid: true, isUnpaid: true });
    }
  }

  bukaHalaman(halaman: number) {
    this.page = halaman;
    this.fetchSelectedMonth();
  }

  ubahUkuranHalaman(ukuran: number) {
    this.pageSize = ukuran;
    this.fetchSelectedMonth(1);
  }

  lacakFaktur = (_: number, item: any): number => item.id;

  /** Formulir buat faktur adalah anak berjalur '' dari /Sales-invoice. */
  buatFaktur() {
    this.router.navigate(['/Sales-invoice']);
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

  /**
   * Ikon arah urutan untuk sebuah kolom.
   *
   * Kolom yang tidak sedang mengurutkan tetap memakai ikon, hanya yang redup —
   * itu yang memberi tahu kolomnya bisa diurutkan sebelum ditekan sekali pun.
   */
  ikonUrut(kolom: string): string {
    if (this.sortBy !== kolom) {
      return 'ph-caret-up-down tabel__urut-redup';
    }

    return this.sortDirection === 'asc' ? 'ph-caret-up' : 'ph-caret-down';
  }

  openFilter() {
    this.dialog
      .open(SalesInvoiceArchiveFilterComponent, {
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

    if (data.isPaid != lama.isPaid) return true;
    if (data.isUnpaid != lama.isUnpaid) return true;
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

  viewArchive(id: number) {
    this.dialog
      .open(SalesInvoiceViewComponent, {
        data: {
          id: id,
          noAction: false,
          print: true,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === 'deleted') {
          const index = this.dataSource.findIndex((x) => x.id == id);
          if (index !== -1) {
            this.dataSource[index].isDelete = true;
          }
        }
      });
  }

  /**
   * Membatalkan pencarian dari blok kosong.
   *
   * Ruasnya dikosongkan DAN diteruskan ke pengambilan data lewat jalur yang
   * sama dengan mengetik di kotak pencarian, supaya kotak, daftar, dan
   * alamat tidak bisa menyatakan tiga hal berbeda.
   */
  resetPencarian(): void {
    this.onQueryChanged('');
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }
}
