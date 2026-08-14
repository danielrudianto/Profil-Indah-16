import { Component } from '@angular/core';

@Component({
    selector: 'app-expense',
    templateUrl: './expense.component.html',
    styleUrls: ['./expense.component.css'],
    standalone: false
})
export class ExpenseComponent {
  availbleMenus = [
    {
      label: 'expense__report',
      link: 'Report',
      icon: 'report',
    },
    {
      label: 'expense__mutation',
      link: 'Mutation',
      icon: 'list',
    },
    {
      label: 'expense__create',
      link: '',
      icon: 'add',
    },
  ];
}
