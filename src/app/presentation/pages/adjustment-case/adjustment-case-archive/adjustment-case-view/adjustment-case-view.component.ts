import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-adjustment-case-view',
  templateUrl: './adjustment-case-view.component.html',
  styleUrls: ['./adjustment-case-view.component.css'],
})
export class AdjustmentCaseViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private authService: AuthService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<AdjustmentCaseViewComponent>
  ) {}

  step = signal(0);

  adjustmentCaseFormGroup: FormGroup = new FormGroup({
    date: new FormControl(''),
    name: new FormControl(''),
    company: new FormControl(''),
    createdBy: new FormControl(''),
    createdAt: new FormControl(''),
    type: new FormControl(''),
    status: new FormControl(''),
    adjustment_case: new FormArray([]),
    is_confirm: new FormControl(false),
    is_delete: new FormControl(false),
  });

  get f() {
    return this.adjustmentCaseFormGroup.controls;
  }

  get t() {
    return this.f['adjustment_case'] as FormArray;
  }

  get canDelete(): boolean {
    if (this.isSubmitting) {
      return false;
    }

    if (
      this.isAdministrator &&
      this.adjustmentCaseFormGroup.get('is_delete')?.value == false &&
      this.adjustmentCaseFormGroup.get('is_confirm')?.value == true
    ) {
      return true;
    }

    return false;
  }

  isAdministrator: boolean = false;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID(this.data.id);
  }

  fetchByID(id: number) {
    this.apiService.get('adjustment-case/' + id).subscribe({
      next: (data: any) => {
        this.adjustmentCaseFormGroup.patchValue({
          date: this.datePipe.transform(data.date, 'dd MMMM YYYY'),
          name: data.name,
          company: data.company == null ? 'N/A' : data.company.name,
          type:
            data.company == null
              ? this.translateService.instant(
                  'adjustment-case__archive__view__type__lost'
                )
              : this.translateService.instant(
                  'adjustment-case__archive__view__type__found'
                ),
          status: data.is_delete
            ? this.translateService.instant(
                'adjustment-case__archive__view__status__deleted'
              )
            : data.is_confirm
            ? this.translateService.instant(
                'adjustment-case__archive__view__status__confirmed'
              )
            : this.translateService.instant(
                'adjustment-case__archive__view__status__pending'
              ),
          is_confirm: data.is_confirm,
          is_delete: data.is_delete,
          createdBy: data.user_adjustment_case_code_created_byTouser.name,
          createdAt: this.datePipe.transform(data.created_at, 'dd MMMM YYYY'),
        });

        for (const adjustment of data.adjustment_case) {
          this.t.push(
            this.formBuilder.group({
              product_id: [adjustment.product_id],
              product_unit_id: [adjustment.product_unit_id],
              reference: [adjustment.product.reference],
              description: [adjustment.product.description],
              unit: [
                adjustment.product_unit == null
                  ? adjustment.product.unit
                  : adjustment.product_unit.unit,
              ],
              quantity: [adjustment.quantity],
              default_unit: [adjustment.product.unit],
              conversion: [
                adjustment.product_unit == null
                  ? 1
                  : adjustment.product_unit.conversion,
              ],
            })
          );
        }
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  openDeleteConfirmation() {
    const dialog = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        title: this.translateService.instant(
          'adjustment-case__delete__confirmation'
        ),
        // document: this.data.name,
      },
    });

    dialog.afterClosed().subscribe((data) => {
      if (data == true) {
        this.isSubmitting = true;
        this.apiService
          .delete(`adjustment-case/${this.data.id}`)
          .subscribe({
            next: (data: any) => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'adjustment-case__delete__success'
                )
              );

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
    });
  }

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
  }
}
