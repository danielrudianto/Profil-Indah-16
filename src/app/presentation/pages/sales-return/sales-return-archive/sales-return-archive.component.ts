import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import moment from 'moment';
import { ArchiveMode } from 'src/app/presentation/components/archives/archives.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { SalesReturnArchiveFilterComponent } from './sales-return-archive-filter/sales-return-archive-filter.component';
import { ArchiveViewComponent } from 'src/app/presentation/components/archives/archive-view/archive-view.component';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';

@Component({
  selector: 'app-sales-return-archive',
  templateUrl: './sales-return-archive.component.html',
  styleUrls: ['./sales-return-archive.component.css'],
  animations: [slideInOutAnimation],
})
export class SalesReturnArchiveComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
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
    status: new FormControl('', Validators.required),
    dateType: new FormControl('', Validators.required),
  });

  ngOnInit(): void {}

  onMonthSelected(event: any) {
    this.mode = ArchiveMode.month;
    this.month = event.month;
    this.year = event.year;
    this.keyword = '';

    this.filterFormGroup.patchValue({
      // Start date from first day of the month till the end of month
      // Fetch all payment status and document status
      startDate: new Date(this.year!, this.month! - 1, 1),
      endDate: new Date(this.year!, this.month!, 0),
      dateType: new FormControl('bill', Validators.required),
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
      .post('sales-return/archives', {
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
        status: this.filterFormGroup.get('status')?.value,
        paymentStatus: this.filterFormGroup.get('paymentStatus')?.value,
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
    const filterComponent = this.dynamicComponentService.createDynamicComponent(
      SalesReturnArchiveFilterComponent,
      {
        month: this.month,
        year: this.year,
        startDate: this.filterFormGroup.get('startDate')?.value,
        endDate: this.filterFormGroup.get('endDate')?.value,
        dateType: this.filterFormGroup.get('dateType')?.value,
      }
    );

    filterComponent.subscribe((data) => {
      this.filterFormGroup.patchValue(data);
      this.fetchSelectedMonth(1);
    });
  }

  viewArchive(id: number) {
    this.dynamicComponentService.createDynamicComponent(ArchiveViewComponent, {
      route: 'sales-return',
      id: id,
    });
  }
}
