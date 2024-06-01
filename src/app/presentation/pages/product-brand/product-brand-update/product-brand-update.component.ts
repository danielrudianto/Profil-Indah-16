import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-product-brand-update',
  templateUrl: './product-brand-update.component.html',
  styleUrls: ['./product-brand-update.component.css'],
})
export class ProductBrandUpdateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  @Input('data') data: any;
  isOpened: boolean = false;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  brandFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isOpened = true;
  }

  fetchByID(): void {
    this.apiService
      .get(`product-brand/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.brandFormGroup.patchValue(data);
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

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService.put('product-brand', this.brandFormGroup.value).subscribe({
      next: (data: any) => {
        this.alertService.showSuccess(`${data.name} created successfully`);
        this.closeDialog(data);
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  closeDialog(data: any = undefined): void {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }
}
