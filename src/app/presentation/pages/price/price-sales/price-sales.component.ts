import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PriceSalesUpdateComponent } from './price-sales-update/price-sales-update.component';

@Component({
  selector: 'app-price-sales',
  templateUrl: './price-sales.component.html',
  styleUrls: ['./price-sales.component.css'],
})
export class PriceSalesComponent {
  constructor(
    private router: Router,
    private dynamicComponentService: DynamicComponentService
  ) {}

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
    this.dynamicComponentService.createDynamicComponent(
      PriceSalesUpdateComponent,
      {
        id: id,
      }
    );
  }
}
