import { Component } from '@angular/core';

@Component({
    selector: 'app-good-receipt',
    templateUrl: './good-receipt.component.html',
    styleUrls: ['./good-receipt.component.css'],
    standalone: false
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
