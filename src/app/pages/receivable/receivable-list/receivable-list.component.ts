import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { DaftarStateService } from 'src/app/services/daftar-state.service';

/**
 * Daftar piutang per pelanggan — pola app-list-page.
 *
 * Endpoint-nya mengembalikan SEMUA pelanggan yang berutang sekaligus —
 * jumlahnya memang sekecil itu, dan servernya menjawab dalam sekali
 * jalan. Pencarian DAN paginasi karena itu berjalan di peramban:
 * halaman hanya memotong larik yang sudah di memori, tanpa panggilan
 * jaringan tambahan. Urutannya dari penunggak terbesar.
 *
 * Sisa piutang tiap pelanggan diberi BAR RELATIF terhadap yang terbesar
 * — pola "penjualan per merek" di laporan — supaya siapa yang paling
 * banyak menunggak terbaca tanpa membandingkan angka satu-satu.
 */
@Component({
  selector: 'app-receivable-list',
  templateUrl: './receivable-list.component.html',
  styleUrls: ['./receivable-list.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class ReceivableListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private daftarState: DaftarStateService,
  ) {}

  isLoading = true;
  dataSource: any[] = [];
  tersaring: any[] = [];
  keyword = '';
  page = 1;
  pageSize = 10;

  /**
   * Halaman dan kata kunci disimpan di URL, bukan di dalam komponen.
   *
   * Komponen ini dibuat ulang setiap kali orang kembali dari halaman rincian,
   * sehingga keadaan yang hanya hidup di dalamnya SELALU hilang — dan
   * penagih yang sedang memeriksa halaman tujuh dilempar balik ke halaman
   * satu setiap kali membuka satu pelanggan.
   *
   * Di URL, keadaannya selamat dari tombol kembali, dari muat ulang, dan
   * tautannya bisa dikirim ke orang lain apa adanya.
   */
  ngOnInit(): void {
    const q = this.route.snapshot.queryParams;

    /*
      Masuk lewat menu berarti alamat tanpa query param sama sekali — dan itu
      artinya mulai bersih. Ingatan dari kunjungan sebelumnya dibuang di sini,
      supaya daftar yang dibuka setengah jam kemudian tidak menyodorkan kata
      kunci yang sudah dilupakan orangnya.
    */
    if (Object.keys(q).length === 0) {
      this.daftarState.lupakan(DaftarStateService.PIUTANG);
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
    halaman. Tanpa itu, satu kali menekan "kembali" dari rincian akan
    membawanya ke halaman sebelumnya, bukan keluar dari daftar — dan menekan
    kembali sepuluh kali cuma menyusuri nomor halaman.
  */
  private simpanKeadaan(): void {
    /* Ikut disimpan di ingatan sesi supaya tombol kembali di halaman rincian
       bisa membawanya pulang — tombol itu memakai jalur, bukan riwayat. */
    this.daftarState.simpan(DaftarStateService.PIUTANG, {
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
      .get('receivable')
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
          this.saring(true);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  cari(kataKunci: string): void {
    this.keyword = kataKunci;
    this.saring();
    this.simpanKeadaan();
  }

  resetPencarian(): void {
    this.cari('');
  }

  /**
   * `pertahankanHalaman` dipakai saat memuat pertama.
   *
   * Menyaring memang harus mengembalikan ke halaman satu — hasilnya menyusut
   * dan halaman ke-tujuh bisa saja sudah tidak ada. Tetapi pemanggilan
   * pertama bukan penyaringan baru, melainkan pemulihan keadaan dari URL,
   * dan mengembalikannya ke satu di situ justru membatalkan seluruh gunanya.
   */
  private saring(pertahankanHalaman = false): void {
    const kunci = this.keyword.toLowerCase();
    this.tersaring = this.dataSource
      .filter((x) => (x.name ?? '').toLowerCase().includes(kunci))
      .sort((a, b) => this.sisa(b) - this.sisa(a));

    if (!pertahankanHalaman) {
      this.page = 1;
      return;
    }

    /* Halaman dari URL bisa melampaui hasil yang ada — misalnya tautan lama
       yang dibuka setelah sebagian piutangnya lunas. */
    const maksimal = Math.max(
      Math.ceil(this.tersaring.length / this.pageSize),
      1,
    );
    this.page = Math.min(this.page, maksimal);
  }

  /** Potongan halaman yang digambar — dari larik yang sudah tersaring. */
  get tampil(): any[] {
    const awal = (this.page - 1) * this.pageSize;
    return this.tersaring.slice(awal, awal + this.pageSize);
  }

  bukaHalaman(halaman: number): void {
    this.page = halaman;
    this.simpanKeadaan();
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.page = 1;
    this.simpanKeadaan();
  }

  /*
    Endpoint sudah mengirim SISA BERSIH: repository menghitung
    value - payment di server dan hanya field `value` yang keluar.
    Mengurangi `payment` lagi di sini berarti Number(undefined) = NaN —
    kolom jumlah kosong dan bar perbandingannya ikut rusak.
  */
  sisa(item: any): number {
    return Number(item.value);
  }

  /** Bagian sisa yang tenggatnya sudah lewat. */
  lewatTempo(item: any): number {
    return Math.min(Math.max(Number(item.overdue ?? 0), 0), this.sisa(item));
  }

  /**
   * Lebar bagian GELAP di dalam batang, dalam persen dari batang itu sendiri.
   *
   * Diberi lantai 3% ketika ada isinya: nominal kecil yang tergambar setipis
   * nol memberi kesan tidak ada yang lewat tempo, padahal ada — dan itu
   * kebalikan dari guna warnanya.
   */
  persenLewat(item: any): number {
    const sisa = this.sisa(item);
    const lewat = this.lewatTempo(item);
    if (sisa <= 0 || lewat <= 0) {
      return 0;
    }
    return Math.max((lewat / sisa) * 100, 3);
  }

  /** Kalimat tooltip batang — menyebut pembagiannya, bukan cuma totalnya. */
  tooltipBar(item: any): string {
    const nama =
      item.name ?? this.translateService.instant('sales-invoice__retail');
    const lewat = this.lewatTempo(item);

    if (lewat <= 0) {
      return this.translateService.instant('receivable__bar__aman', {
        nama,
        nilai: this.rupiah(this.sisa(item)),
      });
    }

    return this.translateService.instant('receivable__bar__lewat', {
      nama,
      lewat: this.rupiah(lewat),
      belum: this.rupiah(this.sisa(item) - lewat),
    });
  }

  private rupiah(nilai: number): string {
    return nilai.toLocaleString('id-ID', { maximumFractionDigits: 0 });
  }

  /** Lebar bar relatif terhadap penunggak terbesar, dalam persen. */
  lebarBar(item: any): number {
    const terbesar = Math.max(...this.dataSource.map((x) => this.sisa(x)), 1);
    return Math.max((this.sisa(item) / terbesar) * 100, 2);
  }

  lacakPiutang = (_: number, item: any): number => item.id ?? 0;

  lihat(item: any): void {
    /* Pelanggan eceran tidak punya id — server memakai 0 untuk null. */
    this.router.navigate([item.id ?? 0], { relativeTo: this.route });
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }
}
