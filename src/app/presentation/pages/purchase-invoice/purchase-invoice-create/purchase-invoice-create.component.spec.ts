import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceCreateComponent } from './purchase-invoice-create.component';

describe('PurchaseInvoiceCreateComponent', () => {
  let component: PurchaseInvoiceCreateComponent;
  let fixture: ComponentFixture<PurchaseInvoiceCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [PurchaseInvoiceCreateComponent]
});
    fixture = TestBed.createComponent(PurchaseInvoiceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
