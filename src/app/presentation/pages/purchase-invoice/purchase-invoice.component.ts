import { Component } from '@angular/core';

@Component({
  selector: 'app-purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  styleUrls: ['./purchase-invoice.component.css'],
})
export class PurchaseInvoiceComponent {
  availbleMenus = [
    {
      label: 'purchase-invoice__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'purchase-invoice__confirm',
      link: 'Confirm',
      icon: 'check',
    },
    {
      label: 'purchase-invoice__create',
      link: '',
      icon: 'add',
    },
  ];
}
