import { Component, Inject, Input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Margins, PageOrientation, PageSize } from 'pdfmake/interfaces';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-deposit-view',
  templateUrl: './deposit-view.component.html',
  styleUrls: ['./deposit-view.component.css'],
  animations: [panelAnimation],
})
export class DepositViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private _hotKeysService: HotkeysService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialogRef: MatDialogRef<DepositViewComponent>
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (event: KeyboardEvent): boolean => {
        // this.close();
        return false;
      }),
      new Hotkey('f', (event: KeyboardEvent): boolean => {
        // this.enlarge();
        return false;
      }),
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
  });

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

  // confirmDeposit(): void {
  //   this.close();
  //   const url = this.router.url.split('/');
  //   url.pop();

  //   setTimeout(() => {
  //     this.router.navigate(
  //       [url.join('/'), 'Deposit', 'Confirm', this.data.id],
  //       {
  //         relativeTo: this.activatedRoute,
  //       }
  //     );
  //   }, 300);
  // }

  // deleteDeposit(): void {
  //   this.dialog
  //     .open(DeleteConfirmationComponent, {
  //       data: {
  //         title: this.translateService.instant('deposit__delete__title'),
  //         document: `${this.dataSource.name}`,
  //       },
  //     })
  //     .afterClosed()
  //     .subscribe((data) => {
  //       if (data == true) {
  //         this.apiService.delete(`sales-deposit/${this.data.id}`).subscribe({
  //           next: () => {
  //             this.alertService.showSuccess(
  //               this.translateService.instant('deposit__delete__success')
  //             );
  //             this.close();
  //           },
  //           error: (error) => {
  //             this.alertService.showError(Error(error));
  //           },
  //         });
  //       }
  //     });
  // }

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
        },
        error: (error) => {
          this.alertService.showError(Error(error));
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
    return 0;
  }

  // print() {
  //   const title = 'Sales deposit';
  //   const filename = 'Sales_deposit';
  //   const content: any[] = [
  //     {
  //       width: '*',
  //       columns: [
  //         [
  //           {
  //             text: 'Date',
  //             style: 'label',
  //           },
  //           {
  //             text: this.datePipe.transform(
  //               this.dataSource.date,
  //               'dd MMM yyyy'
  //             ),
  //             style: 'value',
  //             margin: [0, 0, 0, 10] as Margins,
  //           },
  //           {
  //             text: 'Name',
  //             style: 'label',
  //           },
  //           {
  //             text: this.dataSource.name || '',
  //             style: 'value',
  //             margin: [0, 0, 0, 10] as Margins,
  //           },
  //           {
  //             text: 'Status',
  //             style: 'label',
  //           },
  //           {
  //             text: `${
  //               this.dataSource.is_delete
  //                 ? 'Deleted'
  //                 : this.dataSource.is_confirm
  //                 ? 'Confirmed'
  //                 : 'Waiting for confirmation'
  //             }`,
  //             style: 'value',
  //             margin: [0, 0, 0, 10] as Margins,
  //           },
  //           {
  //             text: 'Sales',
  //             style: 'label',
  //           },
  //           {
  //             text:
  //               this.dataSource.sales == null
  //                 ? 'INTERNAL'
  //                 : this.dataSource.sales,
  //             style: 'value',
  //             margin: [0, 0, 0, 10] as Margins,
  //           },
  //           {
  //             text: 'Customer',
  //             style: 'label',
  //           },
  //           {
  //             text:
  //               this.dataSource.customer == null
  //                 ? 'Retail customer'
  //                 : this.dataSource.customer.name || '',
  //             style: 'value',
  //             margin: [0, 0, 0, 10] as Margins,
  //           },
  //           {
  //             text: 'Created by',
  //             style: 'label',
  //           },
  //           {
  //             text: this.dataSource.user_bill_code_created_byTouser.name || '',
  //             style: 'value',
  //             margin: [0, 0, 0, 10] as Margins,
  //           },
  //           {
  //             text: 'Created at',
  //             style: 'label',
  //           },
  //           {
  //             text: this.datePipe.transform(
  //               this.dataSource.created_at,
  //               'dd MMM yyyy HH:mm'
  //             ),
  //             margin: [0, 0, 0, 10] as Margins,
  //           },
  //         ],
  //         {
  //           qr: this.dataSource.name,
  //           fit: '50',
  //           alignment: 'right',
  //         },
  //       ],
  //     },
  //     {
  //       layout: 'lightHorizontalLines',
  //       table: {
  //         headerRows: 1,
  //         widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
  //         body: [
  //           [
  //             'Item',
  //             'Quantity',
  //             'Price',
  //             'Discount (Rp.)',
  //             'Discount (%)',
  //             'Total',
  //           ],
  //           ...this.dataSource.deposit.map((item: any) => {
  //             if (item.package_code != null) {
  //               return [
  //                 [
  //                   {
  //                     text: item.package_code.name,
  //                     style: 'value',
  //                   },
  //                   {
  //                     text: item.package_code.description,
  //                     style: 'value',
  //                   },
  //                   {
  //                     ol: item.package_code.package_content.map(
  //                       (content: any) => {
  //                         return [
  //                           {
  //                             text: content.item.reference,
  //                             style: 'value',
  //                           },
  //                           {
  //                             text: content.item.description,
  //                             style: 'value',
  //                           },
  //                         ];
  //                       }
  //                     ),
  //                   },
  //                 ],
  //                 {
  //                   text: `${this.decimalPipe.transform(
  //                     item.quantity,
  //                     '1.0-2'
  //                   )}`,
  //                 },
  //                 {
  //                   text: `Rp.${this.decimalPipe.transform(
  //                     item.price,
  //                     '1.2-2'
  //                   )}`,
  //                 },
  //                 {
  //                   text: `Rp.${this.decimalPipe.transform(
  //                     item.discount,
  //                     '1.2-2'
  //                   )}`,
  //                 },
  //                 {
  //                   text: `${this.decimalPipe.transform(
  //                     item.price == 0 ? 0 : (item.discount * 100) / item.price,
  //                     '1.0-2'
  //                   )}%`,
  //                 },
  //                 {
  //                   text: `Rp.${this.decimalPipe.transform(
  //                     (item.price - item.discount) * item.quantity,
  //                     '1.2-2'
  //                   )}`,
  //                 },
  //               ];
  //             } else {
  //               return [
  //                 [
  //                   {
  //                     text: item.item.reference,
  //                     style: 'label',
  //                   },
  //                   {
  //                     text: item.item.description,
  //                     style: 'value',
  //                   },
  //                 ],
  //                 {
  //                   text: `${this.decimalPipe.transform(
  //                     item.quantity,
  //                     '1.0-2'
  //                   )} ${
  //                     item.item_unit == null
  //                       ? item.item.unit
  //                       : item.item_unit.unit
  //                   }`,
  //                 },
  //                 {
  //                   text: `Rp.${this.decimalPipe.transform(
  //                     item.price,
  //                     '1.2-2'
  //                   )}`,
  //                 },
  //                 {
  //                   text: `Rp.${this.decimalPipe.transform(
  //                     item.discount,
  //                     '1.2-2'
  //                   )}`,
  //                 },
  //                 {
  //                   text: `${this.decimalPipe.transform(
  //                     item.price == 0 ? 0 : (item.discount * 100) / item.price,
  //                     '1.0-2'
  //                   )}%`,
  //                 },
  //                 {
  //                   text: `Rp.${this.decimalPipe.transform(
  //                     (item.price - item.discount) * item.quantity,
  //                     '1.2-2'
  //                   )}`,
  //                 },
  //               ];
  //             }
  //           }),
  //           [
  //             '',
  //             '',
  //             '',
  //             '',
  //             {
  //               text: 'Subtotal',
  //               style: 'label',
  //               border: [true, true, true, true],
  //             },
  //             {
  //               text: `Rp.${this.decimalPipe.transform(
  //                 this.dataSource.subTotal,
  //                 '1.2-2'
  //               )}`,
  //               style: 'value',
  //             },
  //           ],
  //           [
  //             '',
  //             '',
  //             '',
  //             '',
  //             {
  //               text: 'Discount',
  //               style: 'label',
  //             },
  //             {
  //               text: `Rp.${this.decimalPipe.transform(
  //                 this.dataSource.discount,
  //                 '1.2-2'
  //               )}`,
  //               style: 'value',
  //             },
  //           ],
  //           [
  //             '',
  //             '',
  //             '',
  //             '',
  //             {
  //               text: 'Service',
  //               style: 'label',
  //             },
  //             {
  //               text: `Rp.${this.decimalPipe.transform(
  //                 this.dataSource.service,
  //                 '1.2-2'
  //               )}`,
  //               style: 'value',
  //             },
  //           ],
  //           [
  //             '',
  //             '',
  //             '',
  //             '',
  //             {
  //               text: 'Delivery',
  //               style: 'label',
  //             },
  //             {
  //               text: `Rp.${this.decimalPipe.transform(
  //                 this.dataSource.delivery,
  //                 '1.2-2'
  //               )}`,
  //               style: 'value',
  //             },
  //           ],
  //           [
  //             '',
  //             '',
  //             '',
  //             '',
  //             {
  //               text: 'Total',
  //               style: 'label',
  //             },
  //             {
  //               text: `Rp.${this.decimalPipe.transform(
  //                 this.dataSource.subTotal -
  //                   this.dataSource.discount +
  //                   this.dataSource.service +
  //                   this.dataSource.delivery,
  //                 '1.2-2'
  //               )}`,
  //               style: 'value',
  //             },
  //           ],
  //         ],
  //       },
  //       margin: [0, 0, 0, 10] as Margins,
  //     },
  //     {
  //       // Create table for payments
  //       layout: 'lightHorizontalLines',
  //       table: {
  //         headerRows: 1,
  //         widths: ['*', '*', '*'],
  //         body: [
  //           ['Date', 'Payment method', 'Amount'],
  //           ...(this.dataSource.deposit_payment.length == 0
  //             ? [
  //                 [
  //                   {
  //                     text: 'No payment',
  //                     colSpan: 3,
  //                     alignment: 'center',
  //                   },
  //                   {},
  //                   {},
  //                 ],
  //               ]
  //             : [
  //                 ...this.dataSource.deposit_payment.map((item: any) => {
  //                   return [
  //                     this.datePipe.transform(item.date, 'dd MMM yyyy'),
  //                     item.payment_method == null
  //                       ? 'Cash'
  //                       : item.payment_method.name,
  //                     `Rp.${this.decimalPipe.transform(item.value, '1.2-2')}`,
  //                   ];
  //                 }),
  //               ]),
  //         ],
  //       },
  //     },
  //   ];

  //   const documentDefinition = {
  //     pageOrientation: 'portrait' as PageOrientation,
  //     pageSize: 'A4' as PageSize,
  //     pageMargins: 15,
  //     watermark: {
  //       text: 'DRAFT',
  //       color: 'black',
  //       opacity: 0.3,
  //       bold: true,
  //       italics: false,
  //     },
  //     info: {
  //       title: `${title} - Toko Profil Indah`,
  //       author: 'Toko Profil Indah',
  //       subject: title,
  //     },
  //     content: content,
  //     styles: {
  //       label: {
  //         fontSize: 10,
  //         bold: true,
  //       },
  //       value: {
  //         fontSize: 12,
  //         bold: false,
  //       },
  //     },
  //   };

  //   pdfMake
  //     .createPdf(documentDefinition)
  //     .download(`${filename}${new Date().getTime()}.pdf`);
  // }
}
