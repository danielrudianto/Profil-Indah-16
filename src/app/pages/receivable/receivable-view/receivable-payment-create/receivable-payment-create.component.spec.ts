import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivablePaymentCreateComponent } from './receivable-payment-create.component';

describe('ReceivablePaymentCreateComponent', () => {
  let component: ReceivablePaymentCreateComponent;
  let fixture: ComponentFixture<ReceivablePaymentCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ReceivablePaymentCreateComponent]
});
    fixture = TestBed.createComponent(ReceivablePaymentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
