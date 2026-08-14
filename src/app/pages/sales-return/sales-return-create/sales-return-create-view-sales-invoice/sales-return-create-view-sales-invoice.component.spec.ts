import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturnCreateViewSalesInvoiceComponent } from './sales-return-create-view-sales-invoice.component';

describe('SalesReturnCreateViewSalesInvoiceComponent', () => {
  let component: SalesReturnCreateViewSalesInvoiceComponent;
  let fixture: ComponentFixture<SalesReturnCreateViewSalesInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [SalesReturnCreateViewSalesInvoiceComponent]
});
    fixture = TestBed.createComponent(SalesReturnCreateViewSalesInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
