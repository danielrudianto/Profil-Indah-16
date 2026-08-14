import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-overpayment',
    templateUrl: './overpayment.component.html',
    styleUrl: './overpayment.component.css',
    standalone: false
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
