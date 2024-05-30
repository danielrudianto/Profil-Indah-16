import { Component } from '@angular/core';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
})
export class ExpenseComponent {
  availbleMenus = [
    {
      label: 'Report',
      link: 'Report',
      icon: 'report',
    },
    {
      label: 'Mutation',
      link: 'Mutation',
      icon: 'list',
    },
    {
      label: 'Create',
      link: '',
      icon: 'add',
    },
  ];
}
