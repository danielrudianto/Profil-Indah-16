import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMethodUpdateComponent } from './payment-method-update.component';

describe('PaymentMethodUpdateComponent', () => {
  let component: PaymentMethodUpdateComponent;
  let fixture: ComponentFixture<PaymentMethodUpdateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentMethodUpdateComponent]
    });
    fixture = TestBed.createComponent(PaymentMethodUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
