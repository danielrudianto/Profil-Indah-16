import { Component } from '@angular/core';

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.css'],
    standalone: false
})
export class DepositComponent {
  constructor() {}
  availableMenus = [
    {
      label: 'deposit__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'deposit__list',
      link: '',
      icon: 'list',
    },
  ];
}
