import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-company-create',
  templateUrl: './company-create.component.html',
  styleUrls: ['./company-create.component.css'],
})
export class CompanyCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<CompanyCreateComponent>
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
          `Company ${data.name} created successfully`
        );
        this.closeDialog();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
}
