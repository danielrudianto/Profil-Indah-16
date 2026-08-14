import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-product-create-unit',
    templateUrl: './product-create-unit.component.html',
    styleUrl: './product-create-unit.component.css',
    standalone: false
})
export class ProductCreateUnitComponent {
  constructor(private dialog: MatDialogRef<ProductCreateUnitComponent>) {}

  formGroup: FormGroup = new FormGroup({
    unit: new FormControl('', Validators.required),
    conversion: new FormControl(1, [Validators.required, Validators.min(0.01)]),
    sales_price: new FormControl(0, [Validators.required, Validators.min(0)]),
    sales_discount: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    purchase_price: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    purchase_discount: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
  });

  onSubmit() {
    if (this.formGroup.valid) {
      this.dialog.close(this.formGroup.value);
    } else {
      this.formGroup.markAllAsTouched();
    }
  }
}
