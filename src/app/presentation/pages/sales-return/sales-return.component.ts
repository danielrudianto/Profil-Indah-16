import { Component } from '@angular/core';

@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.css'],
})
export class SalesReturnComponent {
  constructor() {}

  availbleMenus = [
    {
      label: 'sales-return__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'sales-return__create',
      link: '',
      icon: 'add',
    },
  ];
}
