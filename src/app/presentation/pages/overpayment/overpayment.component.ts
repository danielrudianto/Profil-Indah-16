import { Component } from '@angular/core';
@Component({
  selector: 'app-overpayment',
  templateUrl: './overpayment.component.html',
  styleUrl: './overpayment.component.css',
})
export class OverpaymentComponent {
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
