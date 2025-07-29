import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipSelectionChange } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';

@Component({
  selector: 'app-purchase-invoice-archive-filter',
  templateUrl: './purchase-invoice-archive-filter.component.html',
  styleUrls: ['./purchase-invoice-archive-filter.component.css'],
  animations: [panelAnimation],
})
export class PurchaseInvoiceArchiveFilterComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<PurchaseInvoiceArchiveFilterComponent>,
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
