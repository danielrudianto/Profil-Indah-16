import { DecimalPipe, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-sales-value-chart',
    templateUrl: './sales-value-chart.component.html',
    styleUrls: ['./sales-value-chart.component.css'],
    imports: [NgFor, MatTooltip, TranslateModule]
})
export class SalesValueChartComponent {
  constructor(
    private translateService: TranslateService,
    private decimalPipe: DecimalPipe
  ) {}

  @Input('maxDate') maxDate!: number;
  @Input('data') data!: any[];

  dates: number[] = [];
  columnNumber: number = 3;

  ngOnInit(): void {
    this.dates = [];
    for (let i = 0; i < this.maxDate; i++) {
      this.dates.push(i + 1);
    }
  }

  ngOnChanges(): void {
    this.dates = [];
    for (let i = 0; i < this.maxDate; i++) {
      this.dates.push(i + 1);
    }
  }

  getValueOnDate(i: number): number {
    const index = this.data.findIndex((x) => x.date == i);
    return index == -1 ? 0 : this.data[index].value;
  }

  getDeliveryOnDate(i: number): number {
    const index = this.data.findIndex((x) => x.date == i);
    return index == -1 ? 0 : this.data[index].delivery;
  }

  getServiceOnDate(i: number): number {
    const index = this.data.findIndex((x) => x.date == i);
    return index == -1 ? 0 : this.data[index].service;
  }

  getDiscountOnDate(i: number): number {
    const index = this.data.findIndex((x) => x.date == i);
    return index == -1 ? 0 : this.data[index].discount;
  }

  getValueTooltipOnDate(date: number): string {
    return ` ${this.decimalPipe.transform(this.getValueOnDate(date), '1.0-0')}`;
  }

  getServiceTooltipOnDate(date: number): string {
    return ` ${this.decimalPipe.transform(
      this.getServiceOnDate(date),
      '1.0-0'
    )}`;
  }

  getDiscountTooltipOnDate(date: number): string {
    return ` ${this.decimalPipe.transform(
      this.getDiscountOnDate(date),
      '1.0-0'
    )}`;
  }

  getDeliveryTooltipOnDate(date: number): string {
    return ` ${this.decimalPipe.transform(
      this.getDeliveryOnDate(date),
      '1.0-0'
    )}`;
  }

  get maxValue(): number {
    // Maximum of either delivery, discount, service, or value
    return Math.max(...this.data.map((x) => x.value));
  }

  get maxDiscount(): number {
    return Math.max(...this.data.map((x) => x.discount));
  }

  get maxDelivery(): number {
    return Math.max(...this.data.map((x) => x.delivery));
  }

  get maxService(): number {
    return Math.max(...this.data.map((x) => x.service));
  }
}
