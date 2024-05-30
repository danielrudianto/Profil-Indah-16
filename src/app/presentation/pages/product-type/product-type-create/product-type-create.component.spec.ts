import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTypeCreateComponent } from './product-type-create.component';

describe('ProductTypeCreateComponent', () => {
  let component: ProductTypeCreateComponent;
  let fixture: ComponentFixture<ProductTypeCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductTypeCreateComponent]
    });
    fixture = TestBed.createComponent(ProductTypeCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
