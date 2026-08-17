import { Component, Inject, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';
import {
  ComboItem,
  ComboSearchComponent,
} from 'src/app/components/combo-search/combo-search.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Catat pembayaran piutang — dialog-shell 560px.
 *
 * Nominal dibatasi sisa tagihan fakturnya; centang "lunas penuh" mengisi
 * nominal dengan sisa itu dan mengunci kolomnya. Metode pembayaran boleh
 * kosong (kas tanpa metode) — dikirim null, skema server menerimanya.
 */
@Component({
  selector: 'app-receivable-payment-create',
  templateUrl: './receivable-payment-create.component.html',
  imports: [
    DialogShellComponent,
    ComboSearchComponent,
    ReactiveFormsModule,
    DecimalPipe,
    NgxMaskDirective,
    TranslatePipe,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatCheckbox,
    MatDatepicker,
    MatDatepickerInput,
  ],
  providers: [DatePipe],
})
export class ReceivablePaymentCreateComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; max: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private dialogRef: MatDialogRef<ReceivablePaymentCreateComponent>,
  ) {}

  isSubmitting = false;

  paymentFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
    value: new FormControl('', Validators.required),
    payment_method_id: new FormControl(null),
    full_payment: new FormControl(false),
  });

  ngOnInit(): void {
    this.paymentFormGroup.controls['value'].setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(this.data.max),
    ]);
    this.paymentFormGroup.controls['value'].updateValueAndValidity();

    /* Lunas penuh: nominal = sisa tagihan, kolomnya dikunci. */
    this.paymentFormGroup.controls['full_payment'].valueChanges.subscribe(
      (lunas) => {
        const kontrol = this.paymentFormGroup.controls['value'];
        if (lunas) {
          kontrol.setValue(this.data.max);
          kontrol.disable();
        } else {
          kontrol.enable();
          kontrol.setValue('');
        }
      },
    );
  }

  pilihMetode(item: ComboItem): void {
    this.paymentFormGroup.patchValue({ payment_method_id: item.id });
  }

  lepasMetode(): void {
    this.paymentFormGroup.patchValue({ payment_method_id: null });
  }

  get bisaSimpan(): boolean {
    return !this.isSubmitting && this.paymentFormGroup.valid;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submit(): void {
    if (!this.bisaSimpan) {
      return;
    }

    const lunas = this.paymentFormGroup.controls['full_payment'].value;

    this.isSubmitting = true;
    this.apiService
      .post('receivable/payment', {
        sales_invoice_id: this.data.id,
        date: this.datePipe.transform(
          this.paymentFormGroup.controls['date'].value,
          'yyyy-MM-dd',
        ),
        amount: lunas
          ? this.data.max
          : Number(this.paymentFormGroup.controls['value'].value),
        payment_method_id:
          this.paymentFormGroup.controls['payment_method_id'].value,
        full_payment: lunas,
      })
      .subscribe({
        next: (data: any) => {
          this.dialogRef.close(data);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}
