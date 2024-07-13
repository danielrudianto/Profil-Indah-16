import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  PageBreak,
  PageOrientation,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import {
  Alignment,
  CanvasRect,
  Margins,
  PageSize,
  Table,
  TableLayout,
} from 'pdfmake/interfaces';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-report-finance',
  templateUrl: './report-finance.component.html',
  styleUrls: ['./report-finance.component.css'],
})
export class ReportFinanceComponent {
  constructor(
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private _hotKeysService: HotkeysService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  isOpened: boolean = false;
  isLoading: boolean = true;
  value: number = 0;
  company: any[] = [];
  isDownloading: boolean = false;
  financeReportFormGroup: FormGroup = new FormGroup({
    type: new FormControl('', Validators.required),
    month: new FormControl('', Validators.required),
    year: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.isOpened = true;
  }

  get currentYear(): number[] {
    return Array.from(
      { length: new Date().getFullYear() - 2022 },
      (_, i) => new Date().getFullYear() - i
    );
  }

  downloadReport() {
    this.isDownloading = true;
    this.apiService
      .get(
        `report/profitloss/${this.financeReportFormGroup.value.month}/${this.financeReportFormGroup.value.year}/${this.financeReportFormGroup.value.type}`
      )
      .subscribe({
        next: (data: any) => {
          const salesValue = data.bills.value;
          const salesDiscount = data.bills.discount;
          const salesDelivery = data.bills.delivery;
          const salesService = data.bills.service;

          const headerText =
            this.financeReportFormGroup.controls['type'].value == '0'
              ? `Periode Bulan ${this.datePipe.transform(
                  new Date(
                    this.financeReportFormGroup.controls['year'].value,
                    this.financeReportFormGroup.controls['month'].value - 1,
                    1
                  ),
                  'MM/YYYY'
                )}`
              : `Periode Tahun ${this.financeReportFormGroup.controls['year'].value}`;

          const pnlSection = [];

          const pnlTable = [
            [
              [
                {
                  text: 'Perusahaan',
                  style: 'tableHeader',
                },
                {
                  text: 'Company',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Pendapatan',
                  style: 'tableHeader',
                },
                {
                  text: 'Income',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Harga Pokok Penjualan',
                  style: 'tableHeader',
                },
                {
                  text: 'Cost of Goods Sold',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Laba Kotor',
                  style: 'tableHeader',
                },
                {
                  text: 'Gross Profit',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Laba Bersih',
                  style: 'tableHeader',
                },
                {
                  text: 'Net Profit',
                  style: 'tableHeaderSubtitle',
                },
              ],
            ],
            ...data.companies.map((x: any) => {
              const cogsIndex = data.cogs.findIndex((y: any) => y._id == x.id);
              return cogsIndex == -1
                ? [
                    {
                      text: x.name,
                      style: 'tableContent',
                    },
                    {
                      text: this.decimalPipe.transform(0, '1.2-2'),
                      style: 'tableContent',
                    },
                    {
                      text: this.decimalPipe.transform(0, '1.2-2'),
                      style: 'tableContent',
                    },
                    {
                      text: `${this.decimalPipe.transform(0, '1.2-2')}`,
                      style: 'tableContent',
                    },
                    {
                      text: `${this.decimalPipe.transform(0, '1.2-2')}`,
                      style: 'tableContent',
                    },
                  ]
                : [
                    {
                      text: x.name,
                      style: 'tableContent',
                    },
                    {
                      text: this.decimalPipe.transform(
                        data.cogs[cogsIndex].totalStockoutValue,
                        '1.2-2'
                      ),
                      style: 'tableContent',
                    },
                    {
                      text: this.decimalPipe.transform(
                        data.cogs[cogsIndex].totalCOGS,
                        '1.2-2'
                      ),
                      style: 'tableContent',
                    },
                    [
                      {
                        text: `${this.decimalPipe.transform(
                          data.cogs[cogsIndex].totalStockoutValue -
                            data.cogs[cogsIndex].totalCOGS,
                          '1.2-2'
                        )}`,
                        style: 'tableContent',
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          data.cogs[cogsIndex].totalStockoutValue == 0
                            ? 0
                            : ((data.cogs[cogsIndex].totalStockoutValue -
                                data.cogs[cogsIndex].totalCOGS) *
                                100) /
                                data.cogs[cogsIndex].totalStockoutValue,
                          '1.2-2'
                        )}%`,
                        style: 'tableContentSubtitle',
                      },
                    ],
                    [
                      {
                        text: `${this.decimalPipe.transform(
                          data.cogs[cogsIndex].totalStockoutValue -
                            data.cogs[cogsIndex].totalCOGS -
                            (data.expenses as any[])
                              .filter((y) => y.company_id == x.id)
                              .reduce(
                                (a, b) => a + parseFloat(b.value.toString()),
                                0
                              ),
                          '1.2-2'
                        )}`,
                        style: 'tableContent',
                      },
                      {
                        text: `${this.decimalPipe.transform(
                          data.cogs[cogsIndex].totalStockoutValue == 0
                            ? 0
                            : ((data.cogs[cogsIndex].totalStockoutValue -
                                data.cogs[cogsIndex].totalCOGS -
                                (data.expenses as any[])
                                  .filter((y) => y.company_id == x.id)
                                  .reduce(
                                    (a, b) =>
                                      a + parseFloat(b.value.toString()),
                                    0
                                  )) *
                                100) /
                                data.cogs[cogsIndex].totalStockoutValue,
                          '1.2-2'
                        )}%`,
                        style: 'tableContentSubtitle',
                      },
                    ],
                  ];
            }),
            [
              {
                text: 'Tidak teralokasi',
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(data.overflows, '1.2-2'),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(0, '1.2-2'),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(0, '1.2-2'),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(0, '1.2-2'),
                style: 'tableContent',
              },
            ],
            [
              {
                text: 'Total',
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(
                  data.cogs.reduce(
                    (a: any, b: any) => a + b.totalStockoutValue,
                    0
                  ),
                  '1.2-2'
                ),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(
                  data.cogs.reduce((a: any, b: any) => a + b.totalCOGS, 0),
                  '1.2-2'
                ),
                style: 'tableContent',
              },
              [
                {
                  text: this.decimalPipe.transform(
                    data.cogs.reduce(
                      (a: any, b: any) =>
                        a + b.totalStockoutValue - b.totalCOGS,
                      0
                    ),
                    '1.2-2'
                  ),
                  style: 'tableContent',
                },
                {
                  text: `${this.decimalPipe.transform(
                    (data.cogs.reduce(
                      (a: any, b: any) =>
                        a + b.totalStockoutValue - b.totalCOGS,
                      0
                    ) /
                      data.cogs.reduce(
                        (a: any, b: any) => a + b.totalStockoutValue,
                        0
                      )) *
                      100,
                    '1.2-2'
                  )}%`,
                  style: 'tableContentSubtitle',
                },
              ],
              [
                {
                  text: this.decimalPipe.transform(
                    data.cogs.reduce(
                      (a: any, b: any) =>
                        a + b.totalStockoutValue - b.totalCOGS,
                      0
                    ) -
                      (data.expenses as any[]).reduce(
                        (a, b) => a + parseFloat(b.value.toString()),
                        0
                      ),
                    '1.2-2'
                  ),
                  style: 'tableContent',
                },
                {
                  text: `${this.decimalPipe.transform(
                    ((data.cogs.reduce(
                      (a: any, b: any) =>
                        a + b.totalStockoutValue - b.totalCOGS,
                      0
                    ) -
                      (data.expenses as any[]).reduce(
                        (a, b) => a + parseFloat(b.value.toString()),
                        0
                      )) *
                      100) /
                      data.cogs.reduce(
                        (a: any, b: any) => a + b.totalStockoutValue,
                        0
                      ),
                    '1.2-2'
                  )}%`,
                  style: 'tableContentSubtitle',
                },
              ],
            ],
          ];

          pnlSection.push({
            layout: 'lightHorizontalLines' as TableLayout,
            table: {
              widths: ['auto', '*', '*', '*', '*'],
              body: pnlTable,
            },
          });

          const salesTable = [
            [
              [
                {
                  text: 'Penjualan',
                  style: 'tableHeader',
                },
                {
                  text: 'Sales',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Jasa',
                  style: 'tableHeader',
                },
                {
                  text: 'Service',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Pengiriman',
                  style: 'tableHeader',
                },
                {
                  text: 'Delivery',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Potongan Penjualan',
                  style: 'tableHeader',
                },
                {
                  text: 'Sales Discount',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Total Penjualan',
                  style: 'tableHeader',
                },
                {
                  text: 'Total Sales',
                  style: 'tableHeaderSubtitle',
                },
              ],
            ],
            [
              {
                text: this.decimalPipe.transform(salesValue, '1.2-2'),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(salesService, '1.2-2'),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(salesDelivery, '1.2-2'),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(salesDiscount, '1.2-2'),
                style: 'tableContent',
              },
              {
                text: this.decimalPipe.transform(
                  Number(salesValue) -
                    Number(salesDiscount) +
                    Number(salesDelivery) +
                    Number(salesService),
                  '1.2-2'
                ),
                style: 'tableContent',
              },
            ],
          ];

          const purchaseTable = [
            [
              [
                {
                  text: 'Perusahaan',
                  style: 'tableHeader',
                },
                {
                  text: 'Company',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Pembelian',
                  style: 'tableHeader',
                },
                {
                  text: 'Purchase',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Potongan Pembelian',
                  style: 'tableHeader',
                },
                {
                  text: 'Purchase Discount',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Total Pembelian',
                  style: 'tableHeader',
                },
                {
                  text: 'Total Purchase',
                  style: 'tableHeaderSubtitle',
                },
              ],
            ],
            ...data.companies.map((company: any) => {
              const purchaseIndex = data.purchases.findIndex(
                (x: any) => x.company_id == company.id
              );

              const purchase = data.purchases[purchaseIndex];
              return purchaseIndex == -1
                ? [
                    {
                      text: company.name,
                      style: 'tableContent',
                    },
                    {
                      text: '0.00',
                      style: 'tableContent',
                    },
                    {
                      text: '0.00',
                      style: 'tableContent',
                    },
                    {
                      text: '0.00',
                      style: 'tableContent',
                    },
                  ]
                : [
                    {
                      text: purchase.name,
                      style: 'tableContent',
                    },
                    {
                      text: this.decimalPipe.transform(purchase.value, '1.2-2'),
                      style: 'tableContent',
                    },
                    {
                      text: this.decimalPipe.transform(
                        purchase.discount,
                        '1.2-2'
                      ),
                      style: 'tableContent',
                    },
                    {
                      text: this.decimalPipe.transform(
                        Number(purchase.value) - Number(purchase.discount),
                        '1.2-2'
                      ),
                      style: 'tableContent',
                    },
                  ];
            }),
          ];

          const expenseSection: any[] = [];
          const expenseTable = [
            [
              [
                {
                  text: 'Perusahaan',
                  style: 'tableHeader',
                },
                {
                  text: 'Company',
                  style: 'tableHeaderSubtitle',
                },
              ],
              [
                {
                  text: 'Total Biaya',
                  style: 'tableHeader',
                },
                {
                  text: 'Total Expense',
                  style: 'tableHeaderSubtitle',
                },
              ],
            ],
            ...data.companies.map((x: any) => {
              return [
                {
                  text: x.name,
                  style: 'tableContent',
                },
                {
                  text: this.decimalPipe.transform(
                    (data.expenses as any[])
                      .filter((y) => y.company_id == x.id)
                      .reduce((a, b) => a + parseFloat(b.value.toString()), 0),
                    '1.2-2'
                  ),
                  style: 'tableContent',
                },
              ];
            }),
          ];

          if (this.financeReportFormGroup.controls['type'].value == 0) {
            expenseSection.push({
              layout: 'lightHorizontalLines' as TableLayout,
              table: {
                widths: ['*', '*'],
                body: expenseTable,
              },
            });

            let documentDefinition: TDocumentDefinitions = {
              pageSize: 'A4' as PageSize,
              header: function () {
                return [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 170,
                        h: 5,
                        color: '#DE482B',
                      } as CanvasRect,
                    ],
                  },
                ];
              },
              content: [
                {
                  text: 'LABA RUGI',
                  style: 'header',
                  margin: [0, 0, 0, 5] as Margins,
                },
                {
                  text: 'Profit and Loss Statement',
                  style: 'subheader',
                  margin: [0, 0, 0, 20] as Margins,
                },
                {
                  text: headerText,
                  style: 'body',
                },
                {
                  text: 'Laporan di bawah ini akan menunjukan laba atau rugi yang diperoleh dari penjualan, harga pokok penjualan, pengeluaran, dan biaya lainnya.',
                  style: 'body',
                  margin: [0, 0, 0, 20] as Margins,
                },
                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Ringkasan',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                ...pnlSection,

                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Penjualan',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                {
                  layout: 'lightHorizontalLines' as TableLayout,
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', '*', '*'],
                    body: salesTable,
                  },
                },
                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Pembelian',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                {
                  layout: 'lightHorizontalLines' as TableLayout,
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', '*'],
                    body: purchaseTable,
                  },
                },
                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Pengeluaran',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                ...expenseSection,
              ],
              styles: {
                header: {
                  bold: true,
                  fontSize: 22,
                  alignment: 'left' as Alignment,
                  color: '#000000',
                },
                subheader: {
                  fontSize: 12,
                  alignment: 'left' as Alignment,
                  bold: false,
                  italics: true,
                  color: '#616161',
                },
                body: {
                  fontSize: 10,
                  alignment: 'left' as Alignment,
                  bold: false,
                  color: '#292423',
                },
                tableHeader: {
                  bold: true,
                  fontSize: 10,
                  color: 'black',
                },
                tableHeaderSubtitle: {
                  bold: false,
                  italics: true,
                  fontSize: 8,
                  color: '#616161',
                },
                tableContent: {
                  bold: false,
                  fontSize: 10,
                  color: '#292423',
                  alignment: 'left' as Alignment,
                },
                tableContentSubtitle: {
                  bold: false,
                  fontSize: 8,
                  color: '#616161',
                  alignment: 'left' as Alignment,
                },
              },
            };

            pdfMake
              .createPdf(documentDefinition)
              .download(
                `Profit and Loss Statement ${this.financeReportFormGroup.controls['month'].value} ${this.financeReportFormGroup.controls['year'].value}.pdf`
              );
          } else {
            expenseSection.push({
              layout: 'lightHorizontalLines' as TableLayout,
              table: {
                widths: ['*', '*'],
                body: expenseTable,
              },
            });

            const billAppendixTable = (data.appendix.bills as any[]).map(
              (x, index) => {
                return [
                  {
                    text: index + 1,
                    style: 'tableContent',
                  },
                  {
                    text: this.datePipe.transform(x.date, 'dd/MM/yy'),
                    style: 'tableContent',
                  },
                  {
                    text: x.name,
                    style: 'tableContent',
                  },
                  {
                    text: x.customer_name,
                    style: 'tableContent',
                  },
                  {
                    text: this.decimalPipe.transform(x.value, '1.2-2'),
                    style: 'tableContent',
                  },
                  {
                    text: this.decimalPipe.transform(x.delivery, '1.2-2'),
                    style: 'tableContent',
                  },
                  {
                    text: this.decimalPipe.transform(x.service, '1.2-2'),
                    style: 'tableContent',
                  },
                  {
                    text: this.decimalPipe.transform(x.discount, '1.2-2'),
                    style: 'tableContent',
                  },
                ];
              }
            );

            const billAppendixSection = [
              {
                pageOrientation: 'landscape' as PageOrientation,
                style: 'header',
                table: {
                  widths: '*',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        fillColor: '#2b2b2b',
                        text: 'Lampiran Penjualan',
                        style: 'subheader',
                        color: 'white',

                        fontSize: 10,
                        bold: true,
                      },
                    ],
                  ],
                },
                pageBreak: 'before' as PageBreak,
              },
              {
                pageOrientation: 'landscape' as PageOrientation,
                layout: 'lightHorizontalLines' as TableLayout,
                table: {
                  headerRows: 1,
                  widths: ['auto', 'auto', 'auto', '*', '*', '*', '*', '*'],
                  body: [
                    [
                      [
                        {
                          text: 'No.',
                          style: 'tableHeader',
                        },
                        {
                          text: 'No.',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Tanggal',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Date',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Dokumen',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Document',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Pelanggan',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Customer',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Nilai',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Value',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Pengiriman',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Delivery',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Jasa',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Service',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Diskon',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Discount',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                    ],
                    ...billAppendixTable,
                  ],
                },
              },
            ];

            const purchaseAppendixTable = (
              data.appendix.purchases as any[]
            ).map((x, index) => {
              return [
                {
                  text: index + 1,
                  style: 'tableContent',
                },
                {
                  text: this.datePipe.transform(x.date, 'dd/MM/yy'),
                  style: 'tableContent',
                },
                {
                  text: x.purchase_invoice_name,
                  style: 'tableContent',
                },
                {
                  text: x.supplier_name,
                  style: 'tableContent',
                },
                {
                  text: x.company_name,
                  style: 'tableContent',
                },
                {
                  text: this.decimalPipe.transform(x.value, '1.2-2'),
                  style: 'tableContent',
                },
                {
                  text: this.decimalPipe.transform(x.discount, '1.2-2'),
                  style: 'tableContent',
                },
                {
                  text: this.decimalPipe.transform(
                    x.value - x.discount,
                    '1.2-2'
                  ),
                  style: 'tableContent',
                },
              ];
            });

            const purchaseAppendixSection = [
              {
                pageOrientation: 'landscape' as PageOrientation,
                style: 'header',
                table: {
                  widths: '*',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        fillColor: '#2b2b2b',
                        text: 'Lampiran Pembelian',
                        style: 'subheader',
                        color: 'white',
                        fontSize: 10,
                        bold: true,
                      },
                    ],
                  ],
                },
                pageBreak: 'before' as PageBreak,
              },
              {
                pageOrientation: 'landscape' as PageOrientation,
                layout: 'lightHorizontalLines' as TableLayout,
                table: {
                  headerRows: 1,
                  widths: ['auto', 'auto', 'auto', '*', '*', '*', '*', '*'],
                  body: [
                    [
                      [
                        {
                          text: 'No.',
                          style: 'tableHeader',
                        },
                        {
                          text: 'No.',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Tanggal',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Date',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Dokumen',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Document',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Supplier',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Supplier',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Perusahaan',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Company',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Nilai',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Value',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Diskon',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Discount',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Total',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Total',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                    ],
                    ...purchaseAppendixTable,
                  ],
                },
              },
            ];

            const expenseAppendixTable = (data.appendix.expenses as any[]).map(
              (x, index) => {
                return [
                  {
                    text: index + 1,
                    style: 'tableContent',
                  },
                  {
                    text: this.datePipe.transform(x.date, 'dd/MM/yy'),
                    style: 'tableContent',
                  },
                  {
                    text: this.decimalPipe.transform(x.value, '1.2-2'),
                    style: 'tableContent',
                  },
                  {
                    text: x.company_name,
                    style: 'tableContent',
                  },
                  {
                    text: x.name,
                    style: 'tableContent',
                  },
                  {
                    text: x.description,
                    style: 'tableContent',
                  },
                ];
              }
            );

            const expenseAppendixSection = [
              {
                pageOrientation: 'landscape' as PageOrientation,
                style: 'header',
                table: {
                  widths: '*',
                  body: [
                    [
                      {
                        border: [false, false, false, false],
                        fillColor: '#2b2b2b',
                        text: 'Lampiran Pengeluaran',
                        style: 'subheader',
                        color: 'white',
                        fontSize: 10,
                        bold: true,
                      },
                    ],
                  ],
                },
                pageBreak: 'before' as PageBreak,
              },
              {
                pageOrientation: 'landscape' as PageOrientation,
                layout: 'lightHorizontalLines' as TableLayout,
                table: {
                  headerRows: 1,
                  widths: ['auto', 'auto', '*', '*', '*', '*'],
                  body: [
                    [
                      [
                        {
                          text: 'No.',
                          style: 'tableHeader',
                        },
                        {
                          text: 'No.',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Tanggal',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Date',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Nilai',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Value',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Perusahaan',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Company',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Nama',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Name',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                      [
                        {
                          text: 'Deskripsi',
                          style: 'tableHeader',
                        },
                        {
                          text: 'Description',
                          style: 'tableHeaderSubtitle',
                        },
                      ],
                    ],
                    ...expenseAppendixTable,
                  ],
                },
              },
            ];

            let documentDefinition: TDocumentDefinitions = {
              pageSize: 'A4' as PageSize,
              pageOrientation: 'portrait' as PageOrientation,
              header: function () {
                return [
                  {
                    canvas: [
                      {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w: 170,
                        h: 5,
                        color: '#DE482B',
                      } as CanvasRect,
                    ],
                  },
                ];
              },
              content: [
                {
                  text: 'LABA RUGI',
                  style: 'header',
                  margin: [0, 0, 0, 5] as Margins,
                },
                {
                  text: 'Profit and Loss Statement',
                  style: 'subheader',
                  margin: [0, 0, 0, 20] as Margins,
                },
                {
                  text: 'Laporan di bawah ini akan menunjukan laba atau rugi yang diperoleh dari penjualan, harga pokok penjualan, pengeluaran, dan biaya lainnya.',
                  style: 'body',
                  margin: [0, 0, 0, 20] as Margins,
                },
                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Ringkasan',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                ...pnlSection,
                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Penjualan',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                {
                  layout: 'lightHorizontalLines' as TableLayout,
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', '*', '*'],
                    body: salesTable,
                  },
                },
                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Pembelian',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                {
                  layout: 'lightHorizontalLines' as TableLayout,
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*', '*', '*'],
                    body: purchaseTable,
                  },
                },
                {
                  style: 'header',
                  table: {
                    widths: '*',
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          fillColor: '#2b2b2b',
                          text: 'Pengeluaran',
                          style: 'subheader',
                          color: 'white',
                          fontSize: 10,
                          bold: true,
                        },
                      ],
                    ],
                  },
                },
                ...expenseSection,
                ...expenseAppendixSection,
                ...billAppendixSection,
                ...purchaseAppendixSection,
              ],
              styles: {
                header: {
                  bold: true,
                  fontSize: 22,
                  alignment: 'left' as Alignment,
                  color: '#000000',
                },
                subheader: {
                  fontSize: 12,
                  alignment: 'left' as Alignment,
                  bold: false,
                  italics: true,
                  color: '#616161',
                },
                body: {
                  fontSize: 10,
                  alignment: 'left' as Alignment,
                  bold: false,
                  color: '#292423',
                },
                tableHeader: {
                  bold: true,
                  fontSize: 10,
                  color: 'black',
                },
                tableHeaderSubtitle: {
                  bold: false,
                  italics: true,
                  fontSize: 8,
                  color: '#616161',
                },
                tableContent: {
                  bold: false,
                  fontSize: 10,
                  color: '#292423',
                  alignment: 'left' as Alignment,
                },
                tableContentSubtitle: {
                  bold: false,
                  fontSize: 8,
                  color: '#616161',
                  alignment: 'left' as Alignment,
                },
              },
            };

            pdfMake
              .createPdf(documentDefinition)
              .download(
                `Profit and Loss Statement ${this.financeReportFormGroup.controls['month'].value} ${this.financeReportFormGroup.controls['year'].value}.pdf`
              );
          }
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  closeDialog() {
    if (this.isDownloading) {
      return;
    } else {
      this.isOpened = false;
      setTimeout(() => {
        this.dynamicComponentService.closeDynamicComponent();
      }, 300);
    }
  }
}
