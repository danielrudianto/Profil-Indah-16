import { Component, Inject, Input, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipSelectionChange } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { panelAnimation } from 'src/app/animations/panel.animation';

@Component({
  selector: 'app-adjustment-case-archive-filter',
  templateUrl: './adjustment-case-archive-filter.component.html',
  styleUrls: ['./adjustment-case-archive-filter.component.css'],
  animations: [panelAnimation],
})
export class AdjustmentCaseArchiveFilterComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<AdjustmentCaseArchiveFilterComponent>
  ) {}

  maxDate: Date = new Date();
  minDate: Date = new Date();
  adjustmentCaseArchiveFilterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  filterObject = {
    isLost: false,
    isFound: false,
    isDelete: false,
    isActive: false,
  };

  ngOnInit(): void {
    this.maxDate = new Date(this.data.year, this.data.month, 0);
    this.minDate = new Date(this.data.year, this.data.month - 1, 1);
    this.adjustmentCaseArchiveFilterFormGroup.patchValue({
      startDate: this.data.startDate,
      endDate: this.data.endDate,
    });

    this.filterObject.isActive = this.data.isActive;
    this.filterObject.isDelete = this.data.isDelete;
    this.filterObject.isLost = this.data.isLost;
    this.filterObject.isFound = this.data.isFound;
  }

  close(data: any = undefined) {
    this.dialog.close(data);
  }

  saveFilters() {
    this.close({
      ...this.adjustmentCaseArchiveFilterFormGroup.value,
      ...this.filterObject,
    });
  }

  selectionChange(event: MatChipSelectionChange) {
    const checked = event.selected;
    const field = event.source.value;

    switch (field) {
      case 'isActive':
        this.filterObject.isActive = checked;
        break;
      case 'isDelete':
        this.filterObject.isDelete = checked;
        break;
      case 'isLost':
        this.filterObject.isLost = checked;
        break;
      case 'isFound':
        this.filterObject.isFound = checked;
        break;
      default:
        break;
    }
  }
}
