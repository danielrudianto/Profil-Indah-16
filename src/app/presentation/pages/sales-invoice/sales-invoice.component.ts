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
      label: 'sales-invoice__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'sales-invoice__create',
      link: '',
      icon: 'add',
    },
  ];
}
