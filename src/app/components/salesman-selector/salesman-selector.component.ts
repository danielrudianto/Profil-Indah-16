import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from '../dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { NgIf, NgFor } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-salesman-selector',
    templateUrl: './salesman-selector.component.html',
    styleUrls: ['./salesman-selector.component.scss'],
    imports: [DynamicDialogComponent, DialogHeaderComponent, NgIf, MatProgressSpinner, NgFor, MatMenuTrigger, MatMenu, MatMenuItem, MatIcon, TranslatePipe]
})
export class SalesmanSelectorComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private _hotKeysService: HotkeysService,
    private alertService: AlertService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  isOpened: boolean = false;
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  dataSource: any[] = [];

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchSalesman();
  }

  fetchSalesman(): void {
    this.isLoading = true;
    this.apiService
      .get('salesman/all', {})
      .subscribe({
        next: (response: any) => {
          this.dataSource = response;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  deleteSalesman(element: string) {
    this.isSubmitting = true;
    this.apiService
      .post('salesman/delete', {
        name: element,
      })
      .subscribe({
        next: (_) => {
          const index = this.dataSource.findIndex((x) => x == element);
          this.dataSource.splice(index, 1);
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
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
