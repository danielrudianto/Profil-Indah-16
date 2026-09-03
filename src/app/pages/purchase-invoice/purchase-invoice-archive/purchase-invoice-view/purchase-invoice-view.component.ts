import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { persenDiskon } from 'src/app/utils/diskon-persen.utils';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';

/**
 * Tampilan BACA faktur pembelian (arsip) — dokumen, bukan formulir
 * berbaju kolom input. Bentuk lamanya membawa jalur hapus SALAH JENIS
 * dokumen (DELETE sales-invoice/:id pada id penerimaan barang!) yang
 * untungnya tidak pernah terpanggil dari template; hanya jalur benar
 * (DELETE good-receipt/:id) yang dipertahankan. Navigasi ubahnya juga
 * dibetulkan — dulu menunjuk prefix /Administrator yang sudah tiada.
 */
@Component({
  selector: 'app-purchase-invoice-view',
  templateUrl: './purchase-invoice-view.component.html',
  styleUrls: ['./purchase-invoice-view.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    MatTooltip,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class PurchaseInvoiceViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; noAction: boolean },
    private dialogRef: MatDialogRef<PurchaseInvoiceViewComponent>,
    private apiService: ApiService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private clipboard: Clipboard,
    private authService: AuthService,
    private translateService: TranslateService,
    private router: Router,
  ) {}

  isAdministrator = false;
  isSubmitting = false;
  isLoading = true;

  dokumen: any = null;
  barang: any[] = [];

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.apiService
      .get(`good-receipt/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.dokumen = {
            name: data.name,
            invoiceName: data.invoice_name,
            faktur: data.faktur,
            date: data.date,
            supplier: data.supplier.name,
            isDelete: data.is_delete,
            isConfirm: data.is_confirm,
            discount: Number(data.discount ?? 0),
            createdBy: data.user_good_receipt_code_created_byTouser.name,
            createdAt: data.created_at,
          };

          this.barang = (data.good_receipt ?? []).map((x: any) => ({
            reference: x.product.reference,
            description: x.product.description,
            quantity: Number(x.quantity),
            unit:
              x.product_unit_id == null ? x.product.unit : x.product_unit.unit,
            price: Number(x.price),
            discount: Number(x.discount),
          }));
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialogRef.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get inisial(): string {
    return (
      (this.dokumen?.supplier ?? '?').trim().charAt(0).toUpperCase() || '?'
    );
  }

  get statusKey(): string {
    if (this.dokumen?.isDelete) {
      return 'purchase-invoice__archive__view__status__deleted';
    }
    return this.dokumen?.isConfirm
      ? 'purchase-invoice__archive__view__status__confirmed'
      : 'purchase-invoice__archive__view__status__pending';
  }

  get subtotal(): number {
    return this.barang.reduce(
      (a, b) => a + b.quantity * (b.price - b.discount),
      0,
    );
  }

  get grandTotal(): number {
    return this.subtotal - this.dokumen.discount;
  }

  totalBaris(b: any): number {
    return b.quantity * (b.price - b.discount);
  }

  /** Ubah dan hapus hanya untuk admin pada dokumen terkonfirmasi yang hidup. */
  get bolehKelola(): boolean {
    return (
      this.isAdministrator &&
      !this.data.noAction &&
      this.dokumen?.isDelete === false &&
      this.dokumen?.isConfirm === true
    );
  }

  tutup(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close();
    setTimeout(() => {
      this.router.navigate([`/Purchase-invoice/Edit/${this.data.id}`]);
    }, 100);
  }

  delete(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'purchase-invoice__delete__message',
          ),
          document: this.dokumen?.name,
        },
      })
      .afterClosed()
      .subscribe((jawaban) => {
        if (jawaban == true) {
          this.isSubmitting = true;
          this.apiService
            .delete(`good-receipt/${this.data.id}`)
            .subscribe({
              next: () => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'good-receipt__delete__success',
                  ),
                );
                this.dialogRef.close('deleted');
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            })
            .add(() => {
              this.isSubmitting = false;
            });
        }
      });
  }

  /**
   * Persen diskon baris, untuk tooltip pada kolom diskon.
   *
   * Mengembalikan teks KOSONG bila persennya tidak punya arti — harga atau
   * diskon nol. MatTooltip tidak menampilkan apa pun untuk teks kosong, jadi
   * baris tanpa diskon tidak menumbuhkan tooltip berisi "0%".
   *
   * Angkanya diformat di sini, bukan lewat DecimalPipe, karena isi tooltip
   * berupa string biasa dan bukan bagian dari template.
   */
  persenDiskonBaris(b: any): string {
    const persen = persenDiskon(b?.price, b?.discount);
    return persen == null ? '' : `${persen.toFixed(2)}%`;
  }

  /**
   * Salin nomor dokumen ke papan klip.
   *
   * Nomor inilah yang dicocokkan orang ke dokumen lain, dan selama ini
   * disorot tangan dari header — mudah meleset satu karakter pada nomor
   * bertanda hubung. Menyorotnya juga berebut dengan cdkDrag: pegangan geser
   * memang dibatasi ke header, jadi seretan yang dimaksudkan untuk memilih
   * teks justru memindahkan dialognya.
   *
   * Menyalin nomor kosong tidak dilakukan: papan klip yang berisi string
   * kosong DIAM-DIAM menghapus isinya yang sebelumnya, dan orang yang menekan
   * tombol ini menyangka salinannya berhasil.
   */
  salinNomor(): void {
    const nomor = ((this.dokumen?.invoiceName || this.dokumen?.name) ?? '')
      .toString()
      .trim();
    if (!nomor) {
      return;
    }

    this.clipboard.copy(nomor);
    this.alertService.showSuccess(
      this.translateService.instant('general__number-copied'),
    );
  }
}
