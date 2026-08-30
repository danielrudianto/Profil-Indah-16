import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';

import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { ArchiveMode } from 'src/app/components/archives/archives.component';
import { ArchivesComponent } from 'src/app/components/archives/archives.component';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AdjustmentCaseArchiveFilterComponent } from './adjustment-case-archive-filter/adjustment-case-archive-filter.component';
import { AdjustmentCaseViewComponent } from 'src/app/components/document-view/adjustment-case-view/adjustment-case-view.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Arsip penyesuaian stok — bagian `12a` berkas desain.
 *
 * Susunannya mengikuti arsip faktur penjualan: app-archives memilih bulan
 * lebih dulu, lalu app-list-page memegang judul, pencarian, tombol buat, dan
 * paginasi; yang khusus halaman ini hanya slot aksi dan badan tabelnya.
 */
@Component({
  selector: 'app-adjustment-case-archive',
  templateUrl: './adjustment-case-archive.component.html',
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
export class AdjustmentCaseArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
    private translateService: TranslateService,
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
    isConfirm: new FormControl(true),
    isReject: new FormControl(true),
    isPending: new FormControl(true),
    isLost: new FormControl(true),
    isFound: new FormControl(true),
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
      isConfirm: true,
      isReject: true,
      isPending: true,
      isLost: true,
      isFound: true,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('adjustment-case/archives', {
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
        isConfirm: this.filterFormGroup.get('isConfirm')?.value,
        isReject: this.filterFormGroup.get('isReject')?.value,
        isPending: this.filterFormGroup.get('isPending')?.value,
        isLost: this.filterFormGroup.get('isLost')?.value,
        isFound: this.filterFormGroup.get('isFound')?.value,
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
   * Dibaca dari filterFormGroup — satu tempat menyatakan kebenaran, sama
   * seperti arsip faktur penjualan.
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
      Semuanya menyala berarti tidak ada yang disaring — itu keadaan bawaan,
      bukan pilihan, jadi tidak dikapsulkan. Status dan tipe dinilai terpisah
      karena memang dua saringan yang berbeda.
    */
    if (!(v.isConfirm && v.isReject && v.isPending)) {
      if (v.isConfirm)
        hasil.push({
          kunci: 'dikonfirmasi',
          teks: this.translateService.instant(
            'adjustment-case__archive__status__confirmed',
          ),
        });
      if (v.isPending)
        hasil.push({
          kunci: 'menunggu',
          teks: this.translateService.instant(
            'adjustment-case__archive__status__pending',
          ),
        });
      if (v.isReject)
        hasil.push({
          kunci: 'dihapus',
          teks: this.translateService.instant(
            'adjustment-case__archive__status__deleted',
          ),
        });
    }

    if (!(v.isLost && v.isFound)) {
      if (v.isFound)
        hasil.push({
          kunci: 'ditemukan',
          teks: this.translateService.instant(
            'adjustment-case__confirm__type__found',
          ),
        });
      if (v.isLost)
        hasil.push({
          kunci: 'hilang',
          teks: this.translateService.instant(
            'adjustment-case__confirm__type__lost',
          ),
        });
    }

    return hasil;
  }

  /** Benar bila daftar sedang tersaring hanya pada yang menunggu konfirmasi. */
  get hanyaMenunggu(): boolean {
    const v = this.filterFormGroup.value;
    return !!v.isPending && !v.isConfirm && !v.isReject;
  }

  /**
   * Chip pintas. Menyalakannya menyaring ke yang menunggu konfirmasi saja;
   * mematikannya mengembalikan semuanya — bukan mengosongkan, karena kosong
   * berarti tidak ada baris yang lolos.
   */
  toggleMenunggu(): void {
    const nyala = this.hanyaMenunggu;
    this.filterFormGroup.patchValue({
      isPending: true,
      isConfirm: nyala,
      isReject: nyala,
    });
    this.fetchSelectedMonth(1);
  }

  lepasKapsul(kunci: string): void {
    if (kunci === 'tanggal') {
      this.filterFormGroup.patchValue({
        startDate: new Date(this.year!, this.month! - 1, 1),
        endDate: new Date(this.year!, this.month!, 0),
      });
    } else if (kunci === 'dikonfirmasi') {
      this.filterFormGroup.patchValue({ isConfirm: false });
    } else if (kunci === 'menunggu') {
      this.filterFormGroup.patchValue({ isPending: false });
    } else if (kunci === 'dihapus') {
      this.filterFormGroup.patchValue({ isReject: false });
    } else if (kunci === 'ditemukan') {
      this.filterFormGroup.patchValue({ isFound: false });
    } else if (kunci === 'hilang') {
      this.filterFormGroup.patchValue({ isLost: false });
    }

    this.pastikanAdaYangLolos();
    this.fetchSelectedMonth(1);
  }

  hapusSemuaSaringan(): void {
    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isConfirm: true,
      isReject: true,
      isPending: true,
      isLost: true,
      isFound: true,
    });
    this.fetchSelectedMonth(1);
  }

  /*
    Melepas kapsul terakhir bisa mematikan seluruh sisi sebuah saringan, dan
    itu berarti tidak ada baris yang lolos — daftar kosong yang terbaca
    seperti data hilang. Tiap kelompok dikembalikan sendiri-sendiri.
  */
  private pastikanAdaYangLolos(): void {
    const v = this.filterFormGroup.value;

    if (!v.isConfirm && !v.isReject && !v.isPending) {
      this.filterFormGroup.patchValue({
        isConfirm: true,
        isReject: true,
        isPending: true,
      });
    }

    if (!v.isLost && !v.isFound) {
      this.filterFormGroup.patchValue({ isLost: true, isFound: true });
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

  lacakKasus = (_: number, item: any): number => item.id;

  /** Formulir buat penyesuaian adalah anak berjalur '' dari /Adjustment-case. */
  buatPenyesuaian() {
    this.router.navigate(['/Adjustment-case']);
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
   * Ikon arah urutan untuk sebuah kolom. Kolom yang tidak sedang mengurutkan
   * tetap memakai ikon, hanya yang redup.
   */
  ikonUrut(kolom: string): string {
    if (this.sortBy !== kolom) {
      return 'ph-caret-up-down tabel__urut-redup';
    }

    return this.sortDirection === 'asc' ? 'ph-caret-up' : 'ph-caret-down';
  }

  openFilter() {
    this.dialog
      .open(AdjustmentCaseArchiveFilterComponent, {
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

    if (data.isConfirm != lama.isConfirm) return true;
    if (data.isReject != lama.isReject) return true;
    if (data.isPending != lama.isPending) return true;
    if (data.isLost != lama.isLost) return true;
    if (data.isFound != lama.isFound) return true;

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
      .open(AdjustmentCaseViewComponent, {
        data: {
          id: id,
          print: true,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          const index = this.dataSource.findIndex((x) => x.id == id);
          if (index != -1) {
            this.dataSource[index].is_delete = data.is_delete;
            this.dataSource[index].is_confirm = data.is_confirm;
          }
        }
      });
  }

  /**
   * Membatalkan pencarian dari blok kosong — lewat jalur yang sama dengan
   * mengetik di kotak pencarian, supaya kotak, daftar, dan alamat tidak bisa
   * menyatakan tiga hal berbeda.
   */
  resetPencarian(): void {
    this.onQueryChanged('');
  }
}
