import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Margins, PageOrientation, PageSize } from 'pdfmake/interfaces';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-archive-view',
    templateUrl: './archive-view.component.html',
    styleUrls: ['./archive-view.component.css'],
    animations: [panelAnimation],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ArchiveViewComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private apiService: ApiService,
    private alertService: AlertService,
    private decimalPipe: DecimalPipe,
    private datePipe: DatePipe
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (event: KeyboardEvent): boolean => {
        this.close();
        return false; // Prevent bubbling
      }),
      new Hotkey('f', (event: KeyboardEvent): boolean => {
        this.enlarge();
        return false;
      }),
      new Hotkey('p', (event: KeyboardEvent): boolean => {
        this.print();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  panelState: string = 'closed';
  isLoading: boolean = true;
  dataSource: any = null;

  ngOnInit(): void {
    this.panelState = 'opened';
    this.fetchByID();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`${this.data.route}/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.dataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  close() {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  enlarge() {
    if (this.panelState == 'opened') {
      this.panelState = 'enlarged';
    } else if (this.panelState == 'enlarged') {
      this.panelState = 'opened';
    }
  }

  print() {
    let title = '';
    let fileName = '';
    let content: any[] = [];
    switch (this.data.route) {
      case 'sales-invoice':
        title = 'Sales Invoice';
        fileName = 'Sales_invoice';
        content = [
          {
            width: '*',
            columns: [
              [
                {
                  text: 'Date',
                  style: 'label',
                },
                {
                  text: this.datePipe.transform(
                    this.dataSource.date,
                    'dd MMM yyyy'
                  ),
                  style: 'value',
                  margin: [0, 0, 0, 10] as Margins,
                },
                {
                  text: 'Name',
                  style: 'label',
                },
                {
                  text: this.dataSource.name || '',
                  style: 'value',
                  margin: [0, 0, 0, 10] as Margins,
                },
                {
                  text: 'Status',
                  style: 'label',
                },
                {
                  text: `${
                    this.dataSource.is_delete
                      ? 'Deleted'
                      : this.dataSource.is_confirm
                      ? 'Confirmed'
                      : 'Waiting for confirmation'
                  }`,
                  style: 'value',
                  margin: [0, 0, 0, 10] as Margins,
                },
                {
                  text: 'Customer',
                  style: 'label',
                },
                {
                  text:
                    this.dataSource.customer == null
                      ? 'Retail customer'
                      : this.dataSource.customer.name || '',
                  style: 'value',
                  margin: [0, 0, 0, 10] as Margins,
                },
                // Divider
                {
                  text: 'Created by',
                  style: 'label',
                },
                {
                  text:
                    this.dataSource.user_bill_code_created_byTouser.name || '',
                  style: 'value',
                  margin: [0, 0, 0, 10] as Margins,
                },
                {
                  text: 'Created at',
                  style: 'label',
                },
                {
                  text: this.datePipe.transform(
                    this.dataSource.created_at,
                    'dd MMM yyyy HH:mm'
                  ),
                  margin: [0, 0, 0, 10] as Margins,
                },
              ],
              {
                qr: this.dataSource.name,
                fit: '50',
                alignment: 'right',
              },
            ],
          },
          {
            layout: 'lightHorizontalLines',
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  'Item',
                  'Quantity',
                  'Price',
                  'Discount (Rp.)',
                  'Discount (%)',
                  'Total',
                ],
                ...this.dataSource.bill.map((item: any) => {
                  if (item.package_code != null) {
                    return [
                      [
                        {
                          text: item.package_code.name,
                          style: 'value',
                        },
                        {
                          text: item.package_code.description,
                          style: 'value',
                        },
                        {
                          ol: item.package_code.package_content.map(
                            (content: any) => {
                              return [
                                {
                                  text: content.item.reference,
                                  style: 'value',
                                },
                                {
                                  text: content.item.description,
                                  style: 'value',
                                },
                              ];
                            }
                          ),
                        },
                      ],
                      {
                        text: `${this.decimalPipe.transform(
                          item.quantity,
                          '1.0-2'
                        )}`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          item.price,
                          '1.2-2'
                        )}`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          item.discount,
                          '1.2-2'
                        )}`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          item.price == 0
                            ? 0
                            : (item.discount * 100) / item.price,
                          '1.0-2'
                        )}%`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          (item.price - item.discount) * item.quantity,
                          '1.2-2'
                        )}`,
                      },
                    ];
                  } else {
                    return [
                      [
                        {
                          text: item.item.reference,
                          style: 'label',
                        },
                        {
                          text: item.item.description,
                          style: 'value',
                        },
                      ],
                      {
                        text: `${this.decimalPipe.transform(
                          item.quantity,
                          '1.0-2'
                        )} ${
                          item.item_unit == null
                            ? item.item.unit
                            : item.item_unit.unit
                        }`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          item.price,
                          '1.2-2'
                        )}`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          item.discount,
                          '1.2-2'
                        )}`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          item.price == 0
                            ? 0
                            : (item.discount * 100) / item.price,
                          '1.0-2'
                        )}%`,
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          (item.price - item.discount) * item.quantity,
                          '1.2-2'
                        )}`,
                      },
                    ];
                  }
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
                    text: `${this.decimalPipe.transform(
                      this.dataSource.subTotal,
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
                    text: 'Discount',
                    style: 'label',
                  },
                  {
                    text: `${this.decimalPipe.transform(
                      this.dataSource.discount,
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
                      this.dataSource.service,
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
                      this.dataSource.delivery,
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
                    text: `${this.decimalPipe.transform(
                      this.dataSource.subTotal -
                        this.dataSource.discount +
                        this.dataSource.service +
                        this.dataSource.delivery,
                      '1.2-2'
                    )}`,
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
                ...(this.dataSource.bill_payment.length == 0
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
                      ...this.dataSource.bill_payment.map((item: any) => {
                        return [
                          this.datePipe.transform(item.date, 'dd MMM yyyy'),
                          item.payment_method == null
                            ? 'Cash'
                            : item.payment_method.name,
                          `${this.decimalPipe.transform(item.value, '1.2-2')}`,
                        ];
                      }),
                    ]),
              ],
            },
          },
        ];
        break;
    }

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
      .download(`${fileName}${new Date().getTime()}.pdf`);
  }
}
