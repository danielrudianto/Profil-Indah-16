import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSelectorComponent } from './product-selector.component';

describe('ProductSelectorComponent', () => {
  let component: ProductSelectorComponent;
  let fixture: ComponentFixture<ProductSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ProductSelectorComponent]
});
    fixture = TestBed.createComponent(ProductSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
