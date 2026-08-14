import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-good-receipt',
    templateUrl: './good-receipt.component.html',
    styleUrls: ['./good-receipt.component.css'],
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslatePipe]
})
export class GoodReceiptComponent {
  availbleMenus = [
    {
      label: 'good-receipt__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'good-receipt__create',
      link: '',
      icon: 'add',
    },
  ];
}
