import { Component } from '@angular/core';

@Component({
  selector: 'app-adjustment-case',
  templateUrl: './adjustment-case.component.html',
  styleUrls: ['./adjustment-case.component.css'],
})
export class AdjustmentCaseComponent {
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
