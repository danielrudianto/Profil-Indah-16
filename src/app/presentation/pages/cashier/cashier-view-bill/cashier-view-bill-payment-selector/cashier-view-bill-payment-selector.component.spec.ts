import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierViewBillPaymentSelectorComponent } from './cashier-view-bill-payment-selector.component';

describe('CashierViewBillPaymentSelectorComponent', () => {
  let component: CashierViewBillPaymentSelectorComponent;
  let fixture: ComponentFixture<CashierViewBillPaymentSelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashierViewBillPaymentSelectorComponent]
    });
    fixture = TestBed.createComponent(CashierViewBillPaymentSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
