import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {
  Margins,
  PageOrientation,
  PageSize,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { PaymentListComponent } from 'src/app/components/payment-list/payment-list.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

// pdfmake 0.2.23 mengekspor objek vfs-nya langsung (module.exports = vfs).
// Sampai 0.2.10 yang diekspor masih pembungkus, sehingga jalur lamanya
// pdfFonts.pdfMake.vfs. Bentuk lama itu kini menghasilkan undefined, dan
// pembuatan PDF gagal saat dijalankan tanpa satu pun galat kompilasi —
// @types/pdfmake harus ikut disamakan versinya agar selisih itu terlihat.
pdfMake.vfs = pdfFonts;

@Component({
    selector: 'app-sales-invoice-view',
    templateUrl: './sales-invoice-view.component.html',
    styleUrls: ['./sales-invoice-view.component.css'],
    imports: [MatDialogTitle, CdkDrag, CdkDragHandle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatFormField, MatLabel, MatInput, MatButton, NgFor, MatTooltip, NgIf, MatIcon, MatDialogActions, MatDialogClose, DecimalPipe, DatePipe, TranslatePipe]
})
export class SalesInvoiceViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; noAction: boolean },
    private authService: AuthService,
    private dialog: MatDialog,
    private sheet: MatBottomSheet,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<SalesInvoiceViewComponent>,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private formBuilder: FormBuilder
  ) {}

  isAdministrator: boolean = false;
  isLoading: boolean = false;

  step = signal(0);

  salesInvoiceFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    sales: new FormControl(''),
    date: new FormControl('', Validators.required),
    customer: new FormControl(''),
    status: new FormControl(''),
    createdBy: new FormControl('', Validators.required),
    createdAt: new FormControl('', Validators.required),
    discount: new FormControl(0, Validators.required),
    service: new FormControl(0, Validators.required),
    delivery: new FormControl(0, Validators.required),
    sales_invoice: new FormArray([]),
    sales_invoice_payment: new FormArray([]),
    isDelete: new FormControl(false),
  });

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  openDeleteConfirmation() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'sales-invoice__archive__view__delete__title'
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === true) {
          this.apiService.delete(`sales-invoice/${this.data.id}`).subscribe({
            next: () => {
              this.alertService.showSuccess(
                this.translateService.instant('sales-invoice__delete__success')
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

  openPaymentModal() {
    this.sheet.open(PaymentListComponent, {
      data: {
        id: this.data.id,
      },
    });
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`sales-invoice/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          data.sales_invoice.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id],
                price: [x.price],
                quantity: [x.quantity],
                discount: [x.discount],
                product_id: [x.product_id],
                product_unit_id: [x.product_unit_id],
                reference: [x.product.reference],
                description: [x.product.description],
                unit: [
                  x.product_unit == null ? x.product.unit : x.product_unit.unit,
                ],
              })
            );
          });

          data.sales_invoice_payment.forEach((x: any) => {
            this.u.push(
              this.formBuilder.group({
                id: [x.id],
                date: [x.date],
                payment_method: [x.payment_method],
                value: [x.value],
              })
            );
          });

          this.salesInvoiceFormGroup.patchValue({
            date: this.datePipe.transform(data.date, 'dd MMMM YYYY'),
            name: data.name,
            sales: data.sales == null ? 'INTERNAL' : data.sales.toUpperCase(),
            customer: data.customer == null ? 'Retail' : data.customer.name,
            status: data.is_delete
              ? this.translateService.instant(
                  'sales-invoice__archive__view__status__deleted'
                )
              : data.is_confirm
              ? this.translateService.instant(
                  'sales-invoice__archive__view__status__confirmed'
                )
              : this.translateService.instant(
                  'sales-invoice__archive__view__status__pending'
                ),
            delivery: data.delivery,
            discount: data.discount,
            service: data.service,
            createdBy: data.user_bill_code_created_byTouser.name,
            createdAt: this.datePipe.transform(data.createdAt, 'dd MMMM YYYY HH:mm'),
            isDelete: data.isDelete,
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get f() {
    return this.salesInvoiceFormGroup.controls;
  }

  get t() {
    return this.f['sales_invoice'] as FormArray;
  }

  get u() {
    return this.f['sales_invoice_payment'] as FormArray;
  }

  get subtotal(): number {
    return this.t.value.reduce((a: any, b: any) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }

  get grandTotal(): number {
    const discount = Number(
      this.salesInvoiceFormGroup.controls['discount'].value
    );
    const service = Number(
      this.salesInvoiceFormGroup.controls['service'].value
    );
    const delivery = Number(
      this.salesInvoiceFormGroup.controls['delivery'].value
    );

    return this.subtotal + delivery + service - discount;
  }

  getDiscountPercentage(discount: number, price: number) {
    if (price == 0) {
      return '0%';
    } else {
      return `${this.decimalPipe.transform(
        (discount * 100) / price,
        '1.2-2'
      )}%`;
    }
  }

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
  }

  print() {
    const title = 'Sales Invoice';
    const fileName = 'Sales_invoice';
    const content = [
      {
        text: 'Sales invoice',
        bold: true,
        fontSize: 16,
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          widths: [100, '*', 100, '*'],
          body: [
            [
              {
                text: 'Date',
                bold: true,
                fontSize: 12,
              },
              {
                text: this.datePipe.transform(
                  this.salesInvoiceFormGroup.controls['date']?.value,
                  'dd MMM yyyy'
                ),
                bold: false,
                fontSize: 12,
              },
              {
                text: 'Name',
                bold: true,
                fontSize: 12,
              },
              {
                text: this.salesInvoiceFormGroup.controls['name']?.value,
                bold: false,
                fontSize: 12,
              },
            ],
            [
              {
                text: 'Status',
                bold: true,
                fontSize: 12,
              },
              {
                text: `${this.salesInvoiceFormGroup.controls['status']?.value}`,
                bold: false,
                fontSize: 12,
              },
              {
                text: 'Customer',
                bold: true,
                fontSize: 12,
              },
              {
                text: this.salesInvoiceFormGroup.controls['customer']?.value,
                bold: false,
                fontSize: 12,
              },
            ],
            [
              {
                text: 'Created by',
                bold: true,
                fontSize: 12,
              },
              {
                text: this.salesInvoiceFormGroup.controls['createdBy']?.value,
                bold: false,
                fontSize: 12,
              },
              {
                text: 'Created at',
                bold: true,
                fontSize: 12,
              },
              {
                text: this.salesInvoiceFormGroup.controls['createdAt']?.value,
                bold: false,
                fontSize: 12,
              },
            ],
          ],
        },
        margin: [0, 10, 0, 10] as Margins,
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              {
                text: 'Product',
                bold: true,
              },
              {
                text: 'Quantity',
                bold: true,
              },
              {
                text: 'Price',
                bold: true,
              },
              {
                text: 'Discount (Rp.)',
                bold: true,
              },
              {
                text: 'Discount (%)',
                bold: true,
              },
              {
                text: 'Total',
                bold: true,
              },
            ],
            ...this.t.controls.map((item: any) => {
              return [
                [
                  {
                    text: item.get('reference')?.value,
                    style: 'label',
                  },
                  {
                    text: item.get('description')?.value,
                    style: 'value',
                  },
                ],
                {
                  text: `${this.decimalPipe.transform(
                    item.get('quantity')?.value,
                    '1.0-2'
                  )} ${item.get('unit')?.value}`,
                },
                {
                  text: `${this.decimalPipe.transform(
                    item.get('price')?.value,
                    '1.2-2'
                  )}`,
                },
                {
                  text: `${this.decimalPipe.transform(
                    item.get('discount')?.value,
                    '1.2-2'
                  )}`,
                },
                {
                  text: `${this.decimalPipe.transform(
                    item.get('price')?.value == 0
                      ? 0
                      : (item.get('discount')?.value * 100) /
                          item.get('price')?.value,
                    '1.0-2'
                  )}%`,
                },
                {
                  text: `${this.decimalPipe.transform(
                    (item.get('price')?.value - item.get('discount')?.value) *
                      item.get('quantity')?.value,
                    '1.2-2'
                  )}`,
                },
              ];
            }),
            [
              '',
              '',
              '',
              '',
              {
                text: 'Subtotal',
                style: 'label',
                border: [true, true, true, true],
              },
              {
                text: `${this.decimalPipe.transform(this.subtotal, '1.2-2')}`,
                style: 'value',
              },
            ],
            [
              '',
              '',
              '',
              '',
              {
                text: 'Discount',
                style: 'label',
              },
              {
                text: `${this.decimalPipe.transform(
                  this.salesInvoiceFormGroup.get('discount')?.value,
                  '1.2-2'
                )}`,
                style: 'value',
              },
            ],
            [
              '',
              '',
              '',
              '',
              {
                text: 'Service',
                style: 'label',
              },
              {
                text: `${this.decimalPipe.transform(
                  this.salesInvoiceFormGroup.get('service')?.value,
                  '1.2-2'
                )}`,
                style: 'value',
              },
            ],
            [
              '',
              '',
              '',
              '',
              {
                text: 'Delivery',
                style: 'label',
              },
              {
                text: `${this.decimalPipe.transform(
                  this.salesInvoiceFormGroup.get('delivery')?.value,
                  '1.2-2'
                )}`,
                style: 'value',
              },
            ],
            [
              '',
              '',
              '',
              '',
              {
                text: 'Total',
                style: 'label',
              },
              {
                text: `${this.decimalPipe.transform(this.grandTotal, '1.2-2')}`,
                style: 'value',
              },
            ],
          ],
        },
        margin: [0, 0, 0, 10] as Margins,
      },
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            ['Date', 'Payment method', 'Amount'],
            ...(this.u.controls.length == 0
              ? [
                  [
                    {
                      text: 'No payment',
                      colSpan: 3,
                      alignment: 'center',
                    },
                    {},
                    {},
                  ],
                ]
              : [
                  ...this.u.controls.map((item: any) => {
                    return [
                      this.datePipe.transform(
                        item.get('date')?.value,
                        'dd MMMM yyyy'
                      ),
                      item.get('payment_method')?.value == null
                        ? 'Cash'
                        : item.get('payment_method')?.value.name,
                      `${this.decimalPipe.transform(
                        item.get('value')?.value,
                        '1.2-2'
                      )}`,
                    ];
                  }),
                ]),
          ],
        },
      },
    ];

    const documentDefinition = {
      pageOrientation: 'portrait' as PageOrientation,
      pageSize: 'A4' as PageSize,
      pageMargins: 15,
      watermark: {
        text: 'DRAFT',
        color: 'black',
        opacity: 0.15,
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
        label: {
          fontSize: 10,
          bold: true,
        },
        value: {
          fontSize: 12,
          bold: false,
        },
      },
    };

    /*
      Sel pertama tiap baris tabel barang sengaja berupa LARIK dua objek —
      reference di atas description — dan pdfmake memang menumpuk konten
      seperti itu. Yang tidak sanggup adalah pemodelan tipenya: TableCell
      tidak menyatu dengan Content bersarang pada kedalaman ini, sehingga
      createPdf menolaknya sejak @types/pdfmake disamakan dengan runtime
      0.2.23. Yang dilonggarkan hanya pemeriksaan tipe di titik ini; struktur
      dokumennya tidak diubah sedikit pun, karena keluarannya sudah benar.
    */
    pdfMake
      .createPdf(documentDefinition as TDocumentDefinitions)
      .download(`${fileName}${new Date().getTime()}.pdf`);
  }
}
