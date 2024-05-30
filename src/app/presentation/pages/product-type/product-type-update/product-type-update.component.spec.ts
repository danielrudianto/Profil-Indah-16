import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTypeUpdateComponent } from './product-type-update.component';

describe('ProductTypeUpdateComponent', () => {
  let component: ProductTypeUpdateComponent;
  let fixture: ComponentFixture<ProductTypeUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductTypeUpdateComponent]
    });
    fixture = TestBed.createComponent(ProductTypeUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
