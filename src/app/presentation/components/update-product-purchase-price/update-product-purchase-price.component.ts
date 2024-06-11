import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-update-product-purchase-price',
  templateUrl: './update-product-purchase-price.component.html',
  styleUrls: ['./update-product-purchase-price.component.css'],
})
export class UpdateProductPurchasePriceComponent {
  constructor(
    private sheet: MatBottomSheetRef<UpdateProductPurchasePriceComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  subject = new BehaviorSubject<string | null>(null);

  priceFormGroup: FormGroup = new FormGroup({
    price: new FormControl(this.data.price, [
      Validators.required,
      Validators.min(0),
    ]),
    discount: new FormControl(this.data.discount, [
      Validators.required,
      Validators.min(0),
    ]),
    discountPercentage: new FormControl(
      this.data.price == 0 ? 0 : (this.data.discount * 100) / this.data.price,
      [Validators.required, Validators.min(0), Validators.max(100)]
    ),
    save_price: new FormControl(this.data.save_price),
  });

  setFocus(fieldName: string) {
    this.subject.next(fieldName);
  }

  unsetFocus() {
    this.subject.next(null);
  }

  ngOnInit(): void {
    this.subject
      .pipe(
        switchMap((value) => {
          if (value === 'absolute') {
            return this.priceFormGroup.controls['discount'].valueChanges;
          } else if (value === 'percentage') {
            return this.priceFormGroup.controls['discountPercentage']
              .valueChanges;
          } else if (value === 'price') {
            return this.priceFormGroup.controls['price'].valueChanges;
          } else {
            return new Observable(); // Handle the default case accordingly
          }
        })
      )
      .subscribe((value) => {
        if (this.subject.value === 'absolute') {
          this.priceFormGroup.controls['discountPercentage'].setValue(
            (value / this.priceFormGroup.controls['price'].value) * 100
          );
        } else if (this.subject.value === 'percentage') {
          this.priceFormGroup.controls['discount'].setValue(
            (this.priceFormGroup.controls['price'].value * value) / 100
          );
        } else if (this.subject.value === 'price') {
          this.priceFormGroup.controls['discountPercentage'].setValue(
            this.priceFormGroup.controls['price'].value === 0
              ? 0
              : (this.priceFormGroup.controls['discount'].value /
                  this.priceFormGroup.controls['price'].value) *
                  100
          );
        }
      });
  }

  closeSheet() {
    this.sheet.dismiss(undefined);
  }

  saveSheet() {
    this.sheet.dismiss(this.priceFormGroup.value);
  }
}
