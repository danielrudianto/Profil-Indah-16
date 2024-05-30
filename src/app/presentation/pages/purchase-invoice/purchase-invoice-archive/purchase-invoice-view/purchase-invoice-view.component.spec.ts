import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceViewComponent } from './purchase-invoice-view.component';

describe('PurchaseInvoiceViewComponent', () => {
  let component: PurchaseInvoiceViewComponent;
  let fixture: ComponentFixture<PurchaseInvoiceViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseInvoiceViewComponent]
    });
    fixture = TestBed.createComponent(PurchaseInvoiceViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
