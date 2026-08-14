import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import moment from 'moment';
import { ArchiveMode } from 'src/app/presentation/components/archives/archives.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DepositArchiveFilterComponent } from './deposit-archive-filter/deposit-archive-filter.component';
import { DepositViewComponent } from '../deposit-view/deposit-view.component';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { ArchivesComponent } from '../../../components/archives/archives.component';
import { ArchiveSearchComponent } from '../../../components/archives/archive-search/archive-search.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-deposit-archive',
    templateUrl: './deposit-archive.component.html',
    styleUrls: ['./deposit-archive.component.css'],
    animations: [slideInOutAnimation],
    imports: [ArchivesComponent, ArchiveSearchComponent, MatIcon, NgClass, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatPaginator, DatePipe, TranslateModule]
})
export class DepositArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  mode: ArchiveMode = ArchiveMode.year;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  isLoading: boolean = false;
  month: number | null = null;
  year: number | null = null;
  keyword: string = '';
  filterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    isPending: new FormControl(''),
    isDelete: new FormControl(''),
  });

  sortBy: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {}

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';
    this.pageSize = 10;

    this.filterFormGroup.patchValue({
      // Start date from first day of the month till the end of month
      // Fetch all payment status and document status
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isPending: true,
      isDelete: true,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('sales-deposit/archives', {
        month: this.month,
        year: this.year,
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.keyword,
        // Convert to DD-MM-YYYY
        startDate: moment(
          new Date(this.filterFormGroup.get('startDate')?.value)
        ).format('YYYY-MM-DD'),
        endDate: moment(
          new Date(this.filterFormGroup.get('endDate')?.value)
        ).format('YYYY-MM-DD'),
        isPending: this.filterFormGroup.get('isPending')?.value,
        isDelete: this.filterFormGroup.get('isDelete')?.value,
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

  changePage(event: PageEvent) {
    if (event.pageSize != this.pageSize) {
      this.pageSize = event.pageSize;
      this.fetchSelectedMonth(1);
    } else {
      this.page = event.pageIndex + 1;
      this.fetchSelectedMonth();
    }
  }

  backToYear() {
    this.mode = ArchiveMode.year;
    this.month = null;
    this.year = null;
  }

  onQueryChanged(event: string) {
    this.keyword = event;
    this.fetchSelectedMonth(1);
  }

  openFilter() {
    this.dialog
      .open(DepositArchiveFilterComponent, {
        data: {
          month: this.month,
          year: this.year,
          ...this.filterFormGroup.value,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        // Check if it is the same
        const change = this.checkChanges(data);
        if (change) {
          this.filterFormGroup.patchValue(data);
          this.fetchSelectedMonth(1);
        }
      });
  }

  private checkChanges(data: any) {
    const isPaid = data.isPaid;
    const isUnpaid = data.isUnpaid;
    const isPending = data.isPending;
    const isDelete = data.isDelete;

    const maxDate = data.endDate;
    const minDate = data.startDate;

    const existingIsPaid = this.filterFormGroup.value.isPaid;
    const existingIsUnpaid = this.filterFormGroup.value.isUnpaid;
    const existingIsPending = this.filterFormGroup.value.isPending;
    const existingIsDelete = this.filterFormGroup.value.isDelete;

    const existingMinDate = this.filterFormGroup.value.startDate;
    const existingMaxDate = this.filterFormGroup.value.endDate;

    let response = false;

    if (isPaid != existingIsPaid) {
      response = true;
    }

    if (isUnpaid != existingIsUnpaid) {
      response = true;
    }

    if (isPending != existingIsPending) {
      response = true;
    }

    if (isDelete != existingIsDelete) {
      response = true;
    }

    if (existingMinDate.getTime() != minDate.getTime()) {
      response = true;
    }

    if (existingMaxDate.getTime() != maxDate.getTime()) {
      response = true;
    }

    return response;
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

    this.fetchSelectedMonth(1);
  }

  viewArchive(id: number) {
    this.dialog
      .open(DepositViewComponent, {
        data: {
          id: id,
          noAction: false,
          print: true,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        switch (data) {
          case 'deleted':
            const index = this.dataSource.findIndex((x) => x.id == id);
            this.dataSource[index].isDelete = true;
        }
      });
  }
}
