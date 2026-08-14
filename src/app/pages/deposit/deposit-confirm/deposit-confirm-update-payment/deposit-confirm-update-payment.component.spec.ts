import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositConfirmUpdatePaymentComponent } from './deposit-confirm-update-payment.component';

describe('DepositConfirmUpdatePaymentComponent', () => {
  let component: DepositConfirmUpdatePaymentComponent;
  let fixture: ComponentFixture<DepositConfirmUpdatePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [DepositConfirmUpdatePaymentComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(DepositConfirmUpdatePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
