import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ReceivablePaymentHistoryComponent } from './receivable-payment-history/receivable-payment-history.component';
import { ReceivablePaymentCreateComponent } from './receivable-payment-create/receivable-payment-create.component';
import { ArchiveViewComponent } from '../../../components/archives/archive-view/archive-view.component';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SalesInvoiceViewComponent } from '../../sales-invoice/sales-invoice-archive/sales-invoice-view/sales-invoice-view.component';

@Component({
  selector: 'app-receivable-view',
  templateUrl: './receivable-view.component.html',
  styleUrls: ['./receivable-view.component.css'],
  animations: [panelAnimation],
})
export class ReceivableViewComponent {
  constructor(
    private apiService: ApiService,
    private alertSerivce: AlertService,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  isLoadingData: boolean = true;
  isLoadingCard: boolean = true;

  customerDataSource: any = null;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id == 0) {
      this.customerDataSource = {
        name: this.translateService.instant('general__retail-customer'),
        address: this.translateService.instant(
          'general__retail-customer__address'
        ),
        id: 0,
      };
    } else {
      this.fetchCustomerData();
    }

    this.fetchReceivableData();
  }

  fetchCustomerData(): void {
    this.isLoadingData = true;
    const id = this.route.snapshot.params['id'];
    this.apiService
      .get(`customer/${id}`)
      .subscribe({
        next: (data) => {
          this.customerDataSource = data;
        },
        error: (error) => {
          this.alertSerivce.showError(error);
        },
      })
      .add(() => {
        this.isLoadingData = false;
      });
  }

  fetchReceivableData(page: number = this.page): void {
    const id = this.route.snapshot.params['id'];
    this.page = page;
    this.isLoadingCard = true;
    this.apiService
      .get(`receivable/customer/${id}`, {
        page: this.page,
        pageSize: this.pageSize,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertSerivce.showError(error);
          this.dynamicComponentService.closeDynamicComponent();
        },
      })
      .add(() => {
        this.isLoadingCard = false;
      });
  }

  copyData(data: string): void {
    navigator.clipboard.writeText(data);
    this.alertSerivce.showSuccess(
      this.translateService.instant('general__copy__success')
    );
  }

  changePage(event: PageEvent) {
    if (event.pageSize == this.pageSize) {
      this.page = event.pageIndex + 1;
      this.fetchReceivableData();
    } else {
      this.fetchReceivableData(1);
    }
  }

  createPayment(id: number) {
    const index = this.dataSource.findIndex((x) => x.id == id);
    const data = this.dataSource[index];

    const value = this.valueOf(
      data.sales_invoice,
      data.delivery + data.service - data.discount
    );

    const payment = this.paymentOf(data.sales_invoice_payment);
    this.dialog
      .open(ReceivablePaymentCreateComponent, {
        data: {
          id: id,
          max: value - payment,
        },
      })
      .afterClosed()
      .subscribe((data) => {});

    // this.dynamicComponentService
    //   .createDynamicComponent(ReceivablePaymentCreateComponent, {
    //     id: id,
    //     max: value,
    //   })
    //   .subscribe((data) => {
    //     if (data != undefined && data != null) {
    //       this.dataSource[index].payment =
    //         Number(this.dataSource[index].payment) + Number(data);
    //       if (this.dataSource[index].value == this.dataSource[index].payment) {
    //         this.dataSource.splice(index, 1);
    //         this.dataCount = this.dataCount - 1;
    //       }
    //     }
    //   });
  }

  openView(id: number) {
    this.dialog.open(SalesInvoiceViewComponent, {
      data: {
        id: id,
        noAction: true,
      },
    });
  }

  get totalReceivable(): number {
    return this.dataSource.reduce((a: any, b: any) => {
      return a + (Number(b.value) - Number(b.payment));
    }, 0);
  }

  valueOf(data: any[], additional: number) {
    const sales_invoice = data.reduce((a, b) => {
      return a + (b.price - b.discount) * b.quantity;
    }, 0);

    return sales_invoice + additional;
  }

  paymentOf(data: any[]) {
    const sales_invoice_payment = data.reduce((a, b) => {
      return a + b.value;
    }, 0);

    return sales_invoice_payment;
  }
}
