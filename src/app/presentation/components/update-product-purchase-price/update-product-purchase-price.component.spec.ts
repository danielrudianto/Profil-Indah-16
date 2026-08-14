import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProductPurchasePriceComponent } from './update-product-purchase-price.component';

describe('UpdateProductPurchasePriceComponent', () => {
  let component: UpdateProductPurchasePriceComponent;
  let fixture: ComponentFixture<UpdateProductPurchasePriceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [UpdateProductPurchasePriceComponent]
});
    fixture = TestBed.createComponent(UpdateProductPurchasePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
