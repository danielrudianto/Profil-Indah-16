import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProductSalesPriceComponent } from './update-product-sales-price.component';

describe('UpdateProductSalesPriceComponent', () => {
  let component: UpdateProductSalesPriceComponent;
  let fixture: ComponentFixture<UpdateProductSalesPriceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [UpdateProductSalesPriceComponent]
});
    fixture = TestBed.createComponent(UpdateProductSalesPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
