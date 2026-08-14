import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { sortSVGAnimation } from 'src/app/animations/sort-svg.animation';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ApiService } from '../../../../../services/api.service';
import { AlertService } from '../../../../../services/alert.service';

@Component({
    selector: 'app-brand-sales-chart',
    templateUrl: './brand-sales-chart.component.html',
    styleUrls: ['./brand-sales-chart.component.css'],
    animations: [panelAnimation, sortSVGAnimation],
    standalone: false
})
export class BrandSalesChartComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      month: number;
      year: number;
    },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<BrandSalesChartComponent>
  ) {}

  isOpened: boolean = false;
  sortedBy: string = 'value';
  sortedDirection: string = 'desc';
  dataSource: any[] = [];

  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchBrandDataSales();
  }

  fetchBrandDataSales() {
    this.isLoading = true;
    this.apiService
      .get('report/sales/brand', {
        month: this.data.month,
        year: this.data.year,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialog.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  getPercentage(i: number) {
    return (this.dataSource[i].value * 100) / this.total;
  }

  get total(): number {
    return this.dataSource.reduce((a, b) => {
      return a + b.value;
    }, 0);
  }
}
