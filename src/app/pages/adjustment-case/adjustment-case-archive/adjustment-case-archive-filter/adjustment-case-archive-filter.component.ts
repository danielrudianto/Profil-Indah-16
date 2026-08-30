import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import {
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate,
} from '@angular/material/datepicker';
import { TranslatePipe } from '@ngx-translate/core';

import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/** Nama saringan yang bisa dinyalakan dan dipadamkan di layar ini. */
type Saringan = 'isLost' | 'isFound' | 'isConfirm' | 'isReject' | 'isPending';

/**
 * Penyaring arsip — memakai app-dialog-shell seperti dialog formulir lain.
 *
 * Sebelumnya berkulit Material mentah: Poppins dan #041e49 yang ditulis
 * langsung, mat-chip-listbox, serta petunjuk "MM/DD/YYYY" pada aplikasi yang
 * menggambar tanggalnya 30/8/2026. Gayanya kini datang dari partial
 * styles/_saring.scss yang dipakai bersama keenam penyaring.
 */
@Component({
  selector: 'app-adjustment-case-archive-filter',
  templateUrl: './adjustment-case-archive-filter.component.html',
  styleUrls: ['./adjustment-case-archive-filter.component.scss'],
  imports: [
    DialogShellComponent,
    NgIf,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatDateRangeInput,
    MatStartDate,
    MatEndDate,
    MatDateRangePicker,
    TranslatePipe,
  ],
})
export class AdjustmentCaseArchiveFilterComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<AdjustmentCaseArchiveFilterComponent>,
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

  /** Tidak satu pun pil menyala — artinya semuanya ditampilkan. */
  get tanpaSaringan(): boolean {
    return !Object.values(this.filterObject).some(Boolean);
  }

  /*
    Satu penukar untuk semua saringan.

    Menggantikan switch atas MatChipSelectionChange yang membaca nama
    kolomnya dari event.source.value — nama yang tidak diperiksa siapa pun,
    sehingga salah ketik satu huruf jatuh diam-diam ke cabang default dan
    saringannya tidak pernah menyala. Di sini namanya bertipe, jadi salah
    ketik gagal saat kompilasi.
  */
  alih(saringan: Saringan): void {
    this.filterObject[saringan] = !this.filterObject[saringan];
  }
}
