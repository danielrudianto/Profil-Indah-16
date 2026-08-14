import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePackageSalesPriceComponent } from './update-package-sales-price.component';

describe('UpdatePackageSalesPriceComponent', () => {
  let component: UpdatePackageSalesPriceComponent;
  let fixture: ComponentFixture<UpdatePackageSalesPriceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [UpdatePackageSalesPriceComponent]
});
    fixture = TestBed.createComponent(UpdatePackageSalesPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
