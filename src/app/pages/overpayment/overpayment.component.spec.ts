import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverpaymentComponent } from './overpayment.component';

describe('OverpaymentComponent', () => {
  let component: OverpaymentComponent;
  let fixture: ComponentFixture<OverpaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OverpaymentComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(OverpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
