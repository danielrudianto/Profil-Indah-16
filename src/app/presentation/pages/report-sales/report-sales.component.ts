import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import * as Chart from 'chart.js';
import { ChartType } from 'chart.js';
import { NgChartjsService } from 'ng-chartjs';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-report-sales',
  templateUrl: './report-sales.component.html',
  styleUrls: ['./report-sales.component.css'],
  animations: [slideInOutAnimation],
})
export class ReportSalesComponent {
  constructor(
    private translateService: TranslateService,
    private apiService: ApiService,
    private ngChartjsService: NgChartjsService
  ) {}

  isLoading: boolean = false;
  transactions: number = 0;

  chartDataSource: any[] = [];
  customerCount: number = 0;
  bestSales: string = 'N/A';
  bestBrand: string = 'N/A';
  bestType: string = 'N/A';

  ngOnInit(): void {
    this.fetchSalesReport();
  }

  fetchSalesReport(): void {
    this.isLoading = true;
    this.apiService
      .post('report/sales', {
        month: 5,
        year: 2024,
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
                })[0].name;

          this.bestBrand =
            data.brand.length == 0
              ? 'N/A'
              : data.brand.sort((a: any, b: any) => b.value - a.value)[0].name;
          this.bestType =
            data.type.length == 0
              ? 'N/A'
              : data.type.sort((a: any, b: any) => b.value - a.value)[0].name;
        },
      })
      .add(() => {
        this.isLoading = false;
        this.ngChartjsService.getChart('brand').update();
      });
  }
}
