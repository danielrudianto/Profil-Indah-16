import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ReceivablePaymentHistoryComponent } from './receivable-payment-history/receivable-payment-history.component';
import { ReceivablePaymentCreateComponent } from './receivable-payment-create/receivable-payment-create.component';

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
    private translateService: TranslateService
  ) {}

  @Input('data') data: any;
  isOpened: boolean = false;
  isLoadingData: boolean = true;
  isLoadingCard: boolean = true;

  customerDataSource: any = null;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;

  ngOnInit(): void {
    this.isOpened = true;
    if (this.data.id == null) {
      this.customerDataSource = {
        name: this.translateService.instant('general__retail-customer'),
        address: this.translateService.instant(
          'general__retail-customer__address'
        ),
        id: 0,
      };

      this.isLoadingData = false;
    } else {
      this.fetchCustomerData();
    }

    this.fetchReceivableData();
  }

  fetchCustomerData(): void {
    this.isLoadingData = true;
    this.apiService
      .get(`customer/${this.data.id}`)
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
    this.page = page;
    this.isLoadingCard = true;
    this.apiService
      .get(
        `receivable/customer/v2/${this.data.id == null ? 0 : this.data.id}`,
        {
          page: this.page,
        }
      )
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

  closeDialog(data: any = undefined) {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }

  copyData(data: string): void {
    navigator.clipboard.writeText(data);
    this.alertSerivce.showSuccess(
      this.translateService.instant('general__copy__success')
    );
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.fetchReceivableData();
  }

  openPaymentHistory(id: number) {
    this.dynamicComponentService
      .createDynamicComponent(ReceivablePaymentHistoryComponent, {
        id: id,
      })
      .subscribe({
        next: (data) => {
          if (data != undefined && data != null) {
            const index = this.dataSource.findIndex((x) => x.id == id);
            if (index != -1) {
              this.dataSource[index].payment = data;
            }
          }
        },
      });
  }

  createPayment(id: number) {
    const index = this.dataSource.findIndex((x) => x.id == id);
    const value = this.dataSource[index].value - this.dataSource[index].payment;

    this.dynamicComponentService
      .createDynamicComponent(ReceivablePaymentCreateComponent, {
        id: id,
        max: value,
      })
      .subscribe((data) => {
        if (data != undefined && data != null) {
          this.dataSource[index].payment =
            Number(this.dataSource[index].payment) + Number(data);
          if (this.dataSource[index].value == this.dataSource[index].payment) {
            this.dataSource.splice(index, 1);
            this.dataCount = this.dataCount - 1;
          }
        }
      });
  }

  get totalReceivable(): number {
    return this.dataSource.reduce((a: any, b: any) => {
      return a + (Number(b.value) - Number(b.payment));
    }, 0);
  }
}
