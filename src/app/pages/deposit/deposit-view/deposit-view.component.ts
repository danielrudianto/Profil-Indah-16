import { Component, Inject, Input, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe, DecimalPipe, NgIf, NgFor } from '@angular/common';
import { Margins, PageOrientation, PageSize } from 'pdfmake/interfaces';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DepositDeleteConfirmationComponent } from '../deposit-delete-confirmation/deposit-delete-confirmation.component';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
// pdfmake 0.2.23 mengekspor objek vfs-nya langsung (module.exports = vfs).
// Sampai 0.2.10 yang diekspor masih pembungkus, sehingga jalur lamanya
// pdfFonts.pdfMake.vfs. Bentuk lama itu kini menghasilkan undefined, dan
// pembuatan PDF gagal saat dijalankan tanpa satu pun galat kompilasi —
// @types/pdfmake harus ikut disamakan versinya agar selisih itu terlihat.
pdfMake.vfs = pdfFonts;

@Component({
    selector: 'app-deposit-view',
    templateUrl: './deposit-view.component.html',
    styleUrls: ['./deposit-view.component.scss'],
    animations: [panelAnimation],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, NgIf, MatProgressSpinner, FormsModule, ReactiveFormsModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatFormField, MatLabel, MatInput, MatButton, NgFor, MatTooltip, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, MatDialogActions, MatDialogClose, DecimalPipe, DatePipe, TranslatePipe]
})
export class DepositViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { id: number; noAction: boolean; print: boolean },
    private apiService: ApiService,
    private dialog: MatDialog,
    private _hotKeysService: HotkeysService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogRef: MatDialogRef<DepositViewComponent>,
    private formBuilder: FormBuilder
  ) {
    this._hotKeysService.add([
      new Hotkey('p', (event: KeyboardEvent): boolean => {
        // this.print();
        return false;
      }),
    ]);
  }

  step = signal(0);
  isAdministrator: boolean = true;
  isSubmitting: boolean = false;

  salesDepositFormGroup: FormGroup = new FormGroup({
    date: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    customer: new FormControl('', Validators.required),
    sales: new FormControl('', Validators.required),
    value: new FormControl('', Validators.required),
    discount: new FormControl(0, Validators.required),
    service: new FormControl(0, Validators.required),
    delivery: new FormControl(0, Validators.required),
    status: new FormControl('', Validators.required),
    createdBy: new FormControl('', Validators.required),
    createdAt: new FormControl('', Validators.required),
    sales_deposit: new FormArray([]),
    sales_deposit_payment: new FormArray([]),
  });

  get f() {
    return this.salesDepositFormGroup.controls;
  }

  get t(): FormArray {
    return this.f['sales_deposit'] as FormArray;
  }

  get u(): FormArray {
    return this.f['sales_deposit_payment'] as FormArray;
  }

  isLoading: boolean = true;
  dataSource: any = null;

  ngOnInit(): void {
    this.fetchByID();
  }

  get payment(): number {
    if (this.dataSource == null) return 0;

    return this.dataSource.sales_deposit.reduce((a: any, b: any) => {
      return a + (b.price - b.discount) * b.quantity;
    }, 0);
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

  confirm(): void {
    this.isSubmitting = true;
    const url = this.router.url.split('/');
    url.pop();

    this.dialogRef.close();

    setTimeout(() => {
      this.router.navigate(
        [url.join('/'), 'Deposit', 'Confirm', this.data.id],
        {
          relativeTo: this.activatedRoute,
        }
      );
    }, 300);
  }

  delete(): void {
    this.dialog
      .open(DepositDeleteConfirmationComponent, {
        data: {
          id: this.data.id,
        },
        disableClose: true,
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == 'reject') {
          this.dialogRef.close('reject');
        }
      });
  }

  fetchByID(): void {
    this.apiService
      .get(`sales-deposit/${this.data.id}`, {})
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
          this.salesDepositFormGroup.patchValue({
            name: data.name,
            date: this.datePipe.transform(data.date, 'dd MMMM YYYY'),
            createdBy: data.user_bill_code_created_byTouser.name,
            createdAt: this.datePipe.transform(data.createdAt, 'dd MMMM YYYY'),
            customer: data.customer == null ? 'Retail' : data.customer.name,
            sales: data.sales == null ? 'Internal' : data.sales,
            value: data.sales_deposit.reduce((a: any, b: any) => {
              return a + (b.price - b.discount) * b.quantity;
            }, 0),
            delivery: data.delivery,
            discount: data.discount,
            service: data.service,
            status: data.isDelete
              ? this.translateService.instant(
                  'sales-deposit__archive__view__deleted'
                )
              : this.translateService.instant(
                  'sales-deposit__archive__view__pending'
                ),
          });

          data.sales_deposit.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                product_id: [x.product.id],
                product_unit_id: [x.product_unit_id],
                reference: [x.product.reference],
                description: [x.product.description],
                price: [x.price],
                discount: [x.discount],
                unit: [
                  x.product_unit == null ? x.product.unit : x.product_unit.unit,
                ],
                conversion: [
                  x.product_unit == null ? 1 : x.product_unit.conversion,
                ],
                quantity: [x.quantity],
              })
            );
          });

          data.sales_deposit_payment.forEach((x: any) => {
            this.u.push(
              this.formBuilder.group({
                date: [x.date],
                payment_method: [
                  x.payment_method == null ? 'Cash' : x.payment_method.name,
                ],
                value: [x.value],
              })
            );
          });
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

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
  }

  setStep(index: number) {
    this.step.set(index);
  }

  get subtotal(): number {
    return this.t.value.reduce((a: any, b: any) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }

  get total(): number {
    return (
      this.subtotal +
      this.salesDepositFormGroup.get('delivery')?.value +
      this.salesDepositFormGroup.get('service')?.value -
      this.salesDepositFormGroup.get('discount')?.value
    );
  }

  print() {
    const title = 'Sales deposit';
    const filename = 'Sales_deposit';
    const content: any[] = [
      {
        text: 'Sales deposit',
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
                  this.salesDepositFormGroup.controls['date']?.value,
                  'dd MMMM yyyy'
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
                text: this.salesDepositFormGroup.controls['name']?.value,
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
                text: `${this.salesDepositFormGroup.controls['status']?.value}`,
                bold: false,
                fontSize: 12,
              },
              {
                text: 'Customer',
                bold: true,
                fontSize: 12,
              },
              {
                text: this.salesDepositFormGroup.controls['customer']?.value,
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
                text: this.salesDepositFormGroup.controls['createdBy']?.value,
                bold: false,
                fontSize: 12,
              },
              {
                text: 'Created at',
                bold: true,
                fontSize: 12,
              },
              {
                text: this.salesDepositFormGroup.controls['createdAt']?.value,
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
                  this.salesDepositFormGroup.get('discount')?.value,
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
                  this.salesDepositFormGroup.get('service')?.value,
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
                  this.salesDepositFormGroup.get('delivery')?.value,
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
                text: `${this.decimalPipe.transform(this.total, '1.2-2')}`,
                style: 'value',
              },
            ],
          ],
        },
        margin: [0, 0, 0, 10] as Margins,
      },
      {
        // Create table for payments
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
                      item.get('payment_method')?.value,
                      `Rp.${this.decimalPipe.transform(
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
        opacity: 0.3,
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

    pdfMake
      .createPdf(documentDefinition)
      .download(`${filename}${new Date().getTime()}.pdf`);
  }
}
