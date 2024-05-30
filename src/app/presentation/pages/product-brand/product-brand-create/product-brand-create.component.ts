import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-product-brand-create',
  templateUrl: './product-brand-create.component.html',
  styleUrls: ['./product-brand-create.component.css'],
})
export class ProductBrandCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  isOpened: boolean = false;
  isSubmitting: boolean = false;
  brandFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.isOpened = true;
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService.post('product-brand', this.brandFormGroup.value).subscribe({
      next: (data: any) => {
        this.alertService.showSuccess(`${data.name} created successfully`);
        this.closeDialog();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  closeDialog(): void {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
