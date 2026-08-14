import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-update-package-sales-price',
    templateUrl: './update-package-sales-price.component.html',
    styleUrls: ['./update-package-sales-price.component.css'],
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatSlideToggle, TranslateModule]
})
export class UpdatePackageSalesPriceComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private sheet: MatBottomSheetRef<UpdatePackageSalesPriceComponent>
  ) {}

  priceFormGroup: FormGroup = new FormGroup({
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    initial_price: new FormControl(0, [Validators.required, Validators.min(0)]),
    save_price: new FormControl(false),
  });

  ngOnInit(): void {
    this.priceFormGroup.patchValue(this.data);
  }

  updatePrice() {
    this.sheet.dismiss(this.priceFormGroup.value);
  }
}
