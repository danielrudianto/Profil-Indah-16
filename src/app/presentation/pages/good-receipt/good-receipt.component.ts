import { Component } from '@angular/core';

@Component({
  selector: 'app-good-receipt',
  templateUrl: './good-receipt.component.html',
  styleUrls: ['./good-receipt.component.css'],
})
export class GoodReceiptComponent {
  availbleMenus = [
    {
      label: 'Archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'Create',
      link: '',
      icon: 'add',
    },
  ];
}
