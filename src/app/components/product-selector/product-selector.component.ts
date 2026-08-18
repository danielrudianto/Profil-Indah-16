import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from '../dynamic-dialog/dynamic-dialog.component';
import { DialogShellComponent } from '../dialog-shell/dialog-shell.component';

export enum ProductSelectorType {
  purchase,
  sales,
  plain,
  return,
}

/**
 * Pilih produk — sistem desain Nocturne, frame 14a.
 *
 * DIALOGNYA TIDAK MENUTUP SETIAP KALI SATU BARANG DIPILIH. Menekan sebuah
 * barang langsung menambahkan SATU BARIS ke dokumen pemanggil, dan dialognya
 * tetap terbuka untuk barang berikutnya.
 *
 * Barang yang sama boleh dipilih berkali-kali. Itu bukan kelonggaran,
 * melainkan syarat: bonus dari supplier dicatat sebagai baris terpisah dengan
 * harga sendiri — 10 box @150.000 dan 1 box @0 adalah dua baris dengan barang
 * DAN satuan yang sama. Bentuk sebelumnya menolaknya, dan penolakannya bahkan
 * bergantung urutan mengetik: satuan dasar ditolak bila barangnya sudah ada
 * dalam satuan apa pun, sementara urutan sebaliknya lolos.
 *
 * JUMLAH DAN HARGA TIDAK DIISI DI SINI, semuanya di tabel dokumen. Satu tempat
 * mengetik angka, bukan dua.
 *
 * Dialog ini tidak tahu dokumen apa yang memanggilnya. Pemanggil menitipkan
 * dua hal lewat `data`: cara menambah baris, dan cara membaca baris yang sudah
 * ada — itu yang dipakai menggambar lencana "N baris".
 */
@Component({
  selector: 'app-product-selector',
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    ReactiveFormsModule,
    TranslatePipe,
    DynamicDialogComponent,
    DialogShellComponent,
  ],
})
export class ProductSelectorComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  /**
   * Titipan dari pemanggil:
   *   type        — jenis harga yang relevan (pembelian/penjualan)
   *   onTambah    — dipanggil sekali untuk tiap baris yang ditambahkan
   *   barisSaatIni— mengembalikan baris dokumen, untuk lencana "N baris"
   */
  @Input('data') data: any;

  @ViewChild('searchBarInput') searchBarInput?: ElementRef<HTMLInputElement>;

  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  isOpened = true;
  isLoading = false;

  /** Satuan terpilih per barang; menentukan satuan baris BERIKUTNYA. */
  satuanDipilih: Record<number, number | null> = {};

  /* Satu kolom saja; FormGroup hanya menambah lapisan tanpa guna di sini. */
  cariControl = new FormControl<string>('');

  @HostListener('document:keydown', ['$event'])
  tombol(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeDialog();
    }
  }

  ngOnInit(): void {
    this.fetchItems();
    this.cariControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        this.page = 1;
        this.fetchItems(1, value ?? '');
      });
  }

  /*
    setTimeout: fokus dipasang SETELAH giliran render selesai — dipanggil
    langsung, kolomnya kadang belum bisa menerima fokus ketika dialognya
    masih menganimasikan diri, dan yang fokus tetap badan halaman.
  */
  ngAfterViewInit(): void {
    setTimeout(() => this.fokusKeCari());
  }

  /** Seluruh baris yang sudah ada di dokumen pemanggil. */
  get totalBaris(): number {
    return (this.data?.barisSaatIni?.() ?? []).length;
  }

  /** Baris dokumen milik barang ini, untuk lencana dan rinciannya. */
  barisUntuk(element: any): any[] {
    const semua = this.data?.barisSaatIni?.() ?? [];
    return semua.filter((b: any) => b.product_id === element.id);
  }

  satuanAktif(element: any): any | null {
    const id = this.satuanDipilih[element.id];
    if (id == null) {
      return null;
    }
    return (element.product_unit ?? []).find((u: any) => u.id === id) ?? null;
  }

  pilihSatuan(element: any, sub: any | null): void {
    this.satuanDipilih[element.id] = sub == null ? null : sub.id;
  }

  /**
   * Menambah satu baris.
   *
   * DUA PERILAKU, dan itu disengaja. Pemanggil yang menitipkan onTambah —
   * saat ini baru penerimaan barang — mendapat bentuk 14a: barisnya
   * ditambahkan dan dialognya TETAP TERBUKA untuk barang berikutnya.
   *
   * Pemanggil lama yang tidak menitipkan apa pun tetap mendapat perilaku
   * sebelumnya: dialog menutup sambil membawa satu pilihan. Ada empat belas
   * halaman yang masih memakainya; mengubah kontraknya sekaligus berarti
   * empat belas halaman berhenti bisa menambah barang dalam satu langkah,
   * tanpa satu pun galat — `if (result)` mereka hanya menerima undefined dan
   * diam. Jalur lama ini dilepas belakangan, halaman demi halaman.
   */
  tambahBaris(element: any): void {
    const pilihan = { data: element, sub: this.satuanAktif(element) };

    if (this.data?.onTambah) {
      this.data.onTambah(pilihan);
      /*
        Fokus kembali ke kolom cari dengan kata kuncinya tersorot: barang
        berikutnya langsung bisa diketik menimpa yang lama, tanpa meraih
        tetikus lagi. Tanpa ini fokus tertinggal di tombol tambah.
      */
      this.fokusKeCari();
      return;
    }

    this.closeDialog(pilihan);
  }

  private fokusKeCari(): void {
    const kolom = this.searchBarInput?.nativeElement;
    kolom?.focus();
    kolom?.select();
  }

  closeDialog(hasil?: any): void {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(hasil);
    }, 300);
  }

  bukaHalaman(arah: -1 | 1): void {
    const tujuan = this.page + arah;
    if (tujuan >= 1 && tujuan <= this.halamanTerakhir) {
      this.page = tujuan;
      this.fetchItems();
    }
  }

  get halamanTerakhir(): number {
    const ukuran = this.dataSource.length || 10;
    return Math.max(1, Math.ceil(this.dataCount / ukuran));
  }

  fetchItems(
    page: number = this.page,
    keyword: string = this.cariControl.value ?? '',
  ) {
    this.isLoading = true;
    this.apiService
      .get('product/selector', { keyword, page })
      .subscribe({
        next: (data: any) => {
          this.dataCount = data.count;
          this.dataSource = data.data;
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
