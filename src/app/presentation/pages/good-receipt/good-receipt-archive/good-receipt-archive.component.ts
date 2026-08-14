import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import moment from 'moment';
import { ArchiveViewComponent } from 'src/app/presentation/components/archives/archive-view/archive-view.component';
import { ArchiveMode } from 'src/app/presentation/components/archives/archives.component';
import { GoodReceiptArchiveFilterComponent } from 'src/app/presentation/pages/good-receipt/good-receipt-archive/good-receipt-archive-filter/good-receipt-archive-filter.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { slideInOutAnimation } from '../../../../animations/slide-in-out.animation';
import { MatDialog } from '@angular/material/dialog';
import { GoodReceiptViewComponent } from './good-receipt-view/good-receipt-view.component';
import { ArchivesComponent } from '../../../components/archives/archives.component';
import { ArchiveSearchComponent } from '../../../components/archives/archive-search/archive-search.component';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-good-receipt-archive',
    templateUrl: './good-receipt-archive.component.html',
    styleUrls: ['./good-receipt-archive.component.css'],
    animations: [slideInOutAnimation],
    imports: [ArchivesComponent, ArchiveSearchComponent, MatIcon, NgClass, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatPaginator, DatePipe, TranslateModule]
})
export class GoodReceiptArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog
  ) {}

  mode: ArchiveMode = ArchiveMode.year;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  isLoading: boolean = false;
  month: number | null = null;
  year: number | null = null;
  keyword: string = '';
  filterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    isActive: new FormControl(''),
    isDelete: new FormControl(''),
    isPending: new FormControl(''),
  });

  sortBy: string = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  ngOnInit(): void {}

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';

    this.filterFormGroup.patchValue({
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      isActive: true,
      isDelete: true,
      isPending: true,
    });

    this.fetchSelectedMonth(1);
  }

  /**
   * Fetches the selected month's sales invoice archives from the API.
   * @param {number} [page=this.page] - The page number of the results to fetch. Defaults to the current page.
   * @return {void} This function does not return anything.
   */
  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('good-receipt/archives', {
        month: this.month,
        year: this.year,
        page: this.page,
        keyword: this.keyword,
        // Convert to DD-MM-YYYY
        startDate: moment(
          new Date(this.filterFormGroup.get('startDate')?.value)
        ).format('YYYY-MM-DD'),
        endDate: moment(
          new Date(this.filterFormGroup.get('endDate')?.value)
        ).format('YYYY-MM-DD'),
        isActive: this.filterFormGroup.get('isActive')?.value,
        isDelete: this.filterFormGroup.get('isDelete')?.value,
        isPending: this.filterFormGroup.get('isPending')?.value,
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
    this.page = event.pageIndex + 1;
    this.fetchSelectedMonth();
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

  /**
   * Opens the filter component and subscribes to its data changes.
   * @return {void} This function does not return anything.
   */
  openFilter() {
    this.dialog
      .open(GoodReceiptArchiveFilterComponent, {
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
    const isActive = data.isActive;
    const isDelete = data.isDelete;
    const isPending = data.isPending;

    const maxDate = data.endDate;
    const minDate = data.startDate;
    const existingIsActive = this.filterFormGroup.value.isActive;
    const existingIsDelete = this.filterFormGroup.value.isDelete;
    const existingIsPending = this.filterFormGroup.value.isPending;

    const existingMinDate = this.filterFormGroup.value.startDate;
    const existingMaxDate = this.filterFormGroup.value.endDate;

    let response = false;

    if (isPending != existingIsPending) {
      response = true;
    }

    if (isActive != existingIsActive) {
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
    this.dialog.open(GoodReceiptViewComponent, {
      data: {
        id: id,
      },
    });
  }
}
