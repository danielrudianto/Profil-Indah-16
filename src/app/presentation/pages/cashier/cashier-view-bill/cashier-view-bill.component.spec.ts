import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashierViewBillComponent } from './cashier-view-bill.component';

describe('CashierViewBillComponent', () => {
  let component: CashierViewBillComponent;
  let fixture: ComponentFixture<CashierViewBillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashierViewBillComponent]
    });
    fixture = TestBed.createComponent(CashierViewBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
