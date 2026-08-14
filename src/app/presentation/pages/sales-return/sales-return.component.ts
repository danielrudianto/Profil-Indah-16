import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-sales-return',
    templateUrl: './sales-return.component.html',
    styleUrls: ['./sales-return.component.css'],
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslatePipe]
})
export class SalesReturnComponent {
  constructor() {}

  availbleMenus = [
    {
      label: 'sales-return__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'sales-return__create',
      link: '',
      icon: 'add',
    },
  ];
}
