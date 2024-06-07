import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-sales-invoice-success',
  templateUrl: './sales-invoice-success.component.html',
  styleUrls: ['./sales-invoice-success.component.css'],
})
export class SalesInvoiceSuccessComponent {
  constructor(
    private translateService: TranslateService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  @Input('data') data: any;
  isOpened: boolean = false;
  value: number = 100;

  ngOnInit(): void {
    this.isOpened = true;
  }

  copyName() {
    navigator.clipboard.writeText(this.data.name);
    this.alertService.showSuccess(
      this.translateService.instant('sales-invoice__success__copied')
    );
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
