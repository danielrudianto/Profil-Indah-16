import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { ApiService } from 'src/app/services/api.service';
import moment, { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { AlertService } from 'src/app/services/alert.service';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import { SupplierPurchaseChartComponent } from './supplier-purchase-chart/supplier-purchase-chart.component';
import { BrandPurchaseChartComponent } from './brand-purchase-chart/brand-purchase-chart.component';
import { TypePurchaseChartComponent } from './type-purchase-chart/type-purchase-chart.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-report-purchase',
  templateUrl: './report-purchase.component.html',
  styleUrls: ['./report-purchase.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
  ],
})
export class ReportPurchaseComponent {
  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private datePipe: DatePipe
  ) {}

  isLoading: boolean = false;
  isSubmitting: boolean = false;
  columnNumber: number = 0;

  transactions: number = 0;
  chartDataSource: any[] = [];
  supplierCount: number = 0;
  totalPurchase: number = 0;
  bestSupplier: string = 'N/A';
  bestBrand: string = 'N/A';
  bestType: string = 'N/A';
  returnValue: number = 0;
  returnCount: number = 0;

  brandDataSource: any[] = [];
  typeDataSource: any[] = [];
  salesDataSource: any[] = [];
  supplierDataSource: any[] = [];

  date = new FormControl(moment());

  ngOnInit(): void {
    this.fetchSalesReport();

    this.columnNumber = this.colNumber;

    window.onresize = () => {
      this.columnNumber = this.colNumber;
    };
  }

  fetchSalesReport(): void {
    this.isLoading = true;
    this.apiService
      .post('report/purchase', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
        mode: 'V2',
      })
      .subscribe({
        next: (data: any) => {
          this.chartDataSource = data.chart;
          this.transactions = data.goodReceiptCount;
          this.supplierCount = data.supplier;
          this.totalPurchase = data.total;

          this.bestBrand = data.brand == null ? 'N/A' : data.brand;
          this.bestType = data.type == null ? 'N/A' : data.type;
          this.bestSupplier = data.supplier == null ? 'N/A' : data.supplier;
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  setMonthAndYear(
    normalizedMonthAndYear: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.date.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();

    this.fetchSalesReport();
  }

  openDetail(detailType: string) {
    if (!this.isLoading) {
      switch (detailType) {
        case 'supplier':
          this.dynamicComponentService.createDynamicComponent(
            SupplierPurchaseChartComponent,
            this.supplierDataSource
          );
          break;
        case 'brand':
          this.dynamicComponentService.createDynamicComponent(
            BrandPurchaseChartComponent,
            this.brandDataSource
          );
          break;
        case 'type':
          this.dynamicComponentService.createDynamicComponent(
            TypePurchaseChartComponent,
            this.typeDataSource
          );
          break;
      }
    }
  }

  download(): void {
    this.isSubmitting = true;
    this.apiService
      .post('report/purchase/download', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
      })
      .subscribe({
        next: (data: any) => {
          const worksheetData = [
            [
              'No',
              'Date',
              'Name',
              'Invoice name',
              'Faktur',
              'Supplier name',
              'Value',
              'Discount',
              'Total',
            ],
          ];

          data.forEach((y: any, index: number) => {
            const excelDateSerialNumber = xlsx.SSF.parse_date_code(
              new Date(y.date).getTime() / (24 * 60 * 60 * 1000) + 25569
            );

            worksheetData.push([
              index + 1,
              excelDateSerialNumber,
              y.name,
              y.invoice_name,
              y.faktur,
              y.supplier_name,
              y.value,
              y.discount,
              y.value - y.discount,
            ]);
          });

          const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
          // Convert range to table for filter functionality
          const range = xlsx.utils.decode_range(worksheet['!ref']!);
          worksheet['!ref'] = xlsx.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: range.e.r, c: range.e.c },
          });

          worksheet['!autofilter'] = {
            ref: xlsx.utils.encode_range({
              s: { r: 0, c: 0 },
              e: { r: 0, c: range.e.c },
            }),
          };

          for (let C = 0; C <= range.e.c; ++C) {
            const address = xlsx.utils.encode_cell({ r: 0, c: C });
            worksheet[address].s = {
              font: {
                bold: true,
                color: { rgb: 'FFFFFF' },
                name: 'Calibri',
                sz: 11,
              },
              fill: {
                fgColor: { rgb: '000000' }, // Black background
                patternType: 'solid',
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
              },
            };
          }

          // Column widths and formatting
          worksheet['!cols'] = [
            { wpx: 40 }, // No
            { wpx: 90 }, // Date
            { wpx: 120 }, // Name
            { wpx: 120 }, // Invoice name
            { wpx: 80 }, // Faktur
            { wpx: 150 }, // Supplier name
            { wpx: 80 }, // Value
            { wpx: 80 }, // Discount
            { wpx: 80 }, // Total
          ];
          // Format dates (column B)
          for (let R = 1; R <= range.e.r; ++R) {
            const dateAddr = xlsx.utils.encode_cell({ r: R, c: 1 });
            const jsDate = new Date(data[R - 1].date);
            worksheet[dateAddr] = {
              t: 'd',
              v: jsDate,
              z: 'dd-mmm-yyyy', // Format as "05-Jul-2023"
            };
            // Format currency (columns G, H, I)
            [6, 7, 8].forEach((col) => {
              // Use numeric indices for columns G (6), H (7), I (8)
              const addr = xlsx.utils.encode_cell({ r: R, c: col });
              if (worksheet[addr]) {
                worksheet[addr].z = '#,##0.00;[Red]-#,##0.00'; // Currency format
              }
            });
          }

          worksheet['!margins'] = {
            left: 0.7,
            right: 0.7,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3,
          };

          worksheet['!page'] = {
            orientation: 'landscape',
            paperSize: 9, // A4 (9=Letter, 9=A4)
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
          };

          // Create workbook
          const workbook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, worksheet, 'Purchase Report');
          // Export file
          xlsx.writeFile(
            workbook,
            `Purchase_Report_${new Date().getTime()}.xlsx`
          );

          // Show success message
          this.alertService.showSuccess(
            this.translateService.instant('purchase-report__export__successful')
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  get colNumber(): number {
    // If window width > 768, 3 columns, it > 512, 2 columns; else 1
    if (window.innerWidth > 1200) {
      return 3;
    } else if (window.innerWidth > 768) {
      return 2;
    } else {
      return 1;
    }
  }

  get maxDayOnMonth(): number {
    return new Date(
      this.date.value!.year(),
      this.date.value!.month() + 1,
      0
    ).getDate();
  }
}
