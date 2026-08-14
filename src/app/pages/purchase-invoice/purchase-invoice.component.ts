import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-purchase-invoice',
    templateUrl: './purchase-invoice.component.html',
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslatePipe]
})
export class PurchaseInvoiceComponent {
  availbleMenus = [
    {
      label: 'purchase-invoice__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'purchase-invoice__confirm',
      link: 'Confirm',
      icon: 'check',
    },
    {
      label: 'purchase-invoice__create',
      link: '',
      icon: 'add',
    },
  ];
}
