import { Component } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from '../../components/dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../../components/dialog-header/dialog-header.component';
import { CountUpDirective } from '../../directives/count-up.directive';
import { MatDivider } from '@angular/material/divider';
import { NgFor, UpperCasePipe, DecimalPipe } from '@angular/common';
import { CircleAvatarComponent } from '../../components/circle-avatar/circle-avatar.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-report-inventory',
    templateUrl: './report-inventory.component.html',
    styleUrls: ['./report-inventory.component.css'],
    imports: [DynamicDialogComponent, DialogHeaderComponent, CountUpDirective, MatDivider, NgFor, CircleAvatarComponent, UpperCasePipe, DecimalPipe, TranslatePipe]
})
export class ReportInventoryComponent {
  isOpened: boolean = false;
  isLoading: boolean = true;
  data: any[] = [];
  value: number = 0;
  isDownloading: boolean = false;

  constructor(
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.isOpened = true;

    this.apiService
      .get('report/inventory')
      .subscribe({
        next: (data: any) => {
          this.data = data;
          this.value = data.reduce((a: any, b: any) => {
            return a + b.value;
          }, 0);
        },
        error: (error) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  download() {
    this.isDownloading = true;
    this.apiService
      .get('report/inventory/download')
      .subscribe({
        next: (data: any) => {
          // Create an excel file
          const replacer = (key: string, value: any) =>
            value === null ? '' : value;

          const header = [
            'reference',
            'description',
            'brand',
            'type',
            'quantity',
            'unit',
            'value',
          ];

          const csv = data.map((row: any) =>
            header
              .map((fieldName) => JSON.stringify(row[fieldName], replacer))
              .join(',')
          );

          csv.unshift(header.join(','));
          const csvArray = csv.join('\r\n');
          const a = document.createElement('a');
          const blob = new Blob([csvArray], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);

          a.href = url;
          a.download = `Inventory report ${new Date().toLocaleDateString()}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
      });
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
