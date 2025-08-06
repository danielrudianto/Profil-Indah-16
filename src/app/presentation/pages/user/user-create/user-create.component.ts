import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { UserCreateStatusComponent } from './user-create-status/user-create-status.component';
import { availableRoles, user } from 'src/app/models/user.model';
import { panelAnimation } from 'src/app/animations/panel.animation';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css'],
  animations: [panelAnimation],
})
export class UserCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UserCreateComponent>
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
  });

  userResult: user | null = null;
  roles: any[] = availableRoles;
  selectedTypes: any[] = [];

  isSubmitting: boolean = false;
  isLoading: boolean = false;

  ngOnInit(): void {
    this.userFormGroup.controls['role'].valueChanges.subscribe({
      next: (data) => {
        if (data != 6) {
          this.selectedTypes = [];
        }
      },
    });
  }

  onSubmit() {
    this.isSubmitting = true;
    this.apiService
      .post('user', {
        name: this.userFormGroup.controls['name'].value,
        username: this.userFormGroup.controls['username'].value,
        nik: this.userFormGroup.controls['nik'].value,
        is_active: true,
        role: this.userFormGroup.controls['role'].value,
        user_sales: this.selectedTypes.map((x) => {
          return {
            product_type_id: x.id,
          };
        }),
      })
      .subscribe({
        next: (data) => {
          this.dialog.open(UserCreateStatusComponent, {
            data: data,
            minWidth: '300px',
            maxWidth: '400px',
          });
          this.dialogRef.close();
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
    if (this.selectedTypes.filter((x) => x.id == event.id).length == 0) {
      this.selectedTypes.push(event);
    }
  }

  onRemoveType(index: number) {
    this.selectedTypes.splice(index, 1);
  }
}
