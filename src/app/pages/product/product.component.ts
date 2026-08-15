import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs';
import { Item } from 'src/app/models/item.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { UpdateProductComponent } from './update-product/update-product.component';

/**
 * Daftar barang — sistem desain Nocturne.
 *
 * TIDAK LAGI MEMAKAI app-feature-search. Komponen itu bukan sekadar kolom
 * pencarian: ia juga yang mengambil datanya dan yang memutuskan dialog mana
 * yang dibuka tombol tambah, lewat satu switch berisi sebelas halaman.
 * Akibatnya tata letak baris pencarian tidak bisa diubah untuk satu halaman
 * tanpa ikut mengubah sepuluh halaman lain yang belum disentuh desain.
 *
 * Halaman ini kini mengambil datanya sendiri. Parameternya sama persis dengan
 * yang dikirim komponen lama — keyword, page, pageSize, content, mode —
 * sehingga tidak ada perubahan apa pun di sisi server.
 *
 * CATATAN: keping saringan status yang ada di berkas desain belum dipasang.
 * Endpoint daftar barang hanya menerima page, keyword, dan pageSize; menyaring
 * di sisi peramban hanya akan menyaring SATU HALAMAN hasil, sehingga "Nonaktif"
 * menampilkan sebagian saja dan terbaca seperti data yang hilang.
 */
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    TranslatePipe,
  ],
})
export class ProductComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
  ) {}

  private destroyRef = inject(DestroyRef);

  readonly pilihanUkuran = [10, 25, 50];

  cariControl = new FormControl<string>('');

  isLoading = true;
  dataSource: Item[] = [];
  dataCount = 0;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    /*
      Jeda satu detik sama dengan bentuk sebelumnya. Tanpa jeda, setiap huruf
      yang diketik menjadi satu permintaan ke server.
    */
    this.cariControl.valueChanges
      .pipe(debounceTime(1000), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page = 1;
        this.ambilData();
      });

    this.ambilData();
  }

  /** Nomor urut pertama dan terakhir yang sedang tampil, untuk keterangan kaki. */
  get dari(): number {
    return this.dataCount === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get sampai(): number {
    return Math.min(this.page * this.pageSize, this.dataCount);
  }

  get halamanTerakhir(): number {
    return Math.max(1, Math.ceil(this.dataCount / this.pageSize));
  }

  lacakBarang = (_: number, item: Item): number => item.id;

  ambilData(): void {
    this.isLoading = true;

    this.apiService
      .get('product', {
        keyword: this.cariControl.value ?? '',
        page: this.page,
        pageSize: this.pageSize,
        content: 'false',
        mode: 'default',
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

  gantiUkuran(ukuran: number): void {
    if (ukuran === this.pageSize) {
      return;
    }

    this.pageSize = ukuran;
    /* Kembali ke halaman satu: nomor halaman lama menunjuk potongan lain. */
    this.page = 1;
    this.ambilData();
  }

  pindahHalaman(arah: -1 | 1): void {
    const tujuan = this.page + arah;
    if (tujuan < 1 || tujuan > this.halamanTerakhir) {
      return;
    }

    this.page = tujuan;
    this.ambilData();
  }

  tambah(): void {
    this.router.navigate(['Create'], { relativeTo: this.activatedRoute });
  }

  ubah(item: Item): void {
    this.dialog
      .open(UpdateProductComponent, { data: { id: item.id } })
      .afterClosed()
      .subscribe((data) => {
        if (!data) {
          return;
        }

        const index = this.dataSource.findIndex((x) => x.id === item.id);
        if (index !== -1) {
          this.dataSource[index] = { ...this.dataSource[index], ...data };
        }
      });
  }

  gantiStatus(item: Item): void {
    const index = this.dataSource.findIndex((x) => x.id === item.id);
    if (index === -1) {
      return;
    }

    this.apiService.put('product/active', { id: item.id }).subscribe({
      next: (data: any) => {
        this.dataSource[index].is_active = !this.dataSource[index].is_active;
        this.alertService.showSuccess(
          `${data.reference} ${this.translate.instant(
            'general__updated-successfully',
          )}`,
        );
      },
      error: (error: any) => {
        this.alertService.showError(error);
      },
    });
  }
}
