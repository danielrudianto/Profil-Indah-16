import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceComponent } from './purchase-invoice.component';

describe('PurchaseInvoiceComponent', () => {
  let component: PurchaseInvoiceComponent;
  let fixture: ComponentFixture<PurchaseInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseInvoiceComponent]
    });
    fixture = TestBed.createComponent(PurchaseInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
