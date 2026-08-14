import { Component } from '@angular/core';
import { AdjustmentCaseArchiveFilterComponent } from './adjustment-case-archive-filter/adjustment-case-archive-filter.component';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { ArchiveMode } from 'src/app/presentation/components/archives/archives.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { MatDialog } from '@angular/material/dialog';
import { AdjustmentCaseViewComponent } from './adjustment-case-view/adjustment-case-view.component';
import { ArchivesComponent } from '../../../components/archives/archives.component';
import { ArchiveSearchComponent } from '../../../components/archives/archive-search/archive-search.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-adjustment-case-archive',
    templateUrl: './adjustment-case-archive.component.html',
    styleUrls: ['./adjustment-case-archive.component.css'],
    animations: [slideInOutAnimation],
    imports: [ArchivesComponent, ArchiveSearchComponent, MatIcon, NgClass, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatPaginator, DatePipe, TranslatePipe]
})
export class AdjustmentCaseArchiveComponent {
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
    isConfirm: new FormControl(true),
    isReject: new FormControl(true),
    isPending: new FormControl(true),
    isLost: new FormControl(true),
    isFound: new FormControl(true),
  });

  sortBy: string = 'date';
  sortDirection = 'asc';

  ngOnInit(): void {}

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';

    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('adjustment-case/archives', {
        month: this.month,
        year: this.year,
        page: this.page,
        pageSize: this.pageSize,
        keyword: this.keyword,
        startDate: moment(
          new Date(this.filterFormGroup.get('startDate')?.value)
        ).format('YYYY-MM-DD'),
        endDate: moment(
          new Date(this.filterFormGroup.get('endDate')?.value)
        ).format('YYYY-MM-DD'),
        isConfirm: this.filterFormGroup.get('isConfirm')?.value,
        isReject: this.filterFormGroup.get('isReject')?.value,
        isPending: this.filterFormGroup.get('isPending')?.value,
        isLost: this.filterFormGroup.get('isLost')?.value,
        isFound: this.filterFormGroup.get('isFound')?.value,
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
    if (event.pageSize == this.pageSize) {
      this.page = event.pageIndex + 1;
      this.fetchSelectedMonth();
    } else {
      this.pageSize = event.pageSize;
      this.fetchSelectedMonth(1);
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
      .open(AdjustmentCaseArchiveFilterComponent, {
        data: {
          month: this.month,
          year: this.year,
          ...this.filterFormGroup.value,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        const change = this.checkChanges(data);
        if (change) {
          this.filterFormGroup.patchValue(data);
          this.fetchSelectedMonth(1);
        }
      });
  }

  private checkChanges(data: any) {
    const isConfirm = data.isConfirm;
    const isReject = data.isReject;
    const isPending = data.isPending;
    const isLost = data.isLost;
    const isFound = data.isFound;

    const maxDate = data.endDate;
    const minDate = data.startDate;

    const existingIsConfirm = this.filterFormGroup.value.isConfirm;
    const existingIsReject = this.filterFormGroup.value.isReject;
    const existingIsPending = this.filterFormGroup.value.isPending;

    const existingIsLost = this.filterFormGroup.value.isLost;
    const existingIsFound = this.filterFormGroup.value.isFound;

    const existingMinDate = this.filterFormGroup.value.startDate;
    const existingMaxDate = this.filterFormGroup.value.endDate;

    let response = false;

    if (isConfirm != existingIsConfirm) {
      response = true;
    }

    if (isReject != existingIsReject) {
      response = true;
    }

    if (isPending != existingIsPending) {
      response = true;
    }

    if (isLost != existingIsLost) {
      response = true;
    }

    if (isFound != existingIsFound) {
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
      .open(AdjustmentCaseViewComponent, {
        data: {
          id: id,
          print: true,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          const is_delete = data.is_delete;
          const is_confirm = data.is_confirm;

          const index = this.dataSource.findIndex((x) => x.id == id);
          if (index != -1) {
            this.dataSource[index].is_delete = is_delete;
            this.dataSource[index].is_confirm = is_confirm;
          }
        }
      });
  }
}
