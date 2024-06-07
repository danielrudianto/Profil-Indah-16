import { Component } from '@angular/core';
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
  index: number = 0;

  lineChartData: Chart.ChartDataset[] = [];
  lineChartLabels: string[] = ['January', 'February', 'March', 'April', 'May'];
  lineChartOptions: any = {
    responsive: true,
  };
  lineChartLegend = false;
  lineChartType: ChartType = 'line';

  brandChartData: Chart.ChartDataset[] = [];
  brandChartLabels: string[] = [];
  brandChartOptions: any = {
    responsive: true,
    cutout: '50%',
    circumference: 360,
  };
  brandChartLegend = false;
  brandChartType: ChartType = 'doughnut';

  typeChartData: Chart.ChartDataset[] = [];
  typeChartLabels: string[] = [];
  typeChartOptions: any = {
    responsive: true,
  };
  typeChartLegend = false;
  typeChartType: ChartType = 'doughnut';

  ngOnInit(): void {
    this.fetchSalesReport();
    this.lineChartData = [
      {
        label: 'Sales',
        fill: false,
        tension: 0.1,
        borderCapStyle: 'butt',
        borderDash: [],
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        borderJoinStyle: 'miter',
        data: [0, 2, 30, 5, 10],
      },
    ];
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
          const chart: any = this.ngChartjsService.getChart('testChart');
          let [brandData, brandLabel] = this.transformBrandData(data.brand);
          this.brandChartLabels = brandLabel;
          this.brandChartData = [
            {
              label: 'Sales',
              data: brandData,
              backgroundColor: [
                'rgba(171, 196, 255, 1)',
                'rgba(223, 231, 253, 1)',
                'rgba(240, 239, 235, 1)',
                'rgba(190, 225, 230, 1)',
                'rgba(226, 236, 233, 1)',
                'rgba(255, 241, 230, 1)',
              ],
              hoverBackgroundColor: [
                'rgba(171, 196, 255, 1)',
                'rgba(223, 231, 253, 1)',
                'rgba(240, 239, 235, 1)',
                'rgba(190, 225, 230, 1)',
                'rgba(226, 236, 233, 1)',
                'rgba(255, 241, 230, 1)',
              ],
            },
          ];

          let typeData = [...data.type];
          const typeChartData =
            typeData.length > 5
              ? [
                  ...typeData.splice(0, 5).map((x: any) => x.value),
                  // Sum of the other
                  typeData.reduce((a: any, b: any) => a + b.value, 0),
                ]
              : typeData.map((x: any) => x.value);

          this.typeChartData = [
            {
              label: 'Sales',
              data: typeChartData,
            },
          ];

          typeData = [...data.type];

          this.typeChartLabels =
            typeData.length > 5
              ? [...typeData.splice(0, 5).map((x: any) => x.name), 'Other']
              : typeData.map((x: any) => x.name);
        },
      })
      .add(() => {
        this.isLoading = false;
        this.ngChartjsService.getChart('brand').update();
      });
  }

  // Get 2 variables, an array of number and an array of string
  transformBrandData(data: any[]): [number[], string[]] {
    let brandData = [...data];
    const brandChartData =
      brandData.length > 5
        ? [
            ...brandData.splice(0, 5).map((x: any) => x.value),
            // Sum of the other
            brandData.reduce((a: any, b: any) => a + b.value, 0),
          ]
        : brandData.map((x: any) => x.value);

    brandData = [...data];

    const brandChartLabels =
      brandData.length > 5
        ? [...brandData.splice(0, 5).map((x: any) => x.name), 'Other']
        : brandData.map((x: any) => x.name);

    return [brandChartData, brandChartLabels];
  }

  transformTypeData(data: any[]): any {}
}
