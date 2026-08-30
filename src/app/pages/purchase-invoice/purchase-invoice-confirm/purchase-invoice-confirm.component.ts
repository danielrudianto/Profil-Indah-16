import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DaftarStateService } from 'src/app/services/daftar-state.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';

/**
 * Antrean penerimaan yang MENUNGGU FAKTUR — halaman kerja utama menu
 * faktur pembelian. Barang sudah datang dan tercatat; begitu faktur
 * suppliernya tiba, barisnya dilengkapi lewat tombol di kanan.
 *
 * Kata kunci mencari nomor dokumen dan nama pemasok, dan dijalankan server:
 * yang disaring seluruh antrean, bukan sepuluh baris yang kebetulan sedang
 * tampil.
 */
@Component({
  selector: 'app-purchase-invoice-confirm',
  templateUrl: './purchase-invoice-confirm.component.html',
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DatePipe,
    TranslatePipe,
  ],
})
export class PurchaseInvoiceConfirmComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private daftarState: DaftarStateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  dataCount = 0;
  keyword = '';
  page = 1;
  pageSize = 10;

  /**
   * Halaman, kata kunci, dan ukuran halaman disimpan di URL — bukan di dalam
   * komponen.
   *
   * Komponen ini dibuat ulang setiap kali orang kembali dari layar lengkapi,
   * sehingga keadaan yang hanya hidup di dalamnya SELALU hilang: petugas yang
   * sedang menyisir halaman lima dilempar balik ke halaman satu, dan kata
   * kunci yang baru diketiknya lenyap, tiap kali ia membuka satu penerimaan.
   *
   * Di URL, keadaannya selamat dari tombol kembali, dari muat ulang, dan
   * tautannya bisa dikirim ke orang lain apa adanya.
   */
  ngOnInit(): void {
    const q = this.route.snapshot.queryParams;

    /*
      Masuk lewat menu berarti alamat tanpa query param sama sekali — dan itu
      artinya mulai bersih. Ingatan kunjungan sebelumnya dibuang di sini,
      supaya antrean yang dibuka setengah jam kemudian tidak menyodorkan kata
      kunci yang sudah dilupakan orangnya lalu terlihat seperti antrean
      kosong.
    */
    if (Object.keys(q).length === 0) {
      this.daftarState.lupakan(DaftarStateService.FAKTUR_PEMBELIAN);
    }

    const halaman = Number(q['page']);
    this.page = Number.isInteger(halaman) && halaman > 0 ? halaman : 1;
    this.keyword = q['q'] ?? '';

    const ukuran = Number(q['size']);
    if ([10, 25, 50, 100].includes(ukuran)) {
      this.pageSize = ukuran;
    }

    this.ambilData();
  }

  /*
    replaceUrl: riwayat peramban tidak diisi tiap kali orang berpindah
    halaman. Tanpa itu satu kali menekan "kembali" cuma menyusuri nomor
    halaman, bukan keluar dari daftar.
  */
  private simpanKeadaan(): void {
    /* Ikut disimpan di ingatan sesi supaya tombol kembali di layar lengkapi
       bisa membawanya pulang — tombol itu memakai jalur, bukan riwayat. */
    this.daftarState.simpan(DaftarStateService.FAKTUR_PEMBELIAN, {
      page: this.page,
      q: this.keyword,
      size: this.pageSize,
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: this.page > 1 ? this.page : null,
        q: this.keyword || null,
        size: this.pageSize !== 10 ? this.pageSize : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .get('good-receipt/unconfirmed', {
        keyword: this.keyword,
        page: this.page,
        pageSize: this.pageSize,
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

  bukaHalaman(halaman: number): void {
    this.page = halaman;
    this.simpanKeadaan();
    this.ambilData();
  }

  cari(kataKunci: string): void {
    this.keyword = kataKunci;
    /* Kembali ke halaman satu: hasil pencarian baru hampir selalu lebih
       pendek, dan halaman lima dari hasil lama biasanya sudah tidak ada. */
    this.page = 1;
    this.simpanKeadaan();
    this.ambilData();
  }

  ubahUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.page = 1;
    this.simpanKeadaan();
    this.ambilData();
  }

  lacakPenerimaan = (_: number, item: any): number => item.id;

  lengkapi(item: any): void {
    /* Keadaan disimpan tepat sebelum pergi, supaya tombol kembali di layar
       lengkapi tahu harus memulangkan orangnya ke halaman yang mana. */
    this.simpanKeadaan();
    this.router.navigate(['Confirm', item.id], { relativeTo: this.route });
  }

  keArsip(): void {
    this.router.navigate(['/Purchase-invoice/Archive']);
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }
}
