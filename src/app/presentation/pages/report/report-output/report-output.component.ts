import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  Alignment,
  CanvasRect,
  Content,
  PageBreak,
  PageOrientation,
  PageSize,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import { DecimalPipe, NgIf, NgFor } from '@angular/common';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../../components/transaction-header/transaction-header.component';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatChipListbox, MatChip } from '@angular/material/chips';

@Component({
    selector: 'app-report-output',
    templateUrl: './report-output.component.html',
    styleUrls: ['./report-output.component.css'],
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
    ],
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatHint, MatDatepickerToggle, MatSuffix, MatDatepicker, MatSelect, MatOption, AutocompleteSearchComponent, NgIf, MatChipListbox, NgFor, MatChip, TranslatePipe]
})
export class ReportOutputComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private decimalPipe: DecimalPipe,
    private translateService: TranslateService
  ) {}

  selectedBrands: any[] = [];
  selectedTypes: any[] = [];
  isSubmitting: boolean = false;

  documentFormGroup: FormGroup = new FormGroup({
    format: new FormControl('', Validators.required),
    groupBy: new FormControl('', Validators.required),
    date: new FormControl(moment(), Validators.required),
  });

  ngOnInit(): void {}

  submitForm() {
    if (
      !this.documentFormGroup.valid ||
      this.selectedBrands.length == 0 ||
      this.selectedTypes.length == 0 ||
      this.isSubmitting
    ) {
      return;
    } else {
      this.apiService
        .post('report/output', {
          month: this.documentFormGroup.value.date._d.getMonth() + 1,
          year: this.documentFormGroup.value.date._d.getFullYear(),
          format: this.documentFormGroup.value.format,
          group: this.documentFormGroup.value.groupBy,
          brand: this.selectedBrands.map((x) => x.id),
          type: this.selectedTypes.map((x) => x.id),
        })
        .subscribe({
          next: (data: any) => {
            const format = this.documentFormGroup.value.format;
            const groupBy = this.documentFormGroup.value.groupBy;

            if (format == 'PDF') {
              let content: Content[] = [];
              if (groupBy === 'brand') {
                data.brands.forEach((brand: any, i: number) => {
                  content.push({
                    text: brand.name,
                    style: 'header',
                    marginBottom: 20,
                  });

                  const dataTable = {
                    layout: 'lightHorizontalLines',
                    table: {
                      headerRows: 1,
                      widths: [
                        'auto',
                        75,
                        '*',
                        'auto',
                        'auto',
                        50,
                        50,
                        50,
                        50,
                        50,
                        50,
                        50,
                        50,
                      ],
                      body: [
                        [
                          [
                            {
                              text: 'No',
                              style: 'tableHeader',
                            },
                            {
                              text: 'No.',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Referensi',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Reference',
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
                          [
                            {
                              text: 'Merek',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Brand',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Tipe',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Type',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Stok awal',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Initial stock',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Masukan atas kasus penyesuaian',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Adjustment case input',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Keluaran atas kasus penyesuaian',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Adjustment case output',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Masukan atas pembelian',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Input from purchase',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Keluaran atas penjualan',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Output from sales',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Masukan atas retur penjualan',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Input from sales return',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Stock akhir',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Final stock',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Satuan',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Unit',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                        ],
                        ...(data.data as any[]).map((y, index) => {
                          return [
                            {
                              text: this.decimalPipe.transform(
                                index + 1,
                                '1.0'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: y.reference,
                              style: 'tableContent',
                            },
                            {
                              text: y.description,
                              style: 'tableContent',
                            },
                            {
                              text: y.product_brand.name,
                              style: 'tableContent',
                            },
                            {
                              text: y.product_type.name,
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.stock,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.adjustment_case_found,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.adjustment_case_lost,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.good_receipt,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.sales_invoice,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.sales_return,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.adjustment_case_found +
                                  y.report.adjustment_case_lost +
                                  y.report.good_receipt +
                                  y.report.sales_invoice +
                                  y.report.sales_return,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: y.unit,
                              style: 'tableContent',
                            },
                          ];
                        }),
                      ],
                    },
                    pageBreak:
                      i == (data.brands as any[]).length - 1
                        ? undefined
                        : ('after' as PageBreak),
                  };

                  content.push(dataTable);
                });
              } else if (groupBy === 'type') {
                data.types.forEach((type: any, i: number) => {
                  content.push({
                    text: type.name,
                    style: 'header',
                    marginBottom: 20,
                  });

                  const dataTable = {
                    layout: 'lightHorizontalLines',
                    table: {
                      headerRows: 1,
                      widths: [
                        'auto',
                        75,
                        '*',
                        'auto',
                        'auto',
                        50,
                        50,
                        50,
                        50,
                        50,
                        50,
                        50,
                        50,
                      ],
                      body: [
                        [
                          [
                            {
                              text: 'No',
                              style: 'tableHeader',
                            },
                            {
                              text: 'No.',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Referensi',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Reference',
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
                          [
                            {
                              text: 'Merek',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Brand',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Tipe',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Type',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Stok awal',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Initial stock',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Masukan atas kasus penyesuaian',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Adjustment case input',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Keluaran atas kasus penyesuaian',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Adjustment case output',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Masukan atas pembelian',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Input from purchase',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Keluaran atas penjualan',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Output from sales',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Masukan atas retur penjualan',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Input from sales return',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Stock akhir',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Final stock',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                          [
                            {
                              text: 'Satuan',
                              style: 'tableHeader',
                            },
                            {
                              text: 'Unit',
                              style: 'tableHeaderSubtitle',
                            },
                          ],
                        ],
                        ...(data.data as any[]).map((y, index) => {
                          return [
                            {
                              text: this.decimalPipe.transform(
                                index + 1,
                                '1.0'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: y.reference,
                              style: 'tableContent',
                            },
                            {
                              text: y.description,
                              style: 'tableContent',
                            },
                            {
                              text: y.product_brand.name,
                              style: 'tableContent',
                            },
                            {
                              text: y.product_type.name,
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.stock,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.adjustment_case_found,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.adjustment_case_lost,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.good_receipt,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.sales_invoice,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.sales_return,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: this.decimalPipe.transform(
                                y.report.adjustment_case_found +
                                  y.report.adjustment_case_lost +
                                  y.report.good_receipt +
                                  y.report.sales_invoice +
                                  y.report.sales_return,
                                '1.0-2'
                              ),
                              style: 'tableContent',
                            },
                            {
                              text: y.unit,
                              style: 'tableContent',
                            },
                          ];
                        }),
                      ],
                    },
                    pageBreak:
                      i == (data.brands as any[]).length - 1
                        ? undefined
                        : ('after' as PageBreak),
                  };

                  content.push(dataTable);
                });
              }

              let documentDefinition: TDocumentDefinitions = {
                pageSize: 'A4' as PageSize,
                pageOrientation: 'landscape' as PageOrientation,
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
                content: content,
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
                  },
                },
              };

              pdfMake
                .createPdf(documentDefinition)
                .download(`Output_report_${new Date().getTime()}.pdf`);
            } else if (format == 'Excel') {
              const workbook = xlsx.utils.book_new();

              if (groupBy == 'brand') {
                data.brands.forEach((brand: any) => {
                  const brandName = brand.name;
                  const worksheetData = [
                    [
                      'No',
                      'Reference',
                      'Description',
                      'Brand',
                      'Type',
                      'Initial Stock',
                      'Adjustment Input',
                      'Adjustment Output',
                      'Good Receipt Input',
                      'Bill Output',
                      'Sales Return',
                      'Final Stock',
                      'Unit',
                    ],
                    ...(data.data as any[])
                      .filter((x) => x.product_brand.id == brand.id)
                      .map((x, index) => {
                        return [
                          index + 1,
                          x.reference,
                          x.description,
                          x.product_brand.name,
                          x.product_type.name,
                          x.stock,
                          x.report.adjustment_case_found,
                          x.report.adjustment_case_lost,
                          x.report.good_receipt,
                          x.report.sales_invoice,
                          x.report.sales_return,
                          x.report.adjustment_case_found +
                            x.report.adjustment_case_lost +
                            x.report.good_receipt +
                            x.report.sales_invoice +
                            x.report.sales_return,
                          x.unit,
                        ];
                      }),
                  ];

                  const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
                  xlsx.utils.book_append_sheet(workbook, worksheet, brandName);
                });

                const excelBuffer = xlsx.write(workbook, {
                  bookType: 'xlsx',
                  type: 'array',
                });
                const blob = new Blob([excelBuffer], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                saveAs(blob, `Output_report_${new Date().getTime()}.xlsx`);
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'report-output__export__successful'
                  )
                );
              } else if (groupBy == 'type') {
                data.types.forEach((type: any) => {
                  const typeName = type.name;
                  const worksheetData = [
                    [
                      'No',
                      'Reference',
                      'Description',
                      'Brand',
                      'Type',
                      'Initial Stock',
                      'Adjustment Input',
                      'Adjustment Output',
                      'Good Receipt Input',
                      'Bill Output',
                      'Sales Return',
                      'Final Stock',
                      'Unit',
                    ],
                    ...(data.data as any[])
                      .filter((x) => x.product_type.id == type.id)
                      .map((x, index) => {
                        return [
                          index + 1,
                          x.reference,
                          x.description,
                          x.product_brand.name,
                          x.product_type.name,
                          x.stock,
                          x.report.adjustment_case_found,
                          x.report.adjustment_case_lost,
                          x.report.good_receipt,
                          x.report.sales_invoice,
                          x.report.sales_return,
                          x.report.adjustment_case_found +
                            x.report.adjustment_case_lost +
                            x.report.good_receipt +
                            x.report.sales_invoice +
                            x.report.sales_return,
                          x.unit,
                        ];
                      }),
                  ];

                  const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
                  xlsx.utils.book_append_sheet(workbook, worksheet, typeName);
                });

                const excelBuffer = xlsx.write(workbook, {
                  bookType: 'xlsx',
                  type: 'array',
                });
                const blob = new Blob([excelBuffer], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                saveAs(blob, `Output_report_${new Date().getTime()}.xlsx`);
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'report-output__export__successful'
                  )
                );
              }
            }
          },
          error: (error) => {
            this.alertService.showError(error);
          },
        })
        .add(() => {
          this.isSubmitting = false;
        });
    }
  }

  printPDF(data: any) {}

  printExcel(data: any) {}

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = moment(this.documentFormGroup.value.date) ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.documentFormGroup.get('date')?.setValue(ctrlValue);
    datepicker.close();
  }

  onSelectBrand(event: any) {
    if (this.selectedBrands.filter((x) => x.id == event.id).length > 0) {
      return;
    } else {
      this.selectedBrands.push(event);
    }
  }

  onSelectType(event: any) {
    if (this.selectedTypes.filter((x) => x.id == event.id).length > 0) {
      return;
    } else {
      this.selectedTypes.push(event);
    }
  }

  onUnselectBrand(event: any) {
    this.selectedBrands = this.selectedBrands.filter((x) => x.id != event.id);
  }

  onUnselectType(event: any) {
    this.selectedTypes = this.selectedTypes.filter((x) => x.id != event.id);
  }
}
