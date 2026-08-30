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
type Saringan = 'isActive' | 'isDelete';

/**
 * Penyaring arsip — memakai app-dialog-shell seperti dialog formulir lain.
 *
 * Sebelumnya berkulit Material mentah: Poppins dan #041e49 yang ditulis
 * langsung, mat-chip-listbox, serta petunjuk "MM/DD/YYYY" pada aplikasi yang
 * menggambar tanggalnya 30/8/2026. Gayanya kini datang dari partial
 * styles/_saring.scss yang dipakai bersama keenam penyaring.
 */
@Component({
  selector: 'app-sales-return-archive-filter',
  templateUrl: './sales-return-archive-filter.component.html',
  styleUrls: ['./sales-return-archive-filter.component.scss'],
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
export class SalesReturnArchiveFilterComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SalesReturnArchiveFilterComponent>,
  ) {}

  filterObject = {
    isActive: false,
    isDelete: false,
  };

  maxDate: Date = new Date();
  minDate: Date = new Date();
  salesInvoiceArchiveFilterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
  });

  ngOnInit(): void {
    this.maxDate = new Date(this.data.year, this.data.month, 0);
    this.minDate = new Date(this.data.year, this.data.month - 1, 1);
    this.salesInvoiceArchiveFilterFormGroup.patchValue({
      startDate: this.data.startDate,
      endDate: this.data.endDate,
    });

    this.filterObject.isActive = this.data.isActive;
    this.filterObject.isDelete = this.data.isDelete;
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
