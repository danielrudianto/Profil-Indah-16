import { Component, Inject, Input } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';
import { DynamicComponentService } from '../../../services/dynamic-component.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { AbstractControl, Form, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { availableRoles, user } from '../../../models/user.model';
import { panelAnimation } from '../../../animations/panel.animation';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AuthService } from 'src/app/services/auth.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.css'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatSelect, NgFor, MatOption, NgIf, AutocompleteSearchComponent, MatChipSet, MatChip, MatButton, MatIcon, MatDialogActions, MatDialogClose, TranslatePipe]
})
export class UserEditComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UserEditComponent>,
    private authService: AuthService
  ) {}

  roleUserSalesValidator(group: AbstractControl): ValidationErrors | null {
    const role = group.get('role')?.value;
    const userSales = group.get('user_sales') as FormArray;
    if (role === 6 && userSales.length === 0) {
      return { userSalesRequired: true };
    }
    return null;
  }

  userFormGroup: FormGroup = new FormGroup(
    {
      name: new FormControl('', Validators.required),
      nik: new FormControl('', [
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16),
        Validators.pattern(/^([0-9]{16})$/),
      ]),
      username: new FormControl('', Validators.required),
      password: new FormControl(''),
      role: new FormControl('', Validators.required),
      user_sales: new FormArray([]),
    },
    {
      validators: this.roleUserSalesValidator,
    }
  );

  get f() {
    return this.userFormGroup.controls;
  }

  get t() {
    return this.f['user_sales'] as FormArray;
  }

  roles: any[] = availableRoles;

  isAdministrator: boolean = false;
  isSubmitting: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.apiService.get(`user/${this.data.id}`).subscribe({
      next: (data: any) => {
        this.userFormGroup.patchValue({
          name: data.name,
          nik: data.nik,
          username: data.username,
          role: data.role,
        });

        data.user_sales.forEach((x: any) => {
          this.t.push(
            this.formBuilder.group({
              product_type_id: [x.product_type_id],
              product_type_name: [x.product_type.name],
            })
          );
        });
      },
      error: (error) => {
        this.alertService.showError(error.error);
      },
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .put('user', {
        id: this.data.id,
        name: this.userFormGroup.controls['name'].value,
        username: this.userFormGroup.controls['username'].value,
        nik: this.userFormGroup.controls['nik'].value,
        is_active: true,
        role: this.userFormGroup.controls['role'].value,
        user_sales: this.t.value.map((x: any) => {
          return {
            product_type_id: x.product_type_id,
          };
        }),
      })
      .subscribe({
        next: (data) => {
          this.alertService.showSuccess(
            this.translateService.instant('user__update-successfully')
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

  delete() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('user__delete__message'),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === true) {
          this.isSubmitting = true;
          this.apiService
            .delete(`user/${this.data.id}`)
            .subscribe({
              next: (_) => {
                this.alertService.showSuccess(
                  this.translateService.instant('user__delete__success')
                );
                this.dialogRef.close('deleted');
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

  onSelectType(event: any) {
    const exists =
      this.t.value.filter((x: any) => x.product_type_id == event.id).length > 0;
    if (exists) return;

    this.t.push(
      this.formBuilder.group({
        product_type_id: [event.id],
        product_type_name: [event.name],
      })
    );
  }

  onRemoveType(index: number) {
    this.t.removeAt(index);
  }
}
