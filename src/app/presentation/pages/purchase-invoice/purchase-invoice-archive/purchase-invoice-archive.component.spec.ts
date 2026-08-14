import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceArchiveComponent } from './purchase-invoice-archive.component';

describe('PurchaseInvoiceArchiveComponent', () => {
  let component: PurchaseInvoiceArchiveComponent;
  let fixture: ComponentFixture<PurchaseInvoiceArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [PurchaseInvoiceArchiveComponent]
});
    fixture = TestBed.createComponent(PurchaseInvoiceArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
