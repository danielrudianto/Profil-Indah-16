import { Component } from '@angular/core';

@Component({
  selector: 'app-purchase-invoice',
  templateUrl: './purchase-invoice.component.html',
  styleUrls: ['./purchase-invoice.component.css'],
})
export class PurchaseInvoiceComponent {
  availbleMenus = [
    {
      label: 'Archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'Confirm',
      link: 'Confirm',
      icon: 'check',
    },
    {
      label: 'Create',
      link: '',
      icon: 'add',
    },
  ];
}
