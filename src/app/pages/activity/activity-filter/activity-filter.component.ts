import { Component, Inject, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import {
  MatDateRangeInput,
  MatStartDate,
  MatEndDate,
  MatDatepickerToggle,
  MatDateRangePicker,
} from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { AUDITED_ENTITIES } from 'src/app/constants/audit-entity.constant';

/**
 * Dialog saringan aktivitas — pola yang sama dengan saringan arsip:
 * corong membuka dialog, hasilnya tampil sebagai kapsul di baris
 * kendali. Menutup lewat latar tidak mengembalikan apa-apa dan tidak
 * mengubah saringan yang sedang menyala.
 */
@Component({
  selector: 'app-activity-filter',
  templateUrl: './activity-filter.component.html',
  imports: [
    MatDialogTitle,
    FormsModule,
    ReactiveFormsModule,
    CdkScrollable,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDatepickerToggle,
    MatSuffix,
    MatDateRangePicker,
    MatDialogActions,
    MatButton,
    NgFor,
    TranslatePipe,
  ],
})
export class ActivityFilterComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<ActivityFilterComponent>,
  ) {}

  readonly entities = AUDITED_ENTITIES;

  formGroup: FormGroup = new FormGroup({
    entity: new FormControl<string>(''),
    dateFrom: new FormControl<Date | null>(null),
    dateTo: new FormControl<Date | null>(null),
  });

  ngOnInit(): void {
    this.formGroup.patchValue({
      entity: this.data?.entity ?? '',
      dateFrom: this.data?.dateFrom ?? null,
      dateTo: this.data?.dateTo ?? null,
    });
  }

  simpan(): void {
    this.dialog.close(this.formGroup.value);
  }
}
