import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverpaymentReturnListComponent } from './overpayment-return-list.component';

describe('OverpaymentReturnListComponent', () => {
  let component: OverpaymentReturnListComponent;
  let fixture: ComponentFixture<OverpaymentReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [OverpaymentReturnListComponent]
})
    .compileComponents();

    fixture = TestBed.createComponent(OverpaymentReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
