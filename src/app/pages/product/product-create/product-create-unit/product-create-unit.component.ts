import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-product-create-unit',
    templateUrl: './product-create-unit.component.html',
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatDialogActions, MatButton, TranslatePipe]
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
