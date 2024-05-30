import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  @Input('data') data: any;
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

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('supplier', this.supplierFormGroup.value).subscribe({
      next: (data: any) => {
        this.alertService.showSuccess(
          `Supplier ${data.name} updated successfully`
        );
        this.closeDialog();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
}
