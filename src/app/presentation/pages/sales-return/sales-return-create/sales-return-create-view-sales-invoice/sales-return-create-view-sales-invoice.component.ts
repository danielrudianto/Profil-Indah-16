import { Component, Input } from '@angular/core';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
    selector: 'app-sales-return-create-view-sales-invoice',
    templateUrl: './sales-return-create-view-sales-invoice.component.html',
    styleUrls: ['./sales-return-create-view-sales-invoice.component.css'],
    animations: [panelAnimation],
    standalone: false
})
export class SalesReturnCreateViewSalesInvoiceComponent {
  constructor(
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService
  ) {}

  @Input('data') data: any;
  panelState: string = 'closed';
  isLoading: boolean = true;
  dataSource: any = null;

  ngOnInit(): void {
    this.panelState = 'opened';
    this.fetchByID();
  }

  close(data: any = undefined) {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }

  enlarge() {
    this.panelState = 'enlarged';
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get('sales-invoice/' + this.data.id, {})
      .subscribe({
        next: (data) => {
          this.dataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  selectDocument() {
    this.close(this.dataSource);
  }

  get subtotal(): number {
    if (this.dataSource == null) {
      return 0;
    }

    return this.dataSource.sales_invoice.reduce((a: any, b: any) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }
}
