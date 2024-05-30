import { Component } from '@angular/core';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css'],
})
export class DepositComponent {
  constructor() {}
  availableMenus = [
    {
      label: 'Archive',
      link: 'Archive',
      icon: 'folder',
    },
  ];
}
