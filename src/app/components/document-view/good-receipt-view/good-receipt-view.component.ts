import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { persenDiskon } from 'src/app/utils/diskon-persen.utils';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

/**
 * Tampilan BACA penerimaan barang — dokumen, bukan formulir accordion
 * berbaju kolom input. Dialog ini murni melihat: satu-satunya aksinya
 * menutup.
 */
@Component({
  selector: 'app-good-receipt-view',
  templateUrl: './good-receipt-view.component.html',
  styleUrls: ['./good-receipt-view.component.scss'],
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
export class GoodReceiptViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private clipboard: Clipboard,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<GoodReceiptViewComponent>,
  ) {}

  isLoading = true;
  dokumen: any = null;
  barang: any[] = [];

  ngOnInit(): void {
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
      return 'sales-invoice__archive__view__status__deleted';
    }
    return this.dokumen?.isConfirm
      ? 'sales-invoice__archive__view__status__confirmed'
      : 'sales-invoice__archive__view__status__pending';
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

  tutup(): void {
    this.dialogRef.close();
  }

  /**
   * Salin nomor surat jalan ke papan klip.
   *
   * Nomor ini yang dicocokkan orang gudang ke faktur pembelian supplier, dan
   * selama ini disorot tangan dari header — yang mudah meleset satu karakter
   * pada nomor bertanda hubung. Menyorotnya juga berebut dengan cdkDrag:
   * pegangan geser memang dibatasi ke header, jadi seretan yang dimaksudkan
   * untuk memilih teks justru memindahkan dialognya.
   *
   * Menyalin nomor kosong tidak dilakukan: papan klip yang berisi string
   * kosong DIAM-DIAM menghapus isinya yang sebelumnya, dan orang yang menekan
   * tombol ini menyangka salinannya berhasil.
   */
  salinNomor(): void {
    const nomor = (this.dokumen?.name ?? '').toString().trim();
    if (!nomor) {
      return;
    }

    this.clipboard.copy(nomor);
    this.alertService.showSuccess(
      this.translateService.instant('good-receipt__view__number-copied'),
    );
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
}
