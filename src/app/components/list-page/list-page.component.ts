import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime } from 'rxjs';

/**
 * Kerangka halaman daftar — sistem desain Nocturne.
 *
 * YANG DIBAGI DI SINI HANYA TAMPILANNYA: judul, baris alat, kartu, dan kaki
 * halaman. Isi tabelnya tetap ditulis masing-masing halaman dan disalurkan ke
 * sini lewat ng-content, jadi menambah kolom aneh atau tombol khusus tidak
 * perlu menyentuh berkas ini sama sekali.
 *
 * PENGAMBILAN DATANYA SENGAJA TIDAK IKUT. Itu pelajaran dari
 * app-feature-search, yang menyatukan tata letak, pengambilan data, dan
 * pemilihan dialog tambah untuk sebelas halaman sekaligus: begitu satu halaman
 * perlu baris pencarian yang berbeda, sepuluh halaman lain ikut tersandera.
 * Di sini komponennya hanya memberi tahu "kata kuncinya berubah" atau
 * "halamannya berpindah", dan halamanlah yang memutuskan apa yang dilakukan.
 *
 * Batas itu yang membuat pembagian ini aman: yang dibagi adalah bagian yang
 * memang TIDAK BOLEH berbeda antar halaman — kalau berbeda, itu justru cacat.
 */
@Component({
  selector: 'app-list-page',
  templateUrl: './list-page.component.html',
  styleUrls: ['./list-page.component.scss'],
  imports: [NgIf, NgFor, ReactiveFormsModule, TranslatePipe],
})
export class ListPageComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  /**
   * Judul halaman.
   *
   * Namanya BUKAN `title`: atribut itu sudah dimiliki setiap elemen HTML, dan
   * memakainya di sini membuat judul halaman ikut muncul sebagai gelembung
   * petunjuk ketika tetikus berhenti di atas komponen.
   */
  @Input({ required: true }) heading!: string;

  /** Kalimat pendek di bawah judul; boleh kosong. */
  @Input() lede = '';

  @Input() searchPlaceholder = '';

  /** Label tombol tambah. Kosong berarti halaman ini tidak punya tombol itu. */
  @Input() addLabel = '';

  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() loading = false;

  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() add = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();

  readonly pilihanUkuran = [10, 25, 50];

  searchControl = new FormControl<string>('');

  ngOnInit(): void {
    /*
      Jeda satu detik. Tanpa jeda, setiap huruf yang diketik menjadi satu
      permintaan ke server.
    */
    this.searchControl.valueChanges
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe((nilai) => this.search.emit(nilai ?? ''));
  }

  /** Nomor urut pertama dan terakhir yang sedang tampil. */
  get dari(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get sampai(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  get halamanTerakhir(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  gantiUkuran(ukuran: number): void {
    if (ukuran !== this.pageSize) {
      this.pageSizeChange.emit(ukuran);
    }
  }

  pindahHalaman(arah: -1 | 1): void {
    const tujuan = this.page + arah;
    if (tujuan >= 1 && tujuan <= this.halamanTerakhir) {
      this.pageChange.emit(tujuan);
    }
  }
}
