import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-sales-invoice',
    templateUrl: './sales-invoice.component.html',
    styleUrls: ['./sales-invoice.component.css'],
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslatePipe]
})
export class SalesInvoiceComponent {
  constructor() {}

  availbleMenus = [
    {
      label: 'sales-invoice__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'sales-invoice__create',
      link: '',
      icon: 'add',
    },
  ];
}
