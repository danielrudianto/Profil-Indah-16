import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceArchiveFilterComponent } from './purchase-invoice-archive-filter.component';

describe('PurchaseInvoiceArchiveFilterComponent', () => {
  let component: PurchaseInvoiceArchiveFilterComponent;
  let fixture: ComponentFixture<PurchaseInvoiceArchiveFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [PurchaseInvoiceArchiveFilterComponent]
});
    fixture = TestBed.createComponent(PurchaseInvoiceArchiveFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
