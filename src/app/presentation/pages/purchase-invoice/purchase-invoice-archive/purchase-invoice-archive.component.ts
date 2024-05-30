import { Component } from '@angular/core';
import { PurchaseInvoiceArchiveFilterComponent } from './purchase-invoice-archive-filter/purchase-invoice-archive-filter.component';
import { PageEvent } from '@angular/material/paginator';
import moment from 'moment';
import { ArchiveMode } from 'src/app/presentation/components/archives/archives.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ArchiveViewComponent } from 'src/app/presentation/components/archives/archive-view/archive-view.component';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';

@Component({
  selector: 'app-purchase-invoice-archive',
  templateUrl: './purchase-invoice-archive.component.html',
  styleUrls: ['./purchase-invoice-archive.component.css'],
  animations: [slideInOutAnimation],
})
export class PurchaseInvoiceArchiveComponent {
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
    paymentStatus: new FormControl('', Validators.required),
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
      status: 0,
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
      .post('purchase-invoice/archives/v2', {
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
      PurchaseInvoiceArchiveFilterComponent,
      {
        month: this.month,
        year: this.year,
        startDate: this.filterFormGroup.get('startDate')?.value,
        endDate: this.filterFormGroup.get('endDate')?.value,
        status: this.filterFormGroup.get('status')?.value,
      }
    );

    filterComponent.subscribe((data) => {
      this.filterFormGroup.patchValue(data);
      this.fetchSelectedMonth(1);
    });
  }

  viewArchive(id: number) {
    this.dynamicComponentService.createDynamicComponent(ArchiveViewComponent, {
      route: 'purchase-invoice',
      id: id,
    });
  }
}
