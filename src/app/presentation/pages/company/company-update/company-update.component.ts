import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-company-update',
  templateUrl: './company-update.component.html',
  styleUrls: ['./company-update.component.css'],
})
export class CompanyUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<CompanyUpdateComponent>,
    private translateService: TranslateService
  ) {}

  isOpened: boolean = false;
  isSubmitting: boolean = false;
  companyFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
  });

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchByID();
  }

  fetchByID(): void {
    this.apiService.get(`company/${this.data.id}`).subscribe({
      next: (data) => {
        this.companyFormGroup.patchValue(data);
      },
    });
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('company', this.companyFormGroup.value).subscribe({
      next: (data: any) => {
        this.translateService
          .get('company__update__success')
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
