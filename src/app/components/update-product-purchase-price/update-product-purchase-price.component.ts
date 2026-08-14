import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-update-product-purchase-price',
    templateUrl: './update-product-purchase-price.component.html',
    styleUrls: ['./update-product-purchase-price.component.scss'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatSlideToggle, MatDialogActions, MatButton, TranslatePipe]
})
export class UpdateProductPurchasePriceComponent {
  constructor(
    private dialog: MatDialogRef<UpdateProductPurchasePriceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  @ViewChild('price') price: any;

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

  ngOnInit(): void {
    this.priceFormGroup.get('discount')?.valueChanges.subscribe((discount) => {
      this.calculateDiscountPercentage(discount);
    });

    this.priceFormGroup
      .get('discountPercentage')
      ?.valueChanges.subscribe((discountPercentage) => {
        this.calculateDiscount(discountPercentage);
      });

    this.priceFormGroup.get('price')?.valueChanges.subscribe((price) => {
      this.calculateDiscountPercentage(
        this.priceFormGroup.get('discount')?.value || 0
      );
    });
  }

  private calculateDiscountPercentage(discount: number) {
    const price = this.priceFormGroup.get('price')?.value || 0;
    const discountPercentage = price === 0 ? 0 : (discount * 100) / price;
    this.priceFormGroup
      .get('discountPercentage')
      ?.setValue(discountPercentage, { emitEvent: false });
  }

  private calculateDiscount(discountPercentage: number) {
    const price = this.priceFormGroup.get('price')?.value || 0;
    const discount = (discountPercentage * price) / 100;
    this.priceFormGroup
      .get('discount')
      ?.setValue(discount, { emitEvent: false });
  }

  ngAfterViewInit() {
    // Atur fokus setelah view direfresh
    setTimeout(() => {
      this.price.nativeElement.focus();
    });
  }

  closeSheet() {
    this.dialog.close(undefined);
  }

  savePurchasePrice() {
    this.dialog.close(this.priceFormGroup.value);
  }
}
