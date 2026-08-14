import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { OverpaymentArchiveViewComponent } from './overpayment-archive-view/overpayment-archive-view.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-overpayment-archive',
    templateUrl: './overpayment-archive.component.html',
    styleUrl: './overpayment-archive.component.css',
    imports: [MatIcon, NgClass, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatPaginator, DecimalPipe, DatePipe, TranslateModule]
})
export class OverpaymentArchiveComponent {
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private alertService: AlertService
  ) {}

  isLoading: boolean = false;
  dataSource: any = [];
  dataCount: number = 0;
  page: number = 0;
  pageSize: number = 10;
  sortBy: string = 'date';
  sortDirection = 'asc';

  ngOnInit(): void {
    this.fetch(1);
  }

  fetch(page: number = this.page) {
    this.page = page;
    this.isLoading = true;
    this.apiService
      .get('overpayment', {
        page: page,
        pageSize: this.pageSize,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection,
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
    if (page.pageSize == this.pageSize) {
      this.fetch(1);
    } else {
      this.pageSize = page.pageSize;
      this.fetch(page.pageIndex + 1);
    }
  }

  changeSortBy(field: string) {
    if (this.isLoading) {
      return;
    }

    if (this.sortBy == field) {
      if (this.sortDirection == 'asc') {
        this.sortDirection = 'desc';
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }

    this.fetch(1);
  }

  openViewOverpayment(id: number) {
    this.dialog.open(OverpaymentArchiveViewComponent, {
      data: {
        id: id,
      },
    });
  }
}
