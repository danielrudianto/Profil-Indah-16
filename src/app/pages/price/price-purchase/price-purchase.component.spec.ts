import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricePurchaseComponent } from './price-purchase.component';

describe('PricePurchaseComponent', () => {
  let component: PricePurchaseComponent;
  let fixture: ComponentFixture<PricePurchaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [PricePurchaseComponent]
});
    fixture = TestBed.createComponent(PricePurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
