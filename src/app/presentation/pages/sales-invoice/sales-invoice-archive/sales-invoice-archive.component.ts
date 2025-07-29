import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { ArchiveMode } from 'src/app/presentation/components/archives/archives.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { SalesInvoiceArchiveFilterComponent } from './sales-invoice-archive-filter/sales-invoice-archive-filter.component';
import { FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { SalesInvoiceViewComponent } from './sales-invoice-view/sales-invoice-view.component';

@Component({
  selector: 'app-sales-invoice-archive',
  templateUrl: './sales-invoice-archive.component.html',
  styleUrls: ['./sales-invoice-archive.component.css'],
  animations: [slideInOutAnimation],
})
export class SalesInvoiceArchiveComponent {
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
    isPaid: new FormControl(''),
    isUnpaid: new FormControl(''),
    isActive: new FormControl(''),
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
      isPaid: true,
      isUnpaid: true,
      isActive: true,
      isDelete: true,
    });

    this.fetchSelectedMonth(1);
  }

  fetchSelectedMonth(page: number = this.page) {
    this.page = page;
    this.isLoading = true;

    this.apiService
      .post('sales-invoice/archives', {
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
        isPaid: this.filterFormGroup.get('isPaid')?.value,
        isUnpaid: this.filterFormGroup.get('isUnpaid')?.value,
        isActive: this.filterFormGroup.get('isActive')?.value,
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
      .open(SalesInvoiceArchiveFilterComponent, {
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
    const isActive = data.isActive;
    const isDelete = data.isDelete;

    const maxDate = data.endDate;
    const minDate = data.startDate;

    const existingIsPaid = this.filterFormGroup.value.isPaid;
    const existingIsUnpaid = this.filterFormGroup.value.isUnpaid;
    const existingIsActive = this.filterFormGroup.value.isActive;
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
    this.dialog.open(SalesInvoiceViewComponent, {
      data: {
        id: id,
      },
    });
    // this.dynamicComponentService.createDynamicComponent(ArchiveViewComponent, {
    //   route: 'sales-invoice',
    //   id: id,
    // });
  }
}
