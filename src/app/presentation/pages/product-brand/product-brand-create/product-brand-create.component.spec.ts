import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductBrandCreateComponent } from './product-brand-create.component';

describe('ProductBrandCreateComponent', () => {
  let component: ProductBrandCreateComponent;
  let fixture: ComponentFixture<ProductBrandCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ProductBrandCreateComponent]
});
    fixture = TestBed.createComponent(ProductBrandCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
