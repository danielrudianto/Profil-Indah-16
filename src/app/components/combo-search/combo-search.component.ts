import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { MatSuffix, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

export interface ComboItem {
  id: number;
  name: string;
}

/**
 * Kolom isian dengan saran — sistem desain Nocturne.
 *
 * Menggantikan app-autocomplete-search PADA HALAMAN YANG SUDAH DIDESAIN ULANG
 * SAJA. Komponen lama dibangun dari mat-form-field beserta mat-autocomplete,
 * dan bentuk Material itu berdiri sendiri di tengah formulir Nocturne: kotak
 * isiannya bertingkat, warnanya diambil dari palet Material, dan tingginya
 * tidak sama dengan kolom isian di sebelahnya. Komponen lama sengaja dibiarkan
 * berdiri untuk halaman yang belum disentuh.
 *
 * Sumber datanya sama persis: GET {route}/autocomplete?keyword=…
 */
@Component({
  selector: 'app-combo-search',
  templateUrl: './combo-search.component.html',
  styleUrls: ['./combo-search.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    NgIf,
    NgFor,
    ReactiveFormsModule,
  ],
})
export class ComboSearchComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private elementRef: ElementRef<HTMLElement>,
  ) {}

  private destroyRef = inject(DestroyRef);

  /** Nama rute tanpa akhiran, misalnya "product-brand". */
  @Input({ required: true }) route!: string;

  /** Judul kolom. Kosong berarti kolomnya memang tidak berjudul. */
  @Input() label = '';

  @Input() inputId = '';
  @Input() placeholder = '';
  @Input() disabled = false;

  /**
   * Nilai awal untuk formulir UBAH: nama yang sudah tersimpan tampil di kolom
   * tanpa memancing pencarian maupun peristiwa pick/clear — pemanggil sudah
   * memegang id-nya. Mengetik di atasnya berlaku normal: mengubah teksnya
   * membatalkan pilihan lama dan mencari yang baru.
   */
  @Input() set initial(nama: string | null | undefined) {
    if (nama == null || nama === '') {
      return;
    }

    this.terpilih = nama;
    this.control.setValue(nama, { emitEvent: false });
  }

  /**
   * Kosongkan kolom begitu sarannya dipilih — untuk pemilih berkumpulan
   * chip: yang dipilih pindah menjadi kapsul, kolomnya siap mencari lagi.
   * Tanpa ini nama pilihan terakhir tertinggal di kolom dan terlihat
   * seperti belum diapa-apakan.
   */
  @Input() kosongkanSetelahPilih = false;

  /**
   * Id yang sudah terpakai (sudah jadi kapsul). Sarannya tetap tampil
   * supaya orang tahu barangnya ada, tetapi mati — tidak bisa dipilih dua
   * kali.
   */
  @Input() terpakai: number[] = [];

  @Output() pick = new EventEmitter<ComboItem>();
  @Output() clear = new EventEmitter<void>();

  control = new FormControl<string>('');

  items: ComboItem[] = [];
  terbuka = false;
  sorot = -1;

  /**
   * Nama yang sedang dipilih, dipakai untuk mengenali ketikan yang mengubahnya.
   *
   * Tanpa ini, membuka daftar saran saja sudah menghitung sebagai "batal
   * memilih", dan nilai yang sudah benar ikut terhapus.
   */
  private terpilih: string | null = null;

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed(this.destroyRef))
      .subscribe((nilai) => {
        const teks = nilai ?? '';

        if (this.terpilih !== null && teks !== this.terpilih) {
          this.terpilih = null;
          this.clear.emit();
        }

        this.ambilSaran(teks);
      });
  }

  /** Klik di luar menutup daftar; tanpa ini daftarnya menggantung terus. */
  @HostListener('document:click', ['$event'])
  klikDiLuar(peristiwa: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(peristiwa.target as Node)) {
      this.tutup();
    }
  }

  fokus(): void {
    if (!this.disabled) {
      this.ambilSaran(this.control.value ?? '');
    }
  }

  tombol(peristiwa: KeyboardEvent): void {
    if (peristiwa.key === 'Escape') {
      this.tutup();
      return;
    }

    if (!this.terbuka || this.items.length === 0) {
      return;
    }

    if (peristiwa.key === 'ArrowDown') {
      peristiwa.preventDefault();
      this.sorot = (this.sorot + 1) % this.items.length;
    } else if (peristiwa.key === 'ArrowUp') {
      peristiwa.preventDefault();
      this.sorot = (this.sorot - 1 + this.items.length) % this.items.length;
    } else if (peristiwa.key === 'Enter' && this.sorot >= 0) {
      peristiwa.preventDefault();
      this.pilih(this.items[this.sorot]);
    }
  }

  sudahTerpakai(item: ComboItem): boolean {
    return this.terpakai.includes(item.id);
  }

  pilih(item: ComboItem): void {
    if (this.sudahTerpakai(item)) {
      return;
    }

    if (this.kosongkanSetelahPilih) {
      this.terpilih = null;
      this.control.setValue('', { emitEvent: false });
      this.tutup();
      this.pick.emit(item);
      return;
    }

    this.terpilih = item.name;
    /* emitEvent: false — ini bukan ketikan pengguna, jadi jangan cari ulang. */
    this.control.setValue(item.name, { emitEvent: false });
    this.tutup();
    this.pick.emit(item);
  }

  /** Dipakai halaman setelah membuat data baru dari formulir ini. */
  setSelected(item: ComboItem): void {
    this.pilih(item);
  }

  /**
   * Mengosongkan kolom tanpa memancing peristiwa clear — dipakai formulir
   * yang mengatur ulang dirinya setelah berhasil menyimpan, ketika nilai
   * di balik kolom ini sudah dikembalikan lewat jalurnya sendiri.
   */
  reset(): void {
    this.terpilih = null;
    this.control.setValue('', { emitEvent: false });
    this.tutup();
  }

  private tutup(): void {
    this.terbuka = false;
    this.sorot = -1;
  }

  private ambilSaran(kataKunci: string): void {
    this.apiService
      .get(`${this.route}/autocomplete`, { keyword: kataKunci })
      .subscribe({
        next: (data: any) => {
          this.items = Array.isArray(data) ? data : [];
          this.terbuka = this.items.length > 0;
          this.sorot = -1;
        },
        error: () => {
          /*
            Saran yang gagal dimuat tidak boleh menjatuhkan formulirnya. Yang
            hilang hanya bantuannya; kolomnya tetap bisa diketik.
          */
          this.items = [];
          this.tutup();
        },
      });
  }
}
