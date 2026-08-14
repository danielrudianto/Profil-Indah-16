import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-expense',
    templateUrl: './expense.component.html',
    styleUrls: ['./expense.component.css'],
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslateModule]
})
export class ExpenseComponent {
  availbleMenus = [
    {
      label: 'expense__report',
      link: 'Report',
      icon: 'report',
    },
    {
      label: 'expense__mutation',
      link: 'Mutation',
      icon: 'list',
    },
    {
      label: 'expense__create',
      link: '',
      icon: 'add',
    },
  ];
}
