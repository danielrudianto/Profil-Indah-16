import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { persenDiskon } from 'src/app/utils/diskon-persen.utils';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {
  Margins,
  PageOrientation,
  PageSize,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { namaBerkasDokumen } from 'src/app/utils/file-name.utils';

import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { PdfService } from 'src/app/services/pdf.service';

/**
 * Tampilan BACA sebuah faktur penjualan — dokumen, bukan formulir.
 *
 * Bentuk lamanya menyaru sebagai formulir: setiap nilai dibungkus kolom
 * input Material lengkap dengan tanda wajib merah, padahal tidak ada
 * satu pun yang bisa disunting — "jadi curiga aneh". Sekarang: kepala
 * beridentitas (pelanggan, nomor dokumen, pill status), kisi
 * label/nilai, tabel barang, rincian nilai, daftar pembayaran, dan —
 * untuk administrator — riwayat perubahan dari jejak audit.
 *
 * Kontraknya tidak berubah: dibuka dengan {id, noAction}, menutup
 * dengan 'deleted' setelah penghapusan, dan PDF cetakannya dibangun
 * persis seperti sebelumnya.
 */
@Component({
  selector: 'app-sales-invoice-view',
  templateUrl: './sales-invoice-view.component.html',
  styleUrls: ['./sales-invoice-view.component.scss'],
  providers: [DatePipe, DecimalPipe],
  imports: [NgIf, NgFor, DecimalPipe, DatePipe, TranslatePipe, MatTooltip],
})
export class SalesInvoiceViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; noAction: boolean },
    private authService: AuthService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<SalesInvoiceViewComponent>,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private pdfService: PdfService,
  ) {}

  isAdministrator = false;
  isLoading = true;

  dokumen: any = null;
  barang: any[] = [];
  pembayaran: any[] = [];

  /** Riwayat perubahan dari jejak audit — khusus administrator. */
  riwayat: any[] = [];

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.ambilData();
    if (this.isAdministrator) {
      this.ambilRiwayat();
    }
  }

  ambilData(): void {
    this.isLoading = true;
    this.apiService
      .get(`sales-invoice/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.dokumen = {
            name: data.name,
            date: data.date,
            sales: data.sales == null ? 'INTERNAL' : data.sales.toUpperCase(),
            customer: data.customer == null ? null : data.customer.name,
            isDelete: data.is_delete,
            isConfirm: data.is_confirm,
            discount: Number(data.discount),
            service: Number(data.service),
            delivery: Number(data.delivery),
            createdBy: data.user_bill_code_created_byTouser.name,
            createdAt: data.createdAt,
          };

          this.barang = (data.sales_invoice ?? []).map((x: any) => ({
            reference: x.product.reference,
            description: x.product.description,
            quantity: Number(x.quantity),
            unit: x.product_unit == null ? x.product.unit : x.product_unit.unit,
            price: Number(x.price),
            discount: Number(x.discount),
          }));

          this.pembayaran = (data.sales_invoice_payment ?? []).map(
            (x: any) => ({
              date: x.date,
              payment_method: x.payment_method,
              value: Number(x.value),
            }),
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  /*
    Gagal memuat riwayat bukan alasan menahan dokumennya — seksi ini
    hilang diam-diam (mis. peran tidak berwenang membaca jejak audit).
  */
  ambilRiwayat(): void {
    this.apiService
      .get('audit-logs', {
        entity: 'sales_invoice_code',
        entityID: this.data.id,
        page_size: 20,
      })
      .subscribe({
        next: (data: any) => {
          this.riwayat = data.data ?? [];
        },
        error: () => {
          this.riwayat = [];
        },
      });
  }

  /* ---------------------------------------------------------------- */
  /* Turunan tampilan                                                  */
  /* ---------------------------------------------------------------- */

  get namaPelanggan(): string {
    return (
      this.dokumen?.customer ??
      this.translateService.instant('sales-invoice__retail')
    );
  }

  get inisial(): string {
    return this.namaPelanggan.trim().charAt(0).toUpperCase() || '?';
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
    return (
      this.subtotal +
      this.dokumen.delivery +
      this.dokumen.service -
      this.dokumen.discount
    );
  }

  totalBaris(b: any): number {
    return b.quantity * (b.price - b.discount);
  }

  labelAksi(aksi: string): string {
    return this.translateService.instant(`sales-invoice__view__aksi__${aksi}`);
  }

  /** Ringkasan perubahan: "field: nilai" — `from` memang tidak dicatat. */
  ubahanTeks(changes: any): string {
    if (!changes || typeof changes !== 'object') {
      return '';
    }
    return Object.entries(changes)
      .map(([kunci, nilai]) => `${kunci}: ${nilai}`)
      .join(' · ');
  }

  lacakRiwayat = (_: number, item: any): number => item.id;

  /* ---------------------------------------------------------------- */
  /* Aksi                                                              */
  /* ---------------------------------------------------------------- */

  tutup(): void {
    this.dialogRef.close();
  }

  openDeleteConfirmation(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'sales-invoice__archive__view__delete__title',
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === true) {
          this.apiService.delete(`sales-invoice/${this.data.id}`).subscribe({
            next: () => {
              this.alertService.showSuccess(
                this.translateService.instant('sales-invoice__delete__success'),
              );
              this.dialogRef.close('deleted');
            },
            error: (error) => {
              this.alertService.showError(error);
            },
          });
        }
      });
  }

  /* ---------------------------------------------------------------- */
  /* Cetak — format rancangan desainer toko                            */
  /*                                                                   */
  /* Kepala: judul besar di kiri, logo + nama toko + alamat di kanan.  */
  /* Info dokumen berpasangan label-di-atas-nilai, tabel barang        */
  /* berkepala pita abu-abu, blok total menempel kanan, lalu seksi     */
  /* Payment Record. Watermark DRAFT dipertahankan. Bila logo gagal    */
  /* termuat, kepalanya jatuh ke varian teks — dokumen tetap tercetak. */
  /* ---------------------------------------------------------------- */

  async print(): Promise<void> {
    const title = 'Sales Invoice';
    const fileName = 'Sales_invoice';
    const angka = (nilai: number, format: string) =>
      this.decimalPipe.transform(nilai, format);

    let logo: string | null = null;
    try {
      const respons = await fetch('assets/images/logo.png');
      const isi = await respons.blob();
      logo = await new Promise<string>((selesai, gagal) => {
        const pembaca = new FileReader();
        pembaca.onload = () => selesai(pembaca.result as string);
        pembaca.onerror = gagal;
        pembaca.readAsDataURL(isi);
      });
    } catch {
      logo = null;
    }

    const kepalaKanan = logo
      ? {
          width: 'auto',
          stack: [
            { image: logo, width: 52, alignment: 'right' },
            {
              text: 'TOKO PROFIL INDAH',
              bold: true,
              fontSize: 10,
              alignment: 'right',
              margin: [0, 4, 0, 0] as Margins,
            },
            {
              text: 'Jalan Buluh Indah No. 54 C Denpasar - Bali',
              fontSize: 7,
              color: '#666666',
              alignment: 'right',
            },
          ],
        }
      : {
          width: 'auto',
          text: 'Toko Profil Indah',
          fontSize: 22,
          bold: true,
          alignment: 'right',
        };

    const pasangan = (label: string, nilai: string | null) => ({
      stack: [
        { text: label, style: 'label' },
        { text: nilai ?? '-', style: 'value', margin: [0, 2, 0, 0] as Margins },
      ],
      margin: [0, 0, 0, 12] as Margins,
    });

    /* Garis mendatar tipis tanpa garis tegak — meniru kartu rancangan. */
    const tataBaris = {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0,
      hLineColor: () => '#dddddd',
      paddingTop: () => 6,
      paddingBottom: () => 6,
      paddingLeft: () => 8,
      paddingRight: () => 8,
    };

    const kepalaSel = (teks: string) => ({
      text: teks,
      bold: true,
      fontSize: 10,
      fillColor: '#e2e2e2',
    });

    const content = [
      {
        columns: [
          { width: '*', text: title, fontSize: 24, bold: true },
          kepalaKanan,
        ],
        margin: [0, 0, 0, 20] as Margins,
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              pasangan(
                'Date',
                this.datePipe.transform(this.dokumen.date, 'dd MMM yyyy'),
              ),
              pasangan('Status', this.translateService.instant(this.statusKey)),
              pasangan('Created By', this.dokumen.createdBy),
            ],
          },
          {
            width: '*',
            stack: [
              pasangan('Name', this.dokumen.name),
              pasangan('Customer', this.namaPelanggan),
              pasangan(
                'Created at',
                this.datePipe.transform(
                  this.dokumen.createdAt,
                  'dd MMM yyyy. HH:mm',
                ),
              ),
            ],
          },
        ],
        margin: [0, 0, 0, 16] as Margins,
      },
      {
        layout: tataBaris,
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              kepalaSel('Product'),
              kepalaSel('Quantity'),
              kepalaSel('Price'),
              kepalaSel('Discount (Rp.)'),
              kepalaSel('Discount (%)'),
              kepalaSel('Total'),
            ],
            ...this.barang.map((item) => {
              return [
                [
                  { text: item.reference, bold: true, fontSize: 10 },
                  { text: item.description, fontSize: 8, color: '#666666' },
                ],
                {
                  text: `${angka(item.quantity, '1.0-2')} ${item.unit}`,
                  fontSize: 10,
                },
                { text: `${angka(item.price, '1.0-0')}`, fontSize: 10 },
                { text: `${angka(item.discount, '1.0-0')}`, fontSize: 10 },
                {
                  text: `${angka(
                    item.price == 0 ? 0 : (item.discount * 100) / item.price,
                    '1.0-2',
                  )}%`,
                  fontSize: 10,
                },
                {
                  text: `${angka(this.totalBaris(item), '1.0-0')}`,
                  fontSize: 10,
                },
              ];
            }),
          ],
        },
      },
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 230,
            layout: tataBaris,
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: 'Subtotal', bold: true, fontSize: 10 },
                  { text: `${angka(this.subtotal, '1.0-0')}`, fontSize: 10 },
                ],
                [
                  { text: 'Discount', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.dokumen.discount, '1.0-0')}`,
                    fontSize: 10,
                  },
                ],
                [
                  { text: 'Service', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.dokumen.service, '1.0-0')}`,
                    fontSize: 10,
                  },
                ],
                [
                  { text: 'Delivery', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.dokumen.delivery, '1.0-0')}`,
                    fontSize: 10,
                  },
                ],
                [
                  { text: 'Total', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.grandTotal, '1.0-0')}`,
                    bold: true,
                    fontSize: 10,
                  },
                ],
              ],
            },
          },
        ],
        margin: [0, 0, 0, 24] as Margins,
      },
      {
        text: 'Payment Record',
        bold: true,
        fontSize: 14,
        margin: [0, 0, 0, 8] as Margins,
      },
      {
        layout: tataBaris,
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            [
              kepalaSel('Date'),
              kepalaSel('Payment Method'),
              kepalaSel('Amount'),
            ],
            ...(this.pembayaran.length == 0
              ? [
                  [
                    {
                      text: 'No payment',
                      colSpan: 3,
                      alignment: 'center',
                      fontSize: 10,
                    },
                    {},
                    {},
                  ],
                ]
              : this.pembayaran.map((item) => {
                  return [
                    {
                      text: this.datePipe.transform(item.date, 'dd MMMM yyyy'),
                      fontSize: 10,
                    },
                    {
                      text:
                        item.payment_method == null
                          ? 'Cash'
                          : item.payment_method.name,
                      fontSize: 10,
                    },
                    { text: `${angka(item.value, '1.0-0')}`, fontSize: 10 },
                  ];
                })),
          ],
        },
      },
    ];

    const documentDefinition = {
      pageOrientation: 'portrait' as PageOrientation,
      pageSize: 'A4' as PageSize,
      pageMargins: [36, 36, 36, 36] as Margins,
      watermark: {
        text: 'DRAFT',
        color: 'black',
        opacity: 0.12,
        bold: true,
        italics: false,
      },
      info: {
        title: `${title} - Toko Profil Indah`,
        author: 'Toko Profil Indah',
        subject: title,
      },
      content: content,
      styles: {
        label: { fontSize: 9, color: '#666666' },
        value: { fontSize: 12 },
      },
    };

    /*
      Sel pertama tiap baris tabel barang berupa larik dua objek —
      reference di atas description — dan pdfmake memang menumpuk konten
      seperti itu; pemodelan tipenya saja yang tidak sanggup, jadi
      pemeriksaan tipe dilonggarkan di titik ini.
    */
    await this.pdfService.unduh(
      documentDefinition as TDocumentDefinitions,
      `${namaBerkasDokumen(this.dokumen?.name, fileName + new Date().getTime())}.pdf`,
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
