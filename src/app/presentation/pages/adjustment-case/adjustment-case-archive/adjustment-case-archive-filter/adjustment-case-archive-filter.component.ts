import { Component, Inject, Input, signal } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipSelectionChange, MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatDateRangeInput, MatStartDate, MatEndDate, MatDatepickerToggle, MatDateRangePicker } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-adjustment-case-archive-filter',
    templateUrl: './adjustment-case-archive-filter.component.html',
    styleUrls: ['./adjustment-case-archive-filter.component.css'],
    animations: [panelAnimation],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatDateRangeInput, MatStartDate, MatEndDate, MatHint, MatDatepickerToggle, MatSuffix, MatDateRangePicker, MatDivider, MatChipListbox, MatChipOption, MatDialogActions, MatButton, TranslatePipe]
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
    isConfirm: false,
    isReject: false,
    isPending: false,
  };

  ngOnInit(): void {
    this.maxDate = new Date(this.data.year, this.data.month, 0);
    this.minDate = new Date(this.data.year, this.data.month - 1, 1);
    this.adjustmentCaseArchiveFilterFormGroup.patchValue({
      startDate: this.data.startDate,
      endDate: this.data.endDate,
    });

    this.filterObject.isConfirm = this.data.isConfirm;
    this.filterObject.isReject = this.data.isReject;
    this.filterObject.isPending = this.data.isPending;
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
      case 'isConfirm':
        this.filterObject.isConfirm = checked;
        break;
      case 'isReject':
        this.filterObject.isReject = checked;
        break;
      case 'isPending':
        this.filterObject.isPending = checked;
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
