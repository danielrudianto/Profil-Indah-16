import { Component } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { CompanyModel } from 'src/app/models/company.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { CompanyUpdateComponent } from './company-update/company-update.component';
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
    selector: 'app-company',
    templateUrl: './company.component.html',
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, FeatureSearchComponent, NgIf, NgFor, EmptyTableComponent, MatProgressSpinner, MatPaginator, NgxMaskPipe, TranslatePipe]
})
export class CompanyComponent {
  constructor(private authService: AuthService, private dialog: MatDialog) {}

  isLoading: boolean = true;
  dataSource: CompanyModel[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(id: number) {
    this.dialog
      .open(CompanyUpdateComponent, {
        data: {
          id: id,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === 'deleted') {
          const index = this.dataSource.findIndex((x) => x.id === id);
          if (index != -1) {
            this.dataSource.splice(index, 1);
          }

          this.dataCount--;

          return;
        }

        if (data) {
          const index = this.dataSource.findIndex((x) => x.id === id);
          if (index != -1) {
            this.dataSource[index].name = data.name;
            this.dataSource[index].address = data.address;
            this.dataSource[index].npwp = data.npwp;
          }
        }
      });
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
