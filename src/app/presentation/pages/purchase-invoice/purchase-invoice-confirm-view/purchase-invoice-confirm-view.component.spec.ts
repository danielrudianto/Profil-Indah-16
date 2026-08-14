import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceConfirmViewComponent } from './purchase-invoice-confirm-view.component';

describe('PurchaseInvoiceConfirmViewComponent', () => {
  let component: PurchaseInvoiceConfirmViewComponent;
  let fixture: ComponentFixture<PurchaseInvoiceConfirmViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [PurchaseInvoiceConfirmViewComponent]
});
    fixture = TestBed.createComponent(PurchaseInvoiceConfirmViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
