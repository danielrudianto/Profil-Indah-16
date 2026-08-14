import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipSelectionChange, MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatDateRangeInput, MatStartDate, MatEndDate, MatDatepickerToggle, MatDateRangePicker } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
@Component({
    selector: 'app-sales-invoice-archive-filter',
    templateUrl: './sales-invoice-archive-filter.component.html',
    styleUrls: ['./sales-invoice-archive-filter.component.css'],
    animations: [panelAnimation],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatDateRangeInput, MatStartDate, MatEndDate, MatHint, MatDatepickerToggle, MatSuffix, MatDateRangePicker, MatDivider, MatChipListbox, MatChipOption, MatDialogActions, MatButton, TranslateModule]
})
export class SalesInvoiceArchiveFilterComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SalesInvoiceArchiveFilterComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  maxDate: Date = new Date();
  minDate: Date = new Date();
  salesInvoiceArchiveFilterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  filterObject = {
    isPaid: false,
    isUnpaid: false,
    isDelete: false,
    isActive: false,
  };

  ngOnInit(): void {
    this.maxDate = new Date(this.data.year, this.data.month, 0);
    this.minDate = new Date(this.data.year, this.data.month - 1, 1);
    this.salesInvoiceArchiveFilterFormGroup.patchValue({
      startDate: this.data.startDate,
      endDate: this.data.endDate,
    });

    this.filterObject.isActive = this.data.isActive;
    this.filterObject.isDelete = this.data.isDelete;
    this.filterObject.isPaid = this.data.isPaid;
    this.filterObject.isUnpaid = this.data.isUnpaid;

    this.cdr.detectChanges();
  }

  close(data: any = undefined) {
    this.dialog.close(data);
  }

  saveFilters() {
    this.close({
      ...this.salesInvoiceArchiveFilterFormGroup.value,
      ...this.filterObject,
    });
  }

  selectionChange(event: MatChipSelectionChange) {
    const checked = event.selected;
    const field = event.source.value;

    switch (field) {
      case 'isPaid':
        this.filterObject.isPaid = checked;
        break;
      case 'isUnpaid':
        this.filterObject.isUnpaid = checked;
        break;
      case 'isActive':
        this.filterObject.isActive = checked;
        break;
      case 'isDelete':
        this.filterObject.isDelete = checked;
        break;
      default:
        break;
    }
  }
}
