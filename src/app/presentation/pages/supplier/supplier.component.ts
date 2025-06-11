import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Supplier } from 'src/app/models/supplier.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { SupplierUpdateComponent } from './supplier-update/supplier-update.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css'],
})
export class SupplierComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  isLoading: boolean = true;
  dataSource: Supplier[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'edit') {
      this.dynamicComponentService.createDynamicComponent(
        SupplierUpdateComponent,
        {
          id: id,
        }
      );
    }
  }

  changePage(event: PageEvent) {
    if (this.pageSize != event.pageSize) {
      this.pageSize = event.pageSize;
      this.fetchProducts(1);
    } else {
      this.page = event.pageIndex + 1;
      this.fetchProducts(this.page);
    }
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
