import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ItemStock } from 'src/app/models/item.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { StockListReportComponent } from './stock-list-report/stock-list-report.component';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.css'],
})
export class StockListComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  isLoading: boolean = true;
  dataSource: ItemStock[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'mutation') {
      this.dynamicComponentService.createDynamicComponent(
        StockListReportComponent,
        {
          id: id,
        }
      );
    }
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
  }

  fetchProducts(page: number) {
    this.page = page;
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
}
