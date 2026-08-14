import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatRipple } from '@angular/material/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { ApiService } from 'src/app/services/api.service';
import moment, { Moment } from 'moment';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { SalesSalesChartComponent } from './sales-sales-chart/sales-sales-chart.component';
import { TypeSalesChartComponent } from './type-sales-chart/type-sales-chart.component';
import { BrandSalesChartComponent } from './brand-sales-chart/brand-sales-chart.component';
import { CustomerSalesChartComponent } from './customer-sales-chart/customer-sales-chart.component';
import { AlertService } from 'src/app/services/alert.service';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';
import { MatDialog } from '@angular/material/dialog';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../components/feature-header/feature-header.component';
import { SalesChartComponent } from '../../../components/charts/sales-chart/sales-chart.component';
import { SalesValueChartComponent } from '../../../components/charts/sales-value-chart/sales-value-chart.component';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatTooltip } from '@angular/material/tooltip';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-report-sales',
    templateUrl: './report-sales.component.html',
    styleUrls: ['./report-sales.component.css'],
    animations: [slideInOutAnimation, slideInOutAnimation],
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: MONTH_AND_YEAR_FORMAT },
    ],
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, SalesChartComponent, SalesValueChartComponent, MatRipple, MatFormField, MatLabel, MatInput, MatDatepickerInput, FormsModule, ReactiveFormsModule, MatHint, MatDatepickerToggle, MatSuffix, MatDatepicker, MatButton, MatIcon, MatDivider, MatRadioGroup, MatRadioButton, MatGridList, MatGridTile, MatTooltip, DecimalPipe, TranslateModule]
})
export class ReportSalesComponent {
  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  isLoading: boolean = false;
  isSubmitting: boolean = false;
  columnNumber: number = 0;

  transactions: number = 0;
  chartDataSource: any[] = [];
  customerCount: number = 0;

  totalSales: number = 0;
  totalDiscount: number = 0;
  totalDelivery: number = 0;
  totalService: number = 0;

  bestSales: string = 'N/A';
  bestBrand: string = 'N/A';
  bestType: string = 'N/A';
  returnValue: number = 0;
  returnCount: number = 0;

  chartType: number = 0;

  brandDataSource: any[] = [];
  typeDataSource: any[] = [];
  salesDataSource: any[] = [];
  customerDataSource: any[] = [];

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
      .post('report/sales', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
        mode: 'V2',
      })
      .subscribe({
        next: (data: any) => {
          this.chartDataSource = data.chart;
          this.transactions = data.salesInvoiceCount;

          this.totalSales = data.total - data.discount;
          this.totalDelivery = data.delivery;
          this.totalService = data.service;

          this.bestBrand = data.brand == null ? '?N/A' : data.brand;
          this.bestType = data.type == null ? '?N/A' : data.type;

          this.returnValue = data.returned_value;
          this.returnCount = data.returns;

          this.brandDataSource = data.brand;
          this.typeDataSource = data.type;
          this.salesDataSource = data.sales;
          this.customerDataSource = data.customer;
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
        case 'sales':
          this.dynamicComponentService.createDynamicComponent(
            SalesSalesChartComponent,
            this.salesDataSource
          );
          break;
        case 'type':
          this.dynamicComponentService.createDynamicComponent(
            TypeSalesChartComponent,
            this.typeDataSource
          );
          break;
        case 'brand':
          this.dynamicComponentService.createDynamicComponent(
            BrandSalesChartComponent,
            this.brandDataSource
          );
          break;
        case 'customer':
          this.dynamicComponentService.createDynamicComponent(
            CustomerSalesChartComponent,
            this.customerDataSource
          );
          break;
      }
    }
  }

  download(): void {
    this.isSubmitting = true;
    this.apiService
      .post('report/sales/download', {
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
              'Customer name',
              'Value',
              'Discount',
              'Service',
              'Delivery',
              'Total',
              'Sales',
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
              y.customer_name,
              y.value,
              y.discount,
              y.service,
              y.delivery,
              y.value - y.discount + y.service + y.delivery,
              y.sales,
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

          worksheet['!cols'] = [
            { wpx: 40 }, // No
            { wpx: 120 }, // Date
            { wpx: 120 }, // Name
            { wpx: 200 }, // Customer name
            { wpx: 120 }, // Value
            { wpx: 120 }, // Discount
            { wpx: 120 }, // Service
            { wpx: 120 }, // Delivery
            { wpx: 120 }, // Total
            { wpx: 120 }, // Sales
          ];

          for (let R = 1; R <= range.e.r; ++R) {
            const dateAddr = xlsx.utils.encode_cell({ r: R, c: 1 });
            const jsDate = new Date(data[R - 1].date);
            worksheet[dateAddr] = {
              t: 'd',
              v: jsDate,
              z: 'dd-mmm-yyyy', // Format as "05-Jul-2023"
            };
            [4, 5, 6, 7, 8].forEach((col) => {
              const addr = xlsx.utils.encode_cell({ r: R, c: col });
              if (worksheet[addr]) {
                worksheet[addr].z = '#,##0.00;[Red]-#,##0.00'; // Currency format
              }
            });
          }

          const workbook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

          const excelBuffer = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, `Sales_report_${new Date().getTime()}.xlsx`);
          this.alertService.showSuccess(
            this.translateService.instant('sales-report__export__successful')
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

  setChartType(event: any) {
    this.chartType = event.value;
  }

  get colNumber(): number {
    // If window width > 768, 3 columns, it > 512, 2 columns; else 1
    if (window.innerWidth > 1200) {
      return 4;
    } else if (window.innerWidth > 992) {
      return 3;
    } else if (window.innerWidth > 768) {
      return 2;
    } else {
      return 2;
    }
  }

  get maxDayOnMonth(): number {
    return new Date(
      this.date.value!.year(),
      this.date.value!.month() + 1,
      0
    ).getDate();
  }

  openBrandSalesReport() {
    this.dialog.open(BrandSalesChartComponent, {
      data: {
        month: this.date.value?.month(),
        year: this.date.value?.year(),
      },
    });
  }

  openTypeSalesReport() {
    this.dialog.open(TypeSalesChartComponent, {
      data: {
        month: this.date.value?.month(),
        year: this.date.value?.year(),
      },
    });
  }

  openSalesSalesReport() {
    this.dialog.open(SalesSalesChartComponent, {
      data: {
        month: this.date.value?.month(),
        year: this.date.value?.year(),
      },
    });
  }
}
