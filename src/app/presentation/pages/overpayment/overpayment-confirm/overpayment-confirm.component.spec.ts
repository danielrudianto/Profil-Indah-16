import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverpaymentConfirmComponent } from './overpayment-confirm.component';

describe('OverpaymentConfirmComponent', () => {
  let component: OverpaymentConfirmComponent;
  let fixture: ComponentFixture<OverpaymentConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OverpaymentConfirmComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(OverpaymentConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
