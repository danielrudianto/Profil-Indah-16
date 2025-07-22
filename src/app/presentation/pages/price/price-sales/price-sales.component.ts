import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PriceSalesUpdateComponent } from './price-sales-update/price-sales-update.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-price-sales',
  templateUrl: './price-sales.component.html',
  styleUrls: ['./price-sales.component.css'],
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
        console.log(data);
        if (data) {
          const dataIndex = this.dataSource.findIndex((x) => x.id == id);
          if (dataIndex != -1) {
            this.dataSource[dataIndex].sales_price = data.sales_price;
            this.dataSource[dataIndex].sales_discount = data.sales_discount;
          }
        }
      });
  }
}
