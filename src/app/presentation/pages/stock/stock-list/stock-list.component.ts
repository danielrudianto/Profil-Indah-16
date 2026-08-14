import { Component } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StockListReportComponent } from '../stock-list-report/stock-list-report.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../components/feature-header/feature-header.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-stock-list',
    templateUrl: './stock-list.component.html',
    styleUrls: ['./stock-list.component.css'],
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatIconButton, MatIcon, MatPaginator, DecimalPipe, TranslatePipe]
})
export class StockListComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  isLoading: boolean = true;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  searchFormGroup: FormGroup = new FormGroup({
    searchBar: new FormControl(''),
  });

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();

    this.activatedRoute.queryParams.subscribe(() => {
      this.fetchProducts();
    });

    const page = this.route.snapshot.queryParams['page'] ?? 1;
    const pageSize = this.route.snapshot.queryParams['pageSize'] ?? 10;
    const keyword = this.route.snapshot.queryParams['keyword'] ?? '';

    this.searchFormGroup.patchValue(
      {
        searchBar: keyword,
      },
      {
        emitEvent: false,
      }
    );

    this.page = page;
    this.pageSize = pageSize;

    this.searchFormGroup.controls['searchBar'].valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: {
            keyword: this.searchFormGroup.controls['searchBar'].value,
            page: 1,
            pageSize: this.pageSize,
          },
          queryParamsHandling: 'merge',
        });
      });
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'mutation') {
      this.dialog.open(StockListReportComponent, {
        data: {
          id: id,
        },
      });
    }

    if (dialogType == 'card') {
      const url = this.router.url;

      this.router.navigate(['Card', id], {
        relativeTo: this.route,
        queryParams: {
          backLocation: url,
        },
      });
    }
  }

  changePage(event: PageEvent) {
    if (event.pageSize == this.pageSize) {
      this.page = event.pageIndex + 1;
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          keyword: this.searchFormGroup.controls['searchBar'].value,
          page: event.pageIndex + 1,
          pageSize: this.pageSize,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.pageSize = event.pageSize;
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          keyword: this.searchFormGroup.controls['searchBar'].value,
          page: 1,
          pageSize: this.pageSize,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  fetchProducts() {
    this.isLoading = true;

    const page = this.route.snapshot.queryParams['page'] ?? 1;
    const pageSize = this.route.snapshot.queryParams['pageSize'] ?? 10;
    const keyword = this.route.snapshot.queryParams['keyword'] ?? '';

    this.page = page;
    this.pageSize = pageSize;

    this.apiService
      .get('product-stock', {
        page: Number(page),
        pageSize: Number(pageSize),
        keyword: keyword,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
