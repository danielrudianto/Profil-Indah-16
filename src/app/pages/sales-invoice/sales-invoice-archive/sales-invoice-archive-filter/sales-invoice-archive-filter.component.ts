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
type Saringan = 'isPaid' | 'isUnpaid' | 'isDelete' | 'isActive';

/**
 * Penyaring arsip faktur penjualan.
 *
 * Ditulis ulang memakai app-dialog-shell. Sebelumnya ia satu-satunya dialog
 * di alur ini yang masih berkulit Material mentah — Poppins, #041e49 yang
 * ditulis langsung, mat-chip-listbox, dan petunjuk "MM/DD/YYYY" pada
 * aplikasi yang menggambar tanggalnya 30/8/2026.
 */
@Component({
  selector: 'app-sales-invoice-archive-filter',
  templateUrl: './sales-invoice-archive-filter.component.html',
  styleUrls: ['./sales-invoice-archive-filter.component.scss'],
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
export class SalesInvoiceArchiveFilterComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SalesInvoiceArchiveFilterComponent>,
    private cdr: ChangeDetectorRef,
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

  /** Tidak satu pun pil menyala — artinya semuanya ditampilkan. */
  get tanpaSaringan(): boolean {
    return !Object.values(this.filterObject).some(Boolean);
  }

  /*
    Satu penukar untuk keempat saringan.

    Menggantikan switch atas MatChipSelectionChange yang membaca nama
    kolomnya dari event.source.value — nama yang tidak diperiksa siapa pun,
    sehingga salah ketik satu huruf jatuh diam-diam ke cabang default dan
    saringannya tidak pernah menyala. Di sini namanya bertipe, jadi salah
    ketik gagal saat kompilasi.
  */
  alih(saringan: Saringan): void {
    this.filterObject[saringan] = !this.filterObject[saringan];
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
}
