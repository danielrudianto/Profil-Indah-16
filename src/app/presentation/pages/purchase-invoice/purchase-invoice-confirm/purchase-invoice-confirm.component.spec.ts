import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceConfirmComponent } from './purchase-invoice-confirm.component';

describe('PurchaseInvoiceConfirmComponent', () => {
  let component: PurchaseInvoiceConfirmComponent;
  let fixture: ComponentFixture<PurchaseInvoiceConfirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseInvoiceConfirmComponent]
    });
    fixture = TestBed.createComponent(PurchaseInvoiceConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
