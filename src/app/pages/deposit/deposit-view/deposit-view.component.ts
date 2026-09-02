import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Margins,
  PageOrientation,
  PageSize,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { namaBerkasDokumen } from 'src/app/utils/file-name.utils';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { SERVICE_TYPES } from 'src/app/constants/service-type.constant';
import { PdfService } from 'src/app/services/pdf.service';
import { DepositDeleteConfirmationComponent } from '../deposit-delete-confirmation/deposit-delete-confirmation.component';

/**
 * Tampilan BACA sebuah deposit — dokumen, bukan formulir accordion
 * berbaju kolom input. Kontraknya tidak berubah: dibuka dengan
 * {id, noAction, print}, menutup 'reject' setelah pembatalan, dan
 * tombol eksekusi tetap mengantar ke halaman konfirmasi deposit.
 *
 * Cetakannya mengikuti format rancangan desainer toko — sama dengan
 * faktur penjualan, berjudul Sales Deposit.
 */
@Component({
  selector: 'app-deposit-view',
  templateUrl: './deposit-view.component.html',
  styleUrls: ['./deposit-view.component.scss'],
  providers: [DatePipe, DecimalPipe],
  imports: [NgIf, NgFor, DecimalPipe, DatePipe, TranslatePipe],
})
export class DepositViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { id: number; noAction: boolean; print: boolean },
    private apiService: ApiService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogRef: MatDialogRef<DepositViewComponent>,
    private pdfService: PdfService,
  ) {}

  isLoading = true;

  dokumen: any = null;
  barang: any[] = [];
  pembayaran: any[] = [];

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID(): void {
    this.apiService
      .get(`sales-deposit/${this.data.id}`, {})
      .subscribe({
        next: (data: any) => {
          this.dokumen = {
            name: data.name,
            date: data.date,
            customer: data.customer == null ? null : data.customer.name,
            sales: data.sales == null ? 'INTERNAL' : data.sales.toUpperCase(),
            isDelete: data.isDelete,
            discount: Number(data.discount),
            service: Number(data.service),
            delivery: Number(data.delivery),
            /*
              adminFee dan serviceType dulu tidak ikut dipetakan. Karena
              `dokumen` bertipe any, tidak ada yang menangkapnya saat
              kompilasi — dan akibatnya bukan cuma barisnya hilang di layar:
              grandTotal memakai `?? 0`, jadi total yang tercetak KURANG
              sebesar biaya admin yang sudah ditagihkan ke pelanggan.
            */
            adminFee: Number(data.adminFee ?? 0),
            serviceType: data.serviceType ?? null,
            createdBy: data.user_bill_code_created_byTouser.name,
            createdAt: data.createdAt,
          };

          this.barang = (data.sales_deposit ?? []).map((x: any) => ({
            reference: x.product.reference,
            description: x.product.description,
            quantity: Number(x.quantity),
            unit: x.product_unit == null ? x.product.unit : x.product_unit.unit,
            price: Number(x.price),
            discount: Number(x.discount),
          }));

          this.pembayaran = (data.sales_deposit_payment ?? []).map(
            (x: any) => ({
              date: x.date,
              payment_method:
                x.payment_method == null ? 'Cash' : x.payment_method.name,
              value: Number(x.value),
            }),
          );
        },
        error: (error) => {
          this.alertService.showError(Error(error));
          this.dialogRef.close();
        },
      })
      .add(() => {
        this.isLoading = false;
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
    return this.dokumen?.isDelete
      ? 'sales-deposit__archive__view__deleted'
      : 'sales-deposit__archive__view__pending';
  }

  get subtotal(): number {
    return this.barang.reduce(
      (a, b) => a + b.quantity * (b.price - b.discount),
      0,
    );
  }

  /**
   * Label jenis jasa yang ditagih (CNC / Frame / Solid), atau null bila
   * dokumennya tidak menagih jasa sama sekali.
   *
   * Dicocokkan lewat daftar, bukan dirangkai `'service-type__' + nilai`:
   * nilai yang tidak dikenal akan menghasilkan kunci mentah yang tergambar
   * apa adanya di layar dan di kertas.
   */
  get labelJenisJasa(): string | null {
    const jenis = this.dokumen?.serviceType;
    if (!jenis) {
      return null;
    }
    const cocok = SERVICE_TYPES.find((x) => x.value === jenis);
    return cocok ? this.translateService.instant(cocok.label) : null;
  }

  get grandTotal(): number {
    return (
      this.subtotal +
      this.dokumen.delivery +
      this.dokumen.service +
      /* Biaya admin ditagihkan ke pelanggan, jadi ia bagian dari yang harus
         dibayar — server menghitungnya begitu, dan layar harus sepakat. */
      Number(this.dokumen.adminFee ?? 0) -
      this.dokumen.discount
    );
  }

  totalBaris(b: any): number {
    return b.quantity * (b.price - b.discount);
  }

  /* ---------------------------------------------------------------- */
  /* Aksi                                                              */
  /* ---------------------------------------------------------------- */

  tutup(): void {
    this.dialogRef.close();
  }

  /** Eksekusi deposit menjadi faktur — jalan ke halaman konfirmasinya. */
  confirm(): void {
    const url = this.router.url.split('/');
    url.pop();

    this.dialogRef.close();

    setTimeout(() => {
      this.router.navigate(
        [url.join('/'), 'Deposit', 'Confirm', this.data.id],
        {
          relativeTo: this.activatedRoute,
        },
      );
    }, 300);
  }

  delete(): void {
    this.dialog
      .open(DepositDeleteConfirmationComponent, {
        data: {
          id: this.data.id,
          /*
            Yang menentukan perlu-tidaknya pertanyaan pengembalian adalah ADA
            TIDAKNYA uang yang masuk, bukan tipe dokumennya. Deposit internal
            memang tidak pernah punya pembayaran, tetapi deposit eksternal
            yang belum dibayar sepeser pun juga tidak punya apa-apa untuk
            dikembalikan — dan menanyakannya pada keduanya sama tidak
            masuk akalnya.
          */
          adaPembayaran: this.pembayaran.length > 0,
        },
        disableClose: true,
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == 'reject') {
          this.dialogRef.close('reject');
        }
      });
  }

  /* ---------------------------------------------------------------- */
  /* Cetak — format rancangan desainer toko                            */
  /* ---------------------------------------------------------------- */

  async print(): Promise<void> {
    const title = 'Sales Deposit';
    const fileName = 'Sales_deposit';
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
                { text: `${angka(item.price, '1.2-2')}`, fontSize: 10 },
                { text: `${angka(item.discount, '1.2-2')}`, fontSize: 10 },
                {
                  text: `${angka(
                    item.price == 0 ? 0 : (item.discount * 100) / item.price,
                    '1.0-2',
                  )}%`,
                  fontSize: 10,
                },
                {
                  text: `${angka(this.totalBaris(item), '1.2-2')}`,
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
                  { text: `${angka(this.subtotal, '1.2-2')}`, fontSize: 10 },
                ],
                [
                  { text: 'Discount', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.dokumen.discount, '1.2-2')}`,
                    fontSize: 10,
                  },
                ],
                [
                  /* Jenis jasanya ikut tercetak. Tanpa itu kertas yang
                     dipegang pelanggan menyebut "Service" tanpa mengatakan
                     jasa apa yang dikerjakan. */
                  {
                    text: this.labelJenisJasa
                      ? `Service (${this.labelJenisJasa})`
                      : 'Service',
                    bold: true,
                    fontSize: 10,
                  },
                  {
                    text: `${angka(this.dokumen.service, '1.2-2')}`,
                    fontSize: 10,
                  },
                ],
                [
                  { text: 'Delivery', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.dokumen.delivery, '1.2-2')}`,
                    fontSize: 10,
                  },
                ],
                [
                  { text: 'Admin fee', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.dokumen.adminFee ?? 0, '1.2-2')}`,
                    fontSize: 10,
                  },
                ],
                [
                  { text: 'Total', bold: true, fontSize: 10 },
                  {
                    text: `${angka(this.grandTotal, '1.2-2')}`,
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
                    { text: item.payment_method, fontSize: 10 },
                    { text: `${angka(item.value, '1.2-2')}`, fontSize: 10 },
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
      /*
        COPY, bukan DRAFT. Dokumen yang dicetak dari sini sudah terbit dan
        sah — "draft" menyiratkan belum jadi, dan pelanggan yang menerimanya
        wajar ragu apakah angkanya final. Yang benar disampaikan cap ini
        adalah bahwa lembar itu salinan, bukan aslinya.
      */
      watermark: {
        text: 'COPY',
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

    /* Sel pertama baris barang berupa larik dua objek; pemodelan tipe
       pdfmake tidak sanggup, jadi pemeriksaan tipe dilonggarkan di sini. */
    await this.pdfService.unduh(
      documentDefinition as TDocumentDefinitions,
      `${namaBerkasDokumen(this.dokumen?.name, fileName + new Date().getTime())}.pdf`,
    );
  }
}
