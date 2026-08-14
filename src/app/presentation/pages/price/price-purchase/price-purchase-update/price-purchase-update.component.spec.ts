import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricePurchaseUpdateComponent } from './price-purchase-update.component';

describe('PricePurchaseUpdateComponent', () => {
  let component: PricePurchaseUpdateComponent;
  let fixture: ComponentFixture<PricePurchaseUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [PricePurchaseUpdateComponent]
});
    fixture = TestBed.createComponent(PricePurchaseUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
