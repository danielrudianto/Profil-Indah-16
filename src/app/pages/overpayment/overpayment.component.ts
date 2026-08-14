import { Component } from '@angular/core';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FeatureBackgroundComponent } from '../../components/feature-background/feature-background.component';
import { TransactionHeaderComponent } from '../../components/transaction-header/transaction-header.component';
import { RouterOutlet } from '@angular/router';
@Component({
    selector: 'app-overpayment',
    templateUrl: './overpayment.component.html',
    styleUrl: './overpayment.component.css',
    imports: [FeatureBackgroundComponent, TransactionHeaderComponent, RouterOutlet, TranslatePipe]
})
export class OverpaymentComponent {
  constructor(private translateService: TranslateService) {}
  availbleMenus = [
    {
      label: this.translateService.instant('general__archive'),
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: this.translateService.instant('overpayment__return-list'),
      link: 'Return',
      icon: 'list',
    },
    {
      label: this.translateService.instant('general__create'),
      link: '',
      icon: 'add',
    },
  ];
}
