import { Component } from '@angular/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-adjustment-case',
    templateUrl: './adjustment-case.component.html',
    styleUrls: ['./adjustment-case.component.css'],
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslatePipe]
})
export class AdjustmentCaseComponent {
  availbleMenus = [
    {
      label: 'adjustment-case__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'adjustment-case__confirm',
      link: 'Confirm',
      icon: 'check',
    },
    {
      label: 'adjustment-case__create',
      link: '',
      icon: 'add',
    },
  ];
}
