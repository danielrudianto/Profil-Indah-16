import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { AdjustmentCaseConfirmViewComponent } from './adjustment-case-confirm-view/adjustment-case-confirm-view.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-adjustment-case-confirm',
    templateUrl: './adjustment-case-confirm.component.html',
    styleUrls: ['./adjustment-case-confirm.component.css'],
    standalone: false
})
export class AdjustmentCaseConfirmComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog
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
      .get('adjustment-case/unconfirmed', {
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
    this.dialog
      .open(AdjustmentCaseConfirmViewComponent, {
        data: {
          id: id,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          // Remove where id = id
          const index = this.dataSource.findIndex((x) => x.id == result.id);
          if (index != -1) {
            this.dataSource.splice(index, 1);
            this.dataCount = this.dataCount - 1;
          }
        }
      });
  }
}
