import { Component } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { FeatureSearchComponent } from '../../../components/feature-search/feature-search.component';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { RouterLink } from '@angular/router';
import { AvatarComponent } from '../../../components/avatar/avatar.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-purchase-invoice-confirm',
    templateUrl: './purchase-invoice-confirm.component.html',
    styleUrls: ['./purchase-invoice-confirm.component.css'],
    imports: [FeatureSearchComponent, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, RouterLink, AvatarComponent, MatPaginator, DatePipe, TranslatePipe]
})
export class PurchaseInvoiceConfirmComponent {
  dataSource: any[] = [];
  dataCount: number = 0;
  isLoading: boolean = false;
  page: number = 1;

  onUpdatePage() {
    this.page = 1;
  }

  onUpdateData(data: any) {
    this.dataCount = data.count;
    this.dataSource = data.data;
  }

  onUpdateLoadingStatus(data: any) {
    this.isLoading = data;
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
  }
}
