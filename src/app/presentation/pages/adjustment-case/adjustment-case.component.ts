import { Component } from '@angular/core';

@Component({
  selector: 'app-adjustment-case',
  templateUrl: './adjustment-case.component.html',
  styleUrls: ['./adjustment-case.component.css'],
})
export class AdjustmentCaseComponent {
  availbleMenus = [
    {
      label: 'adjustment-case__archive',
      link: 'Archive',
      icon: 'folder',
    },
    {
      label: 'adjustment-case__confirm',
      link: 'Confirm',
      icon: 'check',
    },
    {
      label: 'adjustment-case__create',
      link: '',
      icon: 'add',
    },
  ];
}
