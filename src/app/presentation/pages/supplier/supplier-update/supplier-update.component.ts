import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-supplier-update',
  templateUrl: './supplier-update.component.html',
  styleUrls: ['./supplier-update.component.css'],
})
export class SupplierUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<SupplierUpdateComponent>,
    private translateService: TranslateService
  ) {}

  isOpened: boolean = false;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  supplierFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isOpened = true;
  }

  fetchByID(): void {
    this.apiService
      .get(`supplier/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.supplierFormGroup.patchValue(data);
        },
        error: (error) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('supplier', this.supplierFormGroup.value).subscribe({
      next: (data: any) => {
        this.translateService
          .get('supplier__update__success')
          .subscribe((message: string) => {
            this.alertService.showSuccess(`${data.name} ${message}`);

            this.closeDialog(data);
          });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
}
