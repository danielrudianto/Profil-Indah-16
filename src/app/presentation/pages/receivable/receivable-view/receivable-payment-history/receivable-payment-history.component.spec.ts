import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivablePaymentHistoryComponent } from './receivable-payment-history.component';

describe('ReceivablePaymentHistoryComponent', () => {
  let component: ReceivablePaymentHistoryComponent;
  let fixture: ComponentFixture<ReceivablePaymentHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReceivablePaymentHistoryComponent]
    });
    fixture = TestBed.createComponent(ReceivablePaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
