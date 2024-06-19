import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-salesman-selector',
  templateUrl: './salesman-selector.component.html',
  styleUrls: ['./salesman-selector.component.css'],
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
  dataCount: number = 0;
  page: number = 1;

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchSalesman();
  }

  fetchSalesman(page: number = this.page): void {
    this.page = page;
    this.isLoading = true;
    this.apiService
      .get('sales-invoice/salesman/pagination', {
        page: this.page,
      })
      .subscribe({
        next: (response: any) => {
          this.dataSource = response.data;
          this.dataCount = response.count;
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
      .post('sales-invoice/salesman/delete', {
        name: element,
      })
      .subscribe({
        next: (_) => {
          const index = this.dataSource.findIndex((x) => x == element);
          this.dataSource.splice(index, 1);
          this.dataCount = this.dataCount - 1;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  changePage(page: PageEvent) {
    this.page = page.pageIndex + 1;
    this.fetchSalesman();
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
