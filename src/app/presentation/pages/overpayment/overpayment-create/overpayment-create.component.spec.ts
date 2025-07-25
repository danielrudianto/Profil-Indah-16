import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverpaymentCreateComponent } from './overpayment-create.component';

describe('OverpaymentCreateComponent', () => {
  let component: OverpaymentCreateComponent;
  let fixture: ComponentFixture<OverpaymentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OverpaymentCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverpaymentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
