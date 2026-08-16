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

/**
 * Pilih paket — kembaran pemilih produk (frame 14a), dengan satu perbedaan
 * yang disengaja: menekan baris MENUTUP dialog sambil membawa pilihannya.
 * Paket hanya boleh satu kali per faktur (pemanggil menolak kembarannya),
 * jadi tidak ada alasan membiarkan dialognya terbuka seperti pemilih produk.
 *
 * Kontrak hasilnya `{ item }` — dipertahankan untuk kedua pemanggil lama
 * (faktur penjualan dan retur). Pemanggil boleh menitipkan `barisSaatIni`
 * lewat `data` untuk menandai paket yang sudah masuk dokumen.
 */
@Component({
  selector: 'app-package-selector',
  templateUrl: './package-selector.component.html',
  styleUrls: ['./package-selector.component.scss'],
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
export class PackageSelectorComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  /** Titipan opsional: barisSaatIni() — id paket yang sudah masuk dokumen. */
  @Input('data') data: any;

  @ViewChild('searchBarInput') searchBarInput?: ElementRef<HTMLInputElement>;

  dataSource: any[] = [];
  dataCount = 0;
  page = 1;
  isOpened = true;
  isLoading = false;

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

  ngAfterViewInit(): void {
    this.searchBarInput?.nativeElement.focus();
  }

  /** Benar bila paketnya sudah menjadi baris di dokumen pemanggil. */
  sudahMasuk(element: any): boolean {
    const ids: number[] = this.data?.barisSaatIni?.() ?? [];
    return ids.includes(element.id);
  }

  /** Ringkasan isi — "4 × PRF-001 · 2 × ATP-002". */
  ringkasIsi(element: any): string {
    return (element.package_content ?? [])
      .map((x: any) => `${Number(x.quantity)} × ${x.product?.reference ?? ''}`)
      .join(' · ');
  }

  pilih(element: any): void {
    this.closeDialog({ item: element });
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
      .get('product-package', {
        keyword: keyword,
        page: page,
        /* Isi paketnya ikut terkirim — dipakai baris rincian dan pemanggil. */
        content: 'true',
      })
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
