import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { OverpaymentArchiveViewComponent } from 'src/app/components/document-view/overpayment-archive-view/overpayment-archive-view.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Daftar kelebihan bayar — bagian `16c` berkas desain.
 *
 * Keadaannya ditentukan dua hal: sudah dikembalikan atau belum, dan bila belum,
 * apakah tanggal janjinya sudah lewat. Keduanya dihitung DI SINI dari data yang
 * dikirim server, bukan diminta sebagai satu ruas jadi, supaya baris yang baru
 * ditandai dikembalikan langsung berubah tanpa menunggu pengambilan ulang.
 */
@Component({
  selector: 'app-overpayment-archive',
  templateUrl: './overpayment-archive.component.html',
  styleUrls: ['./overpayment-archive.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    NgClass,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
})
export class OverpaymentArchiveComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private translateService: TranslateService,
    private router: Router,
  ) {}

  isLoading: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  sortBy: string = 'return';
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Kosong berarti seluruhnya; diisi 'waiting' atau 'overdue' oleh chip. */
  status: string = '';

  /** Dicocokkan server ke nama pelanggan. */
  keyword: string = '';

  /** Penghitung chip DAN banner, datang dari server — jumlah + nilai Rp. */
  ringkasan = {
    waiting: 0,
    overdue: 0,
    waitingValue: 0,
    overdueValue: 0,
    resolved: 0,
    resolvedValue: 0,
  };

  ngOnInit(): void {
    this.fetch(1);
  }

  fetch(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .get('overpayment', {
        page: this.page,
        pageSize: this.pageSize,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
        status: this.status,
        keyword: this.keyword,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
          if (data.summary) {
            this.ringkasan = { ...this.ringkasan, ...data.summary };
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

  /*
    Menekan chip yang sedang menyala mematikannya kembali. Tanpa itu, satu-
    satunya jalan melihat seluruh daftar adalah memuat ulang halaman.
  */
  toggleStatus(pilihan: string) {
    this.status = this.status === pilihan ? '' : pilihan;
    this.fetch(1);
  }

  cari(kata: string) {
    this.keyword = kata;
    this.fetch(1);
  }

  /**
   * Membatalkan pencarian dari blok kosong.
   *
   * Lewat jalur yang sama dengan mengetik di kotak pencarian, supaya kotak dan
   * daftarnya tidak bisa menyatakan dua hal berbeda.
   */
  resetPencarian(): void {
    this.cari('');
  }

  bukaHalaman(halaman: number) {
    this.fetch(halaman);
  }

  gantiUkuran(ukuran: number) {
    this.pageSize = ukuran;
    this.fetch(1);
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

    this.fetch(1);
  }

  ikonUrut(kolom: string): string {
    if (this.sortBy !== kolom) {
      return 'ph-caret-up-down tabel__urut-redup';
    }
    return this.sortDirection === 'asc' ? 'ph-caret-up' : 'ph-caret-down';
  }

  lacakItem = (_: number, item: any): number => item.id;

  /**
   * Nomor dokumen.
   *
   * Tabel overpayment TIDAK punya kolom nomor — tidak pernah ada. Nomornya
   * diturunkan dari id supaya baris tetap bisa disebut dalam percakapan
   * ("KB-000123"), tanpa menambah kolom dan migrasi kesembilan hanya untuk
   * keperluan tampilan. Kalau suatu saat nomornya harus punya makna sendiri —
   * berulang tiap tahun, misalnya — barulah kolomnya diperlukan.
   */
  nomor(item: any): string {
    return 'KB-' + String(item.id).padStart(6, '0');
  }

  /** Benar bila janji pengembaliannya sudah lewat dan uangnya belum kembali. */
  private lewatTempo(item: any): boolean {
    if (item.is_resolved) {
      return false;
    }

    const awalHariIni = new Date();
    awalHariIni.setHours(0, 0, 0, 0);

    return new Date(item.return_payment_date) < awalHariIni;
  }

  kunciStatus(item: any): string {
    if (item.is_resolved) return 'overpayment__status__resolved';
    return this.lewatTempo(item)
      ? 'overpayment__status__overdue'
      : 'overpayment__status__waiting';
  }

  kelasPill(item: any): string {
    if (item.is_resolved) return 'pill--hijau';
    return this.lewatTempo(item) ? 'pill--merah' : 'pill--amber';
  }

  ikonPill(item: any): string {
    if (item.is_resolved) return 'ph-check-circle';
    return this.lewatTempo(item) ? 'ph-warning-circle' : 'ph-clock';
  }

  catatBaru() {
    this.router.navigate(['/Overpayment/Create']);
  }

  ubah(id: number) {
    this.router.navigate(['/Overpayment/Create'], { queryParams: { id: id } });
  }

  /**
   * Menandai uangnya sudah dikembalikan.
   *
   * Barisnya diubah di layar setelah server menjawab, bukan sebelumnya:
   * penandaan ini menyangkut uang, dan menampilkan "dikembalikan" untuk
   * sesuatu yang ternyata gagal tersimpan adalah kesalahan yang tidak
   * terlihat sampai ada yang menagih.
   */
  tandaiDikembalikan(item: any) {
    const konfirmasi = this.translateService.instant(
      'overpayment__resolve__confirm',
    );

    if (!confirm(konfirmasi)) {
      return;
    }

    this.apiService.patch(`overpayment/${item.id}/resolve`, {}).subscribe({
      next: () => {
        item.is_resolved = true;
        this.alertService.showSuccess(
          this.translateService.instant('overpayment__resolve__success'),
        );
        /* Penghitung chip ikut berubah, jadi diambil ulang. */
        this.fetch();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  openViewOverpayment(id: number) {
    this.dialog.open(OverpaymentArchiveViewComponent, {
      data: {
        id: id,
      },
    });
  }
}
