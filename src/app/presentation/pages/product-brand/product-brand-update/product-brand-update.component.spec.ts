import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrandUpdateComponent } from './product-brand-update.component';

describe('ProductBrandUpdateComponent', () => {
  let component: ProductBrandUpdateComponent;
  let fixture: ComponentFixture<ProductBrandUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ProductBrandUpdateComponent]
});
    fixture = TestBed.createComponent(ProductBrandUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
