import { Component, Input } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from '../../../../components/dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../../../../components/dialog-header/dialog-header.component';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { EmptyTableComponent } from '../../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-receivable-payment-history',
    templateUrl: './receivable-payment-history.component.html',
    styleUrls: ['./receivable-payment-history.component.css'],
    imports: [DynamicDialogComponent, DialogHeaderComponent, NgIf, MatProgressSpinner, NgFor, MatMenuTrigger, MatMenu, MatMenuItem, EmptyTableComponent, DecimalPipe, TranslateModule]
})
export class ReceivablePaymentHistoryComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
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
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  dataSource: any[] = [];

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchPaymentHistory();
  }

  fetchPaymentHistory() {
    this.isLoading = true;
    this.apiService
      .get(`receivable/history/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
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

  deletePayment(id: number) {
    this.isSubmitting = true;
    this.apiService
      .delete('receivable/' + id)
      .subscribe({
        next: (data) => {
          const index = this.dataSource.findIndex((x) => x.id == id);
          this.dataSource.splice(index, 1);
          this.alertService.showSuccess(
            this.translateService.instant('payment-history__delete__successful')
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

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(
        this.dataSource.reduce((a: any, b: any) => {
          return a + Number(b.value);
        }, 0)
      );
    }, 300);
  }
}
