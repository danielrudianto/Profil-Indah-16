import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Package } from 'src/app/models/item.model';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { FeatureSearchComponent } from '../../../components/feature-search/feature-search.component';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-package-list',
    templateUrl: './package-list.component.html',
    styleUrls: ['./package-list.component.css'],
    imports: [FeatureSearchComponent, NgIf, NgFor, MatMenuTrigger, MatMenu, MatMenuItem, MatIcon, EmptyTableComponent, MatProgressSpinner, MatPaginator, DecimalPipe, TranslatePipe]
})
export class PackageListComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  isLoading: boolean = true;
  dataSource: Package[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'edit') {
      this.router.navigate(['Edit', id], {
        relativeTo: this.activatedRoute,
      });
    }

    if (dialogType == 'delete') {
      const index = this.dataSource.findIndex((item) => item.id == id);
      this.dialog
        .open(DeleteConfirmationComponent, {
          data: {
            title: this.translateService.instant(
              'package__delete__confirmation'
            ),
            document: this.dataSource[index].name,
          },
        })
        .afterClosed()
        .subscribe((result) => {
          if (result == true) {
            this.apiService.delete(`product-package/${id}`).subscribe({
              next: (data) => {
                this.alertService.showSuccess(
                  this.translateService.instant('package__delete__success')
                );
                this.dataSource.splice(index, 1);
                this.dataCount = this.dataCount - 1;
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            });
          }
        });
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
