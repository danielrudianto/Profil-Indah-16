import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceEditComponent } from './purchase-invoice-edit.component';

describe('PurchaseInvoiceEditComponent', () => {
  let component: PurchaseInvoiceEditComponent;
  let fixture: ComponentFixture<PurchaseInvoiceEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseInvoiceEditComponent]
    });
    fixture = TestBed.createComponent(PurchaseInvoiceEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
