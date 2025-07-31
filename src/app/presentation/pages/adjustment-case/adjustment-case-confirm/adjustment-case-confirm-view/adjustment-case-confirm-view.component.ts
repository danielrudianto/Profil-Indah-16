import { DatePipe } from '@angular/common';
import { Component, Inject, Input, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-adjustment-case-confirm-view',
  templateUrl: './adjustment-case-confirm-view.component.html',
  styleUrls: ['./adjustment-case-confirm-view.component.css'],
  animations: [panelAnimation],
})
export class AdjustmentCaseConfirmViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<AdjustmentCaseConfirmViewComponent>,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  isLoading: boolean = false;
  isSubmitting: boolean = false;
  isAdministrator: boolean = false;

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
  });

  get f() {
    return this.adjustmentCaseFormGroup.controls;
  }

  get t() {
    return this.f['adjustment_case'] as FormArray;
  }

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  fetchByID() {
    const id = this.data.id;
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

  closeDialog(data: any | undefined = undefined) {
    this.dialogRef.close(data);
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

  confirmAdjustmentCase() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'adjustment-case__confirm__confirmation'
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == true) {
          this.isSubmitting = true;
          this.apiService
            .post(`adjustment-case/approve`, {
              id: this.data.id,
            })
            .subscribe({
              next: (data: any) => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'adjustment-case__confirm__success'
                  )
                );

                this.closeDialog(data);
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

  rejectAdjustmentCase() {
    if (this.isSubmitting) return;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'adjustment-case__confirm__confirmation'
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == true) {
          this.isSubmitting = true;
          this.apiService
            .post(`adjustment-case/reject`, {
              id: this.data.id,
            })
            .subscribe({
              next: (data: any) => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'adjustment-case__reject__success'
                  )
                );

                this.closeDialog(data);
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

  openDeleteConfirmation() {
    if (this.isSubmitting) return;
    const dialog = this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'adjustment-case__reject__confirmation'
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == true) {
          this.isSubmitting = true;
          this.apiService
            .post(`adjustment-event/reject`, {
              id: this.data.id,
            })
            .subscribe({
              next: (data: any) => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'adjustment-case__reject__success'
                  )
                );

                this.closeDialog(data);
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

  // deleteAdjustmentCase(): void {
  //   this.dialog
  //     .open(DeleteConfirmationComponent, {
  //       data: {
  //         title: this.translateService.instant(
  //           'adjustment-case__confirm__delete__title'
  //         ),
  //         document: `[${this.dataSource.name}]`,
  //       },
  //     })
  //     .afterClosed()
  //     .subscribe((data) => {
  //       if (data == true) {
  //         this.isSubmitting = true;
  //         this.apiService
  //           .post(`adjustment-event/disapprove/${this.data.id}`, {})
  //           .subscribe({
  //             next: (data) => {
  //               this.closeDialog(data);
  //             },
  //             error: (error) => {
  //               this.alertService.showError(error);
  //             },
  //           })
  //           .add(() => {
  //             this.isSubmitting = false;
  //           });
  //       }
  //     });
  // }

  // confirmAdjustmentCase(): void {
  //   this.dialog
  //     .open(DeleteConfirmationComponent, {
  //       data: {
  //         title: this.translateService.instant(
  //           'adjustment-case__confirm__submit__title'
  //         ),
  //         document: `[${this.dataSource.name}]`,
  //       },
  //     })
  //     .afterClosed()
  //     .subscribe((data) => {
  //       if (data == true) {
  //         this.isSubmitting = true;
  //         this.apiService
  //           .post(`adjustment-event/approve/${this.data.id}`, {})
  //           .subscribe({
  //             next: (data) => {
  //               this.closeDialog(data);
  //             },
  //             error: (error) => {
  //               this.alertService.showError(error);
  //             },
  //           })
  //           .add(() => {
  //             this.isSubmitting = false;
  //           });
  //       }
  //     });
  // }
}
