import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrandComponent } from './product-brand.component';

describe('ProductBrandComponent', () => {
  let component: ProductBrandComponent;
  let fixture: ComponentFixture<ProductBrandComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductBrandComponent]
    });
    fixture = TestBed.createComponent(ProductBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
