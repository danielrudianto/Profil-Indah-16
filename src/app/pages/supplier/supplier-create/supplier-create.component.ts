import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

@Component({
    selector: 'app-supplier-create',
    templateUrl: './supplier-create.component.html',
    imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    NgxMaskDirective,
    TranslatePipe,
  ]
})
export class SupplierCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<SupplierCreateComponent>,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;
  supplierFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
  });

  closeDialog() {
    this.dialog.close();
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .post('supplier', this.supplierFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            `${data.name} ${this.translateService.instant('supplier__create__success')}`
          );
          /* Bawa datanya pulang: daftar bisa langsung memuat ulang. */
          this.dialog.close(data);
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
