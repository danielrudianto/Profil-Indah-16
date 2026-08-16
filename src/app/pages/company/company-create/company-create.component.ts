import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';
import { MatButton } from '@angular/material/button';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-company-create',
    templateUrl: './company-create.component.html',
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
export class CompanyCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<CompanyCreateComponent>,
    private translateService: TranslateService
  ) {}

  isOpened: boolean = false;
  isSubmitting: boolean = false;
  companyFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
  });

  ngOnInit(): void {
    this.isOpened = true;
  }

  closeDialog() {
    this.dialog.close();
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.post('company', this.companyFormGroup.value).subscribe({
      next: (data: any) => {
        this.alertService.showSuccess(
          `${data.name} ${this.translateService.instant('company__create__success')}`
        );
        /* Bawa datanya pulang: daftar bisa langsung menampilkannya. */
        this.dialog.close(data);
      },
      error: (error) => {
        this.alertService.showError(error);
        this.isSubmitting = false;
      },
    });
  }
}
