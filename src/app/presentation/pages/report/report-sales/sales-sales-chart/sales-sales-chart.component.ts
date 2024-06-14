import { Component, Input } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { sortSVGAnimation } from 'src/app/animations/sort-svg.animation';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-sales-sales-chart',
  templateUrl: './sales-sales-chart.component.html',
  styleUrls: ['./sales-sales-chart.component.css'],
  animations: [panelAnimation, sortSVGAnimation],
})
export class SalesSalesChartComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  isOpened: boolean = false;
  sortedBy: string = 'value';
  sortedDirection: string = 'desc';
  dataSource: any[] = [];

  ngOnInit(): void {
    this.isOpened = true;
    this.dataSource = this.data;
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  get total(): number {
    return this.data.reduce((acc: any, curr: any) => {
      return acc + Number(curr.value);
    }, 0);
  }

  sortBy(column: string) {
    if (column == this.sortedBy) {
      this.sortedDirection = this.sortedDirection == 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedBy = column;
      this.sortedDirection = 'asc';
    }

    this.dataSource = this.dataSource.sort((a: any, b: any) => {
      const valueA = a[this.sortedBy];
      const valueB = b[this.sortedBy];

      let comparison = 0;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        // Numeric comparison
        comparison = valueA - valueB;
      } else if (typeof valueA === 'string' && typeof valueB === 'string') {
        // String comparison
        comparison = valueA.localeCompare(valueB);
      } else {
        // Fallback comparison
        comparison = `${valueA}`.localeCompare(`${valueB}`);
      }

      return this.sortedDirection === 'asc' ? comparison : -comparison;
    });
  }
}
