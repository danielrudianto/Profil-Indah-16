import { Component } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PriceSalesUpdateComponent } from './price-sales-update/price-sales-update.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionHeaderComponent } from '../../../components/transaction-header/transaction-header.component';
import { FeatureSearchComponent } from '../../../components/feature-search/feature-search.component';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-price-sales',
    templateUrl: './price-sales.component.html',
    styleUrls: ['./price-sales.component.css'],
    imports: [TransactionHeaderComponent, FeatureSearchComponent, NgIf, EmptyTableComponent, NgFor, MatPaginator, DecimalPipe, TranslatePipe]
})
export class PriceSalesComponent {
  constructor(private router: Router, private dialog: MatDialog) {}

  isLoading: boolean = false;
  backRoute: string = this.router.url;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;

  ngOnInit(): void {
    const url = this.router.url;
    const urlSegments = url.split('/');
    urlSegments.pop();
    urlSegments.pop();

    this.backRoute = urlSegments.join('/');
  }

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

  openUpdatePriceDialog(id: number): void {
    this.dialog
      .open(PriceSalesUpdateComponent, {
        data: {
          id: id,
        },
      })
      .afterClosed()
      .subscribe((data: any) => {
        if (data) {
          const index = this.dataSource.findIndex((x) => x.id == id);
          if (index != -1) {
            this.dataSource[index].sales_price = data[0].price;
            this.dataSource[index].sales_discount = data[0].discount;
          }
        }
      });
  }
}
