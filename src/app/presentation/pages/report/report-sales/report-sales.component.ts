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
import { SalesSalesChartComponent } from './sales-sales-chart/sales-sales-chart.component';
import { TypeSalesChartComponent } from './type-sales-chart/type-sales-chart.component';
import { BrandSalesChartComponent } from './brand-sales-chart/brand-sales-chart.component';
import { CustomerSalesChartComponent } from './customer-sales-chart/customer-sales-chart.component';
import { AlertService } from 'src/app/services/alert.service';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import { MONTH_AND_YEAR_FORMAT } from 'src/app/utils/date-format.utils';

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
})
export class ReportSalesComponent {
  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService
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
          this.chartDataSource = data.date;
          this.transactions = data.transactions;
          this.customerCount = data.customer.length;
          this.bestSales =
            data.sales.length == 0
              ? 'N/A'
              : data.sales.sort((a: any, b: any) => {
                  return b.value - a.value;
                })[0].name ?? 'N/A';

          this.totalSales = data.total - data.discount;
          this.totalDelivery = data.delivery;
          this.totalService = data.service;

          this.bestBrand =
            data.brand.length == 0
              ? 'N/A'
              : data.brand.sort((a: any, b: any) => b.value - a.value)[0].name;
          this.bestType =
            data.type.length == 0
              ? 'N/A'
              : data.type.sort((a: any, b: any) => b.value - a.value)[0].name;

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
      .post('report/sales', {
        month: this.date.value!.month() + 1,
        year: this.date.value!.year(),
        mode: 'download',
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
            worksheetData.push([
              index + 1,
              y.date,
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

          const range = xlsx.utils.decode_range(worksheet['!ref']!);
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[xlsx.utils.encode_cell({ r: 0, c: C })];
            if (cell) {
              cell.s = {
                font: {
                  bold: true,
                },
              };
            }
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
}
