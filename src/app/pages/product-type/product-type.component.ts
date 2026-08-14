import { Component } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { ItemType } from 'src/app/models/item.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ProductTypeUpdateComponent } from './product-type-update/product-type-update.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../components/feature-header/feature-header.component';
import { FeatureSearchComponent } from '../../components/feature-search/feature-search.component';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { EmptyTableComponent } from '../../components/empty-table/empty-table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-product-type',
    templateUrl: './product-type.component.html',
    styleUrls: ['./product-type.component.scss'],
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, FeatureSearchComponent, NgIf, NgFor, MatMenuTrigger, MatMenu, MatMenuItem, MatIcon, EmptyTableComponent, MatProgressSpinner, MatPaginator, DatePipe, TranslatePipe]
})
export class ProductTypeComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog
  ) {}

  isLoading: boolean = true;
  dataSource: ItemType[] = [];
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
      const dialog = this.dynamicComponentService.createDynamicComponent(
        ProductTypeUpdateComponent,
        {
          id: id,
        }
      );

      dialog.subscribe({
        next: (data) => {
          if (data != undefined && data != null) {
            const index = this.dataSource.findIndex((x) => x.id == data.id);
            if (index != -1) {
              this.dataSource[index].name = data.name;
            }
          }
        },
      });
    } else if (dialogType == 'delete') {
      const index = this.dataSource.findIndex((x) => x.id == id);
      if (index != -1) {
        this.translateService
          .get(['general__delete-confirmation', 'general__delete-successfully'])
          .subscribe((data) => {
            const translation_1 = data['general__delete-confirmation'];
            const translation_2 = data['general__delete-successfully'];
            const dialog = this.dialog.open(DeleteConfirmationComponent, {
              data: {
                title: translation_1,
                document: `${this.dataSource[index].name}`,
              },
            });

            dialog.afterClosed().subscribe((result) => {
              if (result == true) {
                this.apiService.delete(`product-type/${id}`).subscribe({
                  next: (data: any) => {
                    this.dataSource.splice(index, 1);
                    this.alertService.showSuccess(
                      `${data.name} ${translation_2}`
                    );
                  },
                  error: (error) => {
                    this.alertService.showError(error);
                  },
                });
              }
            });
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
