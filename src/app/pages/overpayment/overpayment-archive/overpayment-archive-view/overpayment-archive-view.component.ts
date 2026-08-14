import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-overpayment-archive-view',
    templateUrl: './overpayment-archive-view.component.html',
    styleUrl: './overpayment-archive-view.component.scss',
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatDivider, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
})
export class OverpaymentArchiveViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dialogRef: MatDialogRef<OverpaymentArchiveViewComponent>,
    private apiService: ApiService,
    private dialog: MatDialog,
    private alertService: AlertService,
    private datePipe: DatePipe
  ) {}

  overpaymentFormGroup: FormGroup = new FormGroup({
    date: new FormControl('', Validators.required),
    customer: new FormControl('', Validators.required),
    payment_method: new FormControl('', Validators.required),
    value: new FormControl(0, Validators.required),
    return_payment_date: new FormControl('', Validators.required),
    return_payment_method: new FormControl('', Validators.required),
    return_payment_name: new FormControl('', Validators.required),
    return_payment_bank: new FormControl(''),
    return_payment_number: new FormControl(''),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID() {
    this.apiService.get(`overpayment/${this.data.id}`).subscribe({
      next: (data: any) => {
        this.overpaymentFormGroup.patchValue({
          date: this.datePipe.transform(data.date, 'dd MMMM YYYY'),
          value: data.value,
          customer: data.customer == null ? 'Retail' : data.customer.name,
          payment_method:
            data.payment_method == null ? 'Cash' : data.payment_method.name,
          return_payment_date: this.datePipe.transform(
            data.return_payment_date,
            'dd MMMM YYYY'
          ),
          return_payment_method: data.return_payment_method,
          return_payment_name: data.return_payment_name,
          return_payment_bank:
            data.return_payment_bank == null ? 'N/A' : data.return_payment_bank,
          return_payment_number:
            data.return_payment_number == null
              ? 'N/A'
              : data.return_payment_number,
        });
      },
      error: (error) => {
        this.alertService.showError(error);
        this.dialogRef.close();
      },
    });
  }
}
