import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { Item } from 'src/app/models/item.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { UpdateProductComponent } from './update-product/update-product.component';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../components/feature-header/feature-header.component';
import { FeatureSearchComponent } from '../../components/feature-search/feature-search.component';
import { NgIf, NgFor } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { EmptyTableComponent } from '../../components/empty-table/empty-table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, FeatureSearchComponent, NgIf, NgFor, MatMenuTrigger, MatMenu, MatMenuItem, MatIcon, EmptyTableComponent, MatProgressSpinner, MatPaginator, TranslatePipe]
})
export class ProductComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService,
    private translate: TranslateService
  ) {}

  isLoading: boolean = true;
  isSubmitting: boolean = false;
  dataSource: Item[] = [];
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
      this.dialog
        .open(UpdateProductComponent, {
          data: {
            id: id,
          },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            const index = this.dataSource.findIndex((x) => x.id == id);
            if (index != -1) {
              this.dataSource[index].reference = data.reference;
              this.dataSource[index].description = data.description;
              this.dataSource[index].product_brand = data.product_brand;
              this.dataSource[index].product_type = data.product_type;
              this.dataSource[index].is_active = data.is_active;
            }
          }
        });
    } else if (dialogType == 'delete') {
      const index = this.dataSource.findIndex((x) => x.id == id);
      if (index != -1) {
        const dialog = this.dialog.open(DeleteConfirmationComponent, {
          data: {
            title: this.translate.instant('product__delete__title'),
            document: `${this.dataSource[index].reference} - ${this.dataSource[index].description}`,
          },
        });

        dialog.afterClosed().subscribe((data) => {
          if (data == true) {
            this.apiService.delete(`product/${id}`).subscribe({
              next: (_) => {
                this.dataSource.splice(index, 1);
                this.dataCount = this.dataCount - 1;
                this.alertService.showSuccess(
                  this.translate.instant('product__deleted-successfully')
                );
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            });
          }
        });
      }
    } else if (dialogType == 'active') {
      const index = this.dataSource.findIndex((x) => x.id == id);
      if (index != -1) {
        this.isSubmitting = true;
        this.apiService
          .put('product/active', {
            id: id,
          })
          .subscribe({
            next: (data: any) => {
              this.dataSource[index].is_active =
                !this.dataSource[index].is_active;
              this.translate
                .get('general__updated-successfully')
                .subscribe((translation) => {
                  this.alertService.showSuccess(
                    `${data.reference} ${translation}`
                  );
                });
            },
            error: (error) => {
              this.alertService.showError(error);
            },
          })
          .add(() => {
            this.isSubmitting = false;
          });
      }
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
