import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipSelectionChange, MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatDateRangeInput, MatStartDate, MatEndDate, MatDatepickerToggle, MatDateRangePicker } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-good-receipt-archive-filter',
    templateUrl: './good-receipt-archive-filter.component.html',
    styleUrls: ['./good-receipt-archive-filter.component.scss'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatDateRangeInput, MatStartDate, MatEndDate, MatHint, MatDatepickerToggle, MatSuffix, MatDateRangePicker, MatDivider, MatChipListbox, MatChipOption, MatDialogActions, TranslatePipe]
})
export class GoodReceiptArchiveFilterComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<GoodReceiptArchiveFilterComponent>,
    private cdr: ChangeDetectorRef
  ) {}

  maxDate: Date = new Date();
  minDate: Date = new Date();
  salesInvoiceArchiveFilterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  filterObject = {
    isPending: false,
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
    this.filterObject.isPending = this.data.isPending;

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
      case 'isActive':
        this.filterObject.isActive = checked;
        break;
      case 'isDelete':
        this.filterObject.isDelete = checked;
        break;
      case 'isPending':
        this.filterObject.isPending = checked;
        break;
      default:
        break;
    }
  }
}
