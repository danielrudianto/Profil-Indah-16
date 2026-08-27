import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SalesReturnArchiveViewComponent } from 'src/app/components/document-view/sales-return-archive-view/sales-return-archive-view.component';
import { SalesInvoiceViewComponent } from 'src/app/components/document-view/sales-invoice-view/sales-invoice-view.component';
import { GoodReceiptViewComponent } from 'src/app/components/document-view/good-receipt-view/good-receipt-view.component';
import { AdjustmentCaseViewComponent } from 'src/app/components/document-view/adjustment-case-view/adjustment-case-view.component';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ListPageComponent } from 'src/app/components/list-page/list-page.component';
import { TabelKosongComponent } from 'src/app/components/tabel-kosong/tabel-kosong.component';
import { DepositListDialogComponent } from './deposit-list-dialog/deposit-list-dialog.component';

/**
 * Kartu stok satu produk — riwayat mutasi tersimpan, berhalaman dari
 * server. Bentuknya pola list-page seperti daftar lain; klik baris
 * membuka dokumen yang mencatat mutasinya (faktur, penerimaan,
 * penyesuaian, atau retur).
 */
@Component({
  selector: 'app-stock-card',
  templateUrl: './stock-card.component.html',
  styleUrls: ['./stock-card.component.scss'],
  imports: [
    ListPageComponent,
    TabelKosongComponent,
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
  ],
})
export class StockCardComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
  ) {}

  isLoadingCard: boolean = false;
  isLoadingData: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  productDataSource: any = null;
  id: number | null = null;

  /**
   * Posisi stok kini — diambil dari saldo baris TERBARU kartu (halaman
   * pertama, urutan menurun). Payload produk tidak membawa angka stok,
   * dan halaman lama menampilkan ruas `deposit` yang tidak pernah
   * dikirim siapa pun — kotaknya selamanya kosong.
   */
  stokKini: number | null = null;

  /*
    Deposit terbuka produk ini — jumlah yang sudah dibayar pelanggan dan
    belum diambil. Kotak lamanya berlabel Deposit tetapi berisi stok kini;
    sekarang keduanya punya kotak masing-masing, dan angka depositnya bisa
    diklik untuk melihat siapa memegang berapa.
  */
  depositTerbuka: number | null = null;

  /*
    Jendela mutasi untuk grafik dan sorotan: 50 mutasi TERAKHIR, diambil
    terpisah dari halaman tabel supaya berpindah halaman tidak mengubah
    grafiknya. Semua klaim sorotan dibatasi jendela ini — yang tidak
    diperiksa tidak diaku-aku.
  */
  tren: {
    saldo: number;
    tanggal: Date;
    dokumen: string;
    mutasi: number;
  }[] = [];
  jendela: { baris: any[]; jumlah: number } = { baris: [], jumlah: 0 };
  sorotan: { ikon: string; teks: string }[] = [];

  /*
    Grafik tertutup di awal — sorotan sudah merangkum jendelanya, dan 50
    batang baru digambar ketika benar-benar diminta. Datanya sendiri tetap
    sekali ambil karena sorotan memakainya juga.
  */
  grafikTerbuka = false;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.params['id']);

    this.fetchProduct();
    this.fetchStockCard(1);
    this.fetchDeposit();
    this.fetchTren();
  }

  fetchTren(): void {
    this.apiService
      .get(`product-stock/${this.id}`, { page: 1, pageSize: 50 })
      .subscribe({
        next: (data: any) => {
          const baris = ((data.data as any[]) ?? []).slice();
          this.jendela = { baris, jumlah: baris.length };
          this.tren = baris
            .filter((x) => x.stock != null)
            .map((x) => ({
              saldo: Number(x.stock),
              tanggal: new Date(x.date),
              dokumen: x.document_name,
              mutasi: Number(x.display_quantity),
            }))
            .reverse();
          this.susunLabelTanggal();
          this.susunSorotan();
        },
        /* Grafik dan sorotan absen diam-diam bila gagal; tabelnya tetap hidup. */
        error: () => {},
      });
  }

  fetchDeposit(): void {
    this.apiService.get(`sales-deposit/product/${this.id}`).subscribe({
      next: (data: any) => {
        this.depositTerbuka = (data as any[]).reduce(
          (jumlah, b) => jumlah + Number(b.quantity),
          0,
        );
      },
      /* Kotak deposit diam di "—" bila gagal; kartunya tetap berguna. */
      error: () => {},
    });
  }

  bukaDeposit(): void {
    this.dialog.open(DepositListDialogComponent, {
      data: {
        productID: this.id,
        reference: this.productDataSource?.reference ?? '',
      },
    });
  }

  fetchStockCard(page: number = this.page) {
    this.page = page;
    this.isLoadingCard = true;
    const id = Number(this.route.snapshot.params['id']);
    this.apiService
      .get(`product-stock/${id}`, {
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;

          if (this.page === 1 && data.data.length > 0) {
            const teratas = data.data[0];
            this.stokKini =
              teratas.stock == null ? null : Number(teratas.stock);
          }
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingCard = false;
      });
  }

  fetchProduct() {
    this.isLoadingData = true;
    const id = Number(this.route.snapshot.params['id']);
    this.apiService
      .get(`product/${id}`)
      .subscribe({
        next: (data) => {
          this.productDataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingData = false;
      });
  }

  viewDocument(data: any) {
    if (data.sales_return_code_id != null) {
      this.dialog.open(SalesReturnArchiveViewComponent, {
        data: {
          id: data.sales_return_code_id,
        },
      });
      return;
    }

    if (data.sales_invoice_code_id != null) {
      this.dialog.open(SalesInvoiceViewComponent, {
        data: {
          id: data.sales_invoice_code_id,
          noAction: true,
        },
      });
    }

    if (data.good_receipt_code_id != null) {
      this.dialog.open(GoodReceiptViewComponent, {
        data: {
          id: data.good_receipt_code_id,
        },
      });
    }

    if (data.adjustment_case_code_id != null) {
      this.dialog.open(AdjustmentCaseViewComponent, {
        data: {
          id: data.adjustment_case_code_id,
          noAction: true,
        },
      });
    }
  }

  gantiUkuran(ukuran: number): void {
    this.pageSize = ukuran;
    this.fetchStockCard(1);
  }

  /*
    Ambang stok minimum EFEKTIF: yang tertinggi antara minimum manual dan
    rekomendasi hasil hitungan reorder point — sama dengan saringan laporan
    "di bawah minimum" di server.
  */
  get minimumEfektif(): number | null {
    const manual = Number(this.productDataSource?.minimum_stock ?? 0);
    const rekomendasi = Number(
      this.productDataSource?.minimum_stock_recommendation ?? 0,
    );
    const ambang = Math.max(manual, rekomendasi);
    return ambang > 0 ? ambang : null;
  }

  get minimumDariRekomendasi(): boolean {
    const manual = Number(this.productDataSource?.minimum_stock ?? 0);
    const rekomendasi = Number(
      this.productDataSource?.minimum_stock_recommendation ?? 0,
    );
    return rekomendasi > manual;
  }

  /* ---------------------------------------------------------------- */
  /* Grafik saldo — batang per mutasi, tooltip wajib                    */
  /* ---------------------------------------------------------------- */

  get minTren(): number {
    return Math.min(...this.tren.map((t) => t.saldo));
  }

  get maksTren(): number {
    return Math.max(...this.tren.map((t) => t.saldo));
  }

  /*
    Saldo bisa MINUS, jadi batang diskalakan min–maks (bukan 0–maks seperti
    grafik nilai di laporan) dengan lantai 4% supaya titik terendah tetap
    tergambar; angka pastinya selalu ada di tooltip dan rentangnya ditulis
    di kaki grafik.
  */
  tinggiSaldo(t: (typeof this.tren)[number]): number {
    const bentang = this.maksTren - this.minTren;
    if (bentang <= 0) {
      return 50;
    }
    return 4 + ((t.saldo - this.minTren) / bentang) * 96;
  }

  /**
   * Indeks batang yang mendapat label tanggal — DIHITUNG SEKALI.
   *
   * Bentuk sebelumnya memberi label pada posisi ke-8, ke-16, dan seterusnya:
   * angka yang tidak ada hubungannya dengan tanggal. Akibatnya satu tanggal
   * bisa muncul dua kali (dua batang berjarak delapan yang kebetulan sehari)
   * sementara pergantian hari yang sebenarnya tidak ditandai sama sekali.
   *
   * Jarak minimum tetap dijaga: lima puluh hari berbeda berarti lima puluh
   * label, dan deretan itu tak terbaca. Yang dikorbankan hanya labelnya —
   * tanggal setiap batang tetap ada di tooltip.
   *
   * Disimpan sebagai himpunan, bukan dihitung di dalam tampilkanLabel: metode
   * yang dipanggil template dijalankan ulang pada SETIAP siklus deteksi
   * perubahan, untuk setiap batang.
   */
  private labelTanggal = new Set<number>();

  private susunLabelTanggal(): void {
    this.labelTanggal = new Set<number>();
    const hari = (d: Date) => d.toDateString();
    let terakhir = -99;

    this.tren.forEach((t, i) => {
      const gantiHari =
        i === 0 || hari(t.tanggal) !== hari(this.tren[i - 1].tanggal);
      if (gantiHari && i - terakhir >= 4) {
        this.labelTanggal.add(i);
        terakhir = i;
      }
    });
  }

  tampilkanLabel(i: number): boolean {
    return this.labelTanggal.has(i);
  }

  get rentangTren(): string {
    if (this.tren.length === 0) {
      return '';
    }
    const angka = (n: number) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: 2 });
    return `${angka(this.minTren)} – ${angka(this.maksTren)} ${
      this.productDataSource?.unit ?? ''
    }`;
  }

  /* ---------------------------------------------------------------- */
  /* Sorotan — klaim dibatasi jendela mutasi yang diperiksa            */
  /* ---------------------------------------------------------------- */

  private susunSorotan(): void {
    this.sorotan = [];
    const { baris, jumlah } = this.jendela;
    if (jumlah === 0) {
      return;
    }

    const t = (kunci: string, param?: object) =>
      this.translateService.instant(kunci, param);
    const angka = (n: number) =>
      n.toLocaleString('id-ID', { maximumFractionDigits: 2 });
    const unit = this.productDataSource?.unit ?? '';

    let masuk = 0;
    let keluar = 0;
    for (const x of baris) {
      const q = Number(x.display_quantity);
      if (q >= 0) {
        masuk += q;
      } else {
        keluar += -q;
      }
    }
    this.sorotan.push({
      ikon: 'ph-swap',
      teks: t('sorotan-kartu-stok__mutasi', {
        n: jumlah,
        masuk: angka(masuk),
        keluar: angka(keluar),
        unit,
      }),
    });

    const hitungan = new Map<string, number>();
    for (const x of baris) {
      const nama = this.lawanBaris(x);
      hitungan.set(nama, (hitungan.get(nama) ?? 0) + 1);
    }
    const juara = [...hitungan.entries()].sort((a, b) => b[1] - a[1])[0];
    if (juara && juara[1] >= 2) {
      this.sorotan.push({
        ikon: 'ph-crown-simple',
        teks: t('sorotan-kartu-stok__lawan', {
          nama: juara[0],
          m: juara[1],
          n: jumlah,
        }),
      });
    }

    if (this.tren.length > 1) {
      this.sorotan.push({
        ikon: 'ph-arrows-down-up',
        teks: t('sorotan-kartu-stok__rentang', {
          min: angka(this.minTren),
          maks: angka(this.maksTren),
          unit,
        }),
      });
    }
  }

  /*
    Lawan transaksi baris: supplier untuk barang masuk, pelanggan untuk
    barang keluar, Retail untuk faktur tanpa pelanggan, INTERNAL untuk
    mutasi yang memang tidak berlawan (penyesuaian dsb.).
  */
  lawanBaris(item: any): string {
    return (
      item.supplier?.name ??
      item.customer?.name ??
      (item.sales_invoice_code_id != null ? 'Retail' : 'INTERNAL')
    );
  }

  inisial(nama: string | null | undefined): string {
    return (nama ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  lacak = (_: number, item: any): number => item.id ?? 0;

  onBackButtonPressed() {
    const backUrl = this.route.snapshot.queryParams['backLocation'];
    if (backUrl == undefined) {
      const url = this.router.url.split('/');
      if (url.length > 2) {
        for (let i = 0; i < url.length - 2; i++) {
          url.pop();
        }
      }

      this.router.navigate(url);
    } else {
      const decodedURL = decodeURIComponent(backUrl);
      this.router.navigateByUrl(decodedURL);
    }
  }
}
