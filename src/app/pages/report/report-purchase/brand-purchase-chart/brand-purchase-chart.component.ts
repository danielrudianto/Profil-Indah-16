import { Component, Input } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { sortSVGAnimation } from 'src/app/animations/sort-svg.animation';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from '../../../../components/dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../../../../components/dialog-header/dialog-header.component';
import { MatRipple } from '@angular/material/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { EmptyTableComponent } from '../../../../components/empty-table/empty-table.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-brand-purchase-chart',
    templateUrl: './brand-purchase-chart.component.html',
    styleUrls: ['./brand-purchase-chart.component.scss'],
    animations: [panelAnimation, sortSVGAnimation],
    imports: [DynamicDialogComponent, DialogHeaderComponent, MatRipple, NgIf, EmptyTableComponent, NgFor, DecimalPipe, TranslatePipe]
})
export class BrandPurchaseChartComponent {
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
