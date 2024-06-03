import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-purchase-invoice-confirm',
  templateUrl: './purchase-invoice-confirm.component.html',
  styleUrls: ['./purchase-invoice-confirm.component.css'],
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
