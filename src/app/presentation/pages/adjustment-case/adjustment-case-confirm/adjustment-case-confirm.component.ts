import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { AdjustmentCaseConfirmViewComponent } from './adjustment-case-confirm-view/adjustment-case-confirm-view.component';

@Component({
  selector: 'app-adjustment-case-confirm',
  templateUrl: './adjustment-case-confirm.component.html',
  styleUrls: ['./adjustment-case-confirm.component.css'],
})
export class AdjustmentCaseConfirmComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(page: number = this.page) {
    this.page = page;
    this.isLoading = true;
    this.apiService
      .get('adjustment-event/unconfirmed', {
        page: page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  changePage(page: PageEvent) {
    this.fetchData(page.pageIndex + 1);
  }

  viewAdjustmentCase(id: number) {
    this.dynamicComponentService
      .createDynamicComponent(AdjustmentCaseConfirmViewComponent, {
        id: id,
      })
      .subscribe((data) => {
        if (data != undefined && data != null) {
          // Remove where id = id
          const index = this.dataSource.findIndex((x) => x.id == data.id);
          if (index != -1) {
            this.dataSource.splice(index, 1);
            this.dataCount = this.dataCount - 1;
          }
        }
      });
  }
}
