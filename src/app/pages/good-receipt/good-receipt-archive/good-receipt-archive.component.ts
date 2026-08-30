import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { ArchiveViewComponent } from 'src/app/components/archives/archive-view/archive-view.component';
import { ArchiveMode } from 'src/app/components/archives/archives.component';
import { GoodReceiptArchiveFilterComponent } from 'src/app/pages/good-receipt/good-receipt-archive/good-receipt-archive-filter/good-receipt-archive-filter.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { slideInOutAnimation } from '../../../animations/slide-in-out.animation';
import { MatDialog } from '@angular/material/dialog';
import { GoodReceiptViewComponent } from 'src/app/components/document-view/good-receipt-view/good-receipt-view.component';
import { ArchivesComponent } from '../../../components/archives/archives.component';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TranslatePipe } from '@ngx-translate/core';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

@Component({
  selector: 'app-good-receipt-archive',
  templateUrl: './good-receipt-archive.component.html',
  animations: [slideInOutAnimation],
  imports: [
    TabelKosongComponent,
    ArchivesComponent,
    NgIf,
    NgFor,
    DatePipe,
    TranslatePipe,
    ListPageComponent,
  ],
})
export class GoodReceiptArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  mode: ArchiveMode = ArchiveMode.year;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  /*
    Ukuran halaman ditentukan server lewat process.env.LIMIT dan tidak pernah
    dikirim ke sini. Diturunkan dari banyaknya baris pada halaman pertama —
    itu satu-satunya angka yang benar-benar diketahui peramban, dan dipakai
    hanya untuk keterangan "1 – 10 dari 79" serta mematikan tombol maju di
    halaman terakhir.
  */
  pageSize: number = 10;
  isLoading: boolean = false;
  month: number | null = null;
  year: number | null = null;
  keyword: string = '';
  filterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    isActive: new FormControl(''),
    isDelete: new FormControl(''),
    isPending: new FormControl(''),
  });

  sortBy: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {}

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
      isPending: true,
    });

    this.fetchSelectedMonth(1);
  }

  /**
   * Fetches the selected month's sales invoice archives from the API.
   * @param {number} [page=this.page] - The page number of the results to fetch. Defaults to the current page.
   * @return {void} This function does not return anything.
   */
  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('good-receipt/archives', {
        month: this.month,
        year: this.year,
        page: this.page,
        keyword: this.keyword,
        // Convert to DD-MM-YYYY
        startDate: moment(
          new Date(this.filterFormGroup.get('startDate')?.value),
        ).format('YYYY-MM-DD'),
        endDate: moment(
          new Date(this.filterFormGroup.get('endDate')?.value),
        ).format('YYYY-MM-DD'),
        isActive: this.filterFormGroup.get('isActive')?.value,
        isDelete: this.filterFormGroup.get('isDelete')?.value,
        isPending: this.filterFormGroup.get('isPending')?.value,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
          if (this.page === 1 && data.data.length > 0) {
            this.pageSize = data.data.length;
          }
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
   * SATU TEMPAT MENYATAKAN KEBENARAN. Chip "menunggu faktur" dan dialog
   * saringan sama-sama menulis ke filterFormGroup, dan daftar ini dibaca dari
   * sana — bukan dari keadaan tombolnya masing-masing. Tanpa itu, cepat atau
   * lambat ada keadaan chip menyala sementara dialog menyatakan tidak ada
   * saringan aktif, dan yang bingung pemakainya.
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
      Ketiganya menyala bersamaan berarti tidak ada yang disaring — itu
      keadaan bawaannya, bukan pilihan, jadi tidak perlu dikapsulkan.
    */
    const semua = v.isActive && v.isDelete && v.isPending;
    if (!semua) {
      if (v.isActive) hasil.push({ kunci: 'aktif', teks: 'Aktif' });
      if (v.isDelete) hasil.push({ kunci: 'dihapus', teks: 'Dihapus' });
      if (v.isPending)
        hasil.push({ kunci: 'menunggu', teks: 'Menunggu faktur' });
    }

    return hasil;
  }

  /** Benar bila daftar sedang tersaring hanya pada yang menunggu faktur. */
  get hanyaMenunggu(): boolean {
    const v = this.filterFormGroup.value;
    return !!v.isPending && !v.isActive && !v.isDelete;
  }

  /**
   * Chip pintas. Menyalakannya menyaring ke yang menunggu faktur saja;
   * mematikannya mengembalikan ketiganya — bukan mengosongkan semuanya, karena
   * kosong berarti tidak ada baris yang lolos.
   */
  toggleMenunggu(): void {
    const nyala = this.hanyaMenunggu;
    this.filterFormGroup.patchValue({
      isActive: nyala,
      isDelete: nyala,
      isPending: true,
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
    } else if (kunci === 'menunggu') {
      this.filterFormGroup.patchValue({ isPending: false });
    }

    this.pastikanAdaYangLolos();
    this.fetchSelectedMonth(1);
  }

  hapusSemuaSaringan(): void {
    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isActive: true,
      isDelete: true,
      isPending: true,
    });
    this.fetchSelectedMonth(1);
  }

  /*
    Melepas kapsul terakhir bisa menyisakan ketiganya mati, dan itu berarti
    tidak ada satu pun baris yang lolos — daftar kosong yang terbaca seperti
    data hilang. Dikembalikan ke keadaan bawaannya.
  */
  private pastikanAdaYangLolos(): void {
    const v = this.filterFormGroup.value;
    if (!v.isActive && !v.isDelete && !v.isPending) {
      this.filterFormGroup.patchValue({
        isActive: true,
        isDelete: true,
        isPending: true,
      });
    }
  }

  bukaHalaman(halaman: number) {
    this.page = halaman;
    this.fetchSelectedMonth();
  }

  lacakPenerimaan = (_: number, item: any): number => item.id;

  /* Formulir buat penerimaan adalah anak berjalur '' dari /Good-receipt. */
  buatPenerimaan() {
    this.router.navigate(['/Good-receipt']);
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
   * Opens the filter component and subscribes to its data changes.
   * @return {void} This function does not return anything.
   */
  openFilter() {
    this.dialog
      .open(GoodReceiptArchiveFilterComponent, {
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
        // Check if it is the same
        const change = this.checkChanges(data);
        if (change) {
          this.filterFormGroup.patchValue(data);
          this.fetchSelectedMonth(1);
        }
      });
  }

  private checkChanges(data: any) {
    const isActive = data.isActive;
    const isDelete = data.isDelete;
    const isPending = data.isPending;

    const maxDate = data.endDate;
    const minDate = data.startDate;
    const existingIsActive = this.filterFormGroup.value.isActive;
    const existingIsDelete = this.filterFormGroup.value.isDelete;
    const existingIsPending = this.filterFormGroup.value.isPending;

    const existingMinDate = this.filterFormGroup.value.startDate;
    const existingMaxDate = this.filterFormGroup.value.endDate;

    let response = false;

    if (isPending != existingIsPending) {
      response = true;
    }

    if (isActive != existingIsActive) {
      response = true;
    }

    if (isDelete != existingIsDelete) {
      response = true;
    }

    if (existingMinDate.getTime() != minDate.getTime()) {
      response = true;
    }

    if (existingMaxDate.getTime() != maxDate.getTime()) {
      response = true;
    }

    return response;
  }

  changeSortBy(field: string) {
    if (this.isLoading) {
      return;
    }

    if (this.sortBy == field) {
      if (this.sortDirection == 'asc') {
        this.sortDirection = 'desc';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }

    this.fetchSelectedMonth(1);
  }

  viewArchive(id: number) {
    this.dialog.open(GoodReceiptViewComponent, {
      data: {
        id: id,
      },
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
