import { Component } from '@angular/core';

@Component({
  selector: 'app-sales-invoice',
  templateUrl: './sales-invoice.component.html',
  styleUrls: ['./sales-invoice.component.css'],
})
export class SalesInvoiceComponent {
  constructor() {}

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
