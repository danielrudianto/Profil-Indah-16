import { Component } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Supplier } from 'src/app/models/supplier.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { SupplierUpdateComponent } from './supplier-update/supplier-update.component';
import { MatDialog } from '@angular/material/dialog';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../components/feature-header/feature-header.component';
import { FeatureSearchComponent } from '../../components/feature-search/feature-search.component';
import { NgIf, NgFor } from '@angular/common';
import { EmptyTableComponent } from '../../components/empty-table/empty-table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgxMaskPipe } from 'ngx-mask';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-supplier',
    templateUrl: './supplier.component.html',
    styleUrls: ['./supplier.component.css'],
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, FeatureSearchComponent, NgIf, NgFor, EmptyTableComponent, MatProgressSpinner, MatPaginator, NgxMaskPipe, TranslatePipe]
})
export class SupplierComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog
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

  openDialog(id: number) {
    this.dialog
      .open(SupplierUpdateComponent, {
        data: {
          id: id,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === 'deleted') {
          const index = this.dataSource.findIndex(
            (item) => item.id === result.id
          );

          this.dataSource.splice(index, 1);
          return;
        } else if (result) {
          const index = this.dataSource.findIndex(
            (item) => item.id === result.id
          );
          this.dataSource[index].name = result.name;
          this.dataSource[index].address = result.address;
          this.dataSource[index].npwp = result.npwp;
          return;
        }
      });
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
