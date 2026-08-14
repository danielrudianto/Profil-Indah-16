import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCreateUnitComponent } from './product-create-unit.component';

describe('ProductCreateUnitComponent', () => {
  let component: ProductCreateUnitComponent;
  let fixture: ComponentFixture<ProductCreateUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ProductCreateUnitComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(ProductCreateUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
