import { Component, Input } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { StockCardViewComponent } from './stock-card-view/stock-card-view.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SalesReturnArchiveViewComponent } from '../../sales-return/sales-return-archive/sales-return-archive-view/sales-return-archive-view.component';
import { SalesInvoiceViewComponent } from '../../sales-invoice/sales-invoice-archive/sales-invoice-view/sales-invoice-view.component';
import { GoodReceiptViewComponent } from '../../good-receipt/good-receipt-archive/good-receipt-view/good-receipt-view.component';
import { AdjustmentCaseViewComponent } from '../../adjustment-case/adjustment-case-archive/adjustment-case-view/adjustment-case-view.component';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-stock-card',
    templateUrl: './stock-card.component.html',
    styleUrls: ['./stock-card.component.scss'],
    animations: [panelAnimation],
    imports: [FeatureBackgroundComponent, MatIconButton, MatIcon, NgIf, MatProgressSpinner, EmptyTableComponent, NgFor, MatPaginator, DecimalPipe, DatePipe, TranslatePipe]
})
export class StockCardComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  isLoadingCard: boolean = false;
  isLoadingData: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  productDataSource: any = null;
  id: number | null = null;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.params['id']);

    this.fetchProduct();
    this.fetchStockCard(1);
  }

  fetchStockCard(page: number = this.page) {
    this.page = page;
    this.isLoadingCard = true;
    const id = Number(this.route.snapshot.params['id']);
    this.apiService
      .get(`product-stock/${id}`, {
        page: this.page,
        pageSize: this.pageSize,
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
        this.isLoadingCard = false;
      });
  }

  fetchProduct() {
    this.isLoadingData = true;
    const id = Number(this.route.snapshot.params['id']);
    this.apiService
      .get(`product/${id}`)
      .subscribe({
        next: (data) => {
          this.productDataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingData = false;
      });
  }

  viewDocument(data: any) {
    if (data.sales_return_code_id != null) {
      this.dialog.open(SalesReturnArchiveViewComponent, {
        data: {
          id: data.sales_return_code_id,
        },
      });
      return;
    }

    if (data.sales_invoice_code_id != null) {
      this.dialog.open(SalesInvoiceViewComponent, {
        data: {
          id: data.sales_invoice_code_id,
          noAction: true,
        },
      });
    }

    if (data.good_receipt_code_id != null) {
      this.dialog.open(GoodReceiptViewComponent, {
        data: {
          id: data.good_receipt_code_id,
        },
      });
    }

    if (data.adjustment_case_code_id != null) {
      this.dialog.open(AdjustmentCaseViewComponent, {
        data: {
          id: data.adjustment_case_code_id,
          noAction: true,
        },
      });
    }
  }

  changePage(event: PageEvent) {
    if (event.pageSize == this.pageSize) {
      this.page = event.pageIndex + 1;
      this.fetchStockCard();
    } else {
      this.pageSize = event.pageSize;
      this.fetchStockCard(1);
    }
  }

  onBackButtonPressed() {
    const backUrl = this.route.snapshot.queryParams['backLocation'];
    if (backUrl == undefined) {
      const url = this.router.url.split('/');
      if (url.length > 2) {
        for (let i = 0; i < url.length - 2; i++) {
          url.pop();
        }
      }

      this.router.navigate(url);
    } else {
      const decodedURL = decodeURIComponent(backUrl);
      this.router.navigateByUrl(decodedURL);
    }
  }
}
