import { Component, Inject, Input } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { AlertService } from '../../../../services/alert.service';
import { DynamicComponentService } from '../../../../services/dynamic-component.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import {
  Form,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { availableRoles, user } from '../../../../models/user.model';
import { panelAnimation } from '../../../../animations/panel.animation';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  animations: [panelAnimation],
})
export class UserEditComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  userFormGroup: FormGroup = new FormGroup({
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
  });

  get f() {
    return this.userFormGroup.controls;
  }

  get t() {
    return this.f['user_sales'] as FormArray;
  }

  userResult: user | null = null;
  roles: any[] = availableRoles;

  isSubmitting: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.apiService.get(`user/${this.data.id}`).subscribe({
      next: (data: any) => {
        this.userFormGroup.patchValue({
          name: data.name,
          nik: data.nik,
          username: data.username,
          role: data.role,
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
            product_brand_id: x.id,
          };
        }),
      })
      .subscribe({
        next: (data) => {
          this.alertService.showSuccess(
            this.translateService.instant('user__update-successfully')
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  onSelectType(event: any) {
    // if (this.selectedTypes.filter((x) => x.id == event.id).length == 0) {
    //   this.selectedTypes.push(event);
    // }
  }

  onRemoveType(index: number) {
    // this.selectedTypes.splice(index, 1);
  }
}
