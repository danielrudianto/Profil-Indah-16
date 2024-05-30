import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-customer-update',
  templateUrl: './customer-update.component.html',
  styleUrls: ['./customer-update.component.css'],
})
export class CustomerUpdateComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  @Input('data') data: any;
  isOpened: boolean = false;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  customerFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
    pic: new FormControl('', Validators.required),
    phone_number: new FormControl(''),
  });

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchByID();
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`customer/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.customerFormGroup.patchValue(data);
        },
        error: (error) => {
          this.dynamicComponentService.closeDynamicComponent();
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('customer', this.customerFormGroup.value).subscribe({
      next: (data: any) => {
        this.alertService.showSuccess(
          `Customer ${data.name} updated successfully`
        );
        this.closeDialog();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
}
