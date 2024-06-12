import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sales-chart',
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.css'],
})
export class SalesChartComponent {
  constructor(
    private translateService: TranslateService,
    private decimalPipe: DecimalPipe
  ) {}

  @Input('maxDate') maxDate!: number;
  @Input('data') data!: any[];

  dates: number[] = [];

  ngOnInit(): void {
    for (let i = 0; i < this.maxDate; i++) {
      this.dates.push(i + 1);
    }
  }

  ngOnChange(): void {
    for (let i = 0; i < this.maxDate; i++) {
      this.dates.push(i + 1);
    }
  }

  getValueOnDate(i: number): number {
    const index = this.data.findIndex((x) => x.date == i);
    return index == -1 ? 0 : this.data[index].value;
  }

  getCountOnDate(i: number): number {
    const index = this.data.findIndex((x) => x.date == i);
    return index == -1 ? 0 : this.data[index].count;
  }

  getValueTooltipOnDate(date: number): string {
    return `${this.decimalPipe.transform(this.getValueOnDate(date), '1.0-0')}`;
  }

  getCountTooltipOnDate(date: number): string {
    return `${this.decimalPipe.transform(this.getCountOnDate(date), '1.0-0')}`;
  }

  get maxValue(): number {
    return Math.max(...this.data.map((x) => x.value));
  }

  get maxCount(): number {
    return Math.max(...this.data.map((x) => x.count));
  }
}
