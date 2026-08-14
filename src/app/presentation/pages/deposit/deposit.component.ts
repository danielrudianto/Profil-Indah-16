import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.css'],
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslateModule]
})
export class DepositComponent {
  constructor() {}
  availableMenus = [
    {
      label: 'deposit__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'deposit__list',
      link: '',
      icon: 'list',
    },
  ];
}
